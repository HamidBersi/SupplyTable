#!/usr/bin/env python3
"""
Replace data/suppliers.json and data/products.json from Inventaire Felicita
(.xlsx: one sheet per fournisseur + PU HT; PDF: emplacement / Endroit).

Emplacements: chaque onglet Excel est aligné avec le bloc PDF suivant « Tableau 1 »
(même ordre que le classeur), ligne à ligne — plus fiable que le seul matching par nom.

Catégories: libellés métier (Fruits et légumes, Boissons, …) déduits de la feuille,
de la section Excel et du nom.

Usage (paths optional):
  python3 scripts/import-felicita-inventory.py \\
    --xlsx "/mnt/c/Users/pc/Downloads/Inventaire 2025 Felicita .xlsx" \\
    --pdf "/mnt/c/Users/pc/Downloads/Inventaire 2025 Felicita .pdf"

Pour régénérer fournisseurs + produits depuis l’Excel tout en gardant les
emplacements déjà dans le dépôt (avant écrasement du JSON) :
  python3 scripts/import-felicita-inventory.py --keep-locations
  # ou : --preserve-locations-from /chemin/vers/products.json
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS_MAIN = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# Aligné sur lib/locations.ts
LOCATION_CANON = {
    "bar": "Bar",
    "frigo bas": "Frigots bas",
    "frigos bas": "Frigots bas",
    "frigots bas": "Frigots bas",
    "frigo haut": "Frigots hauts",
    "frigos haut": "Frigots hauts",
    "frigos hauts": "Frigots hauts",
    "frigots hauts": "Frigots hauts",
    "frigots haut": "Frigots hauts",
    "stock a": "Stock A",
    "réserve": "Réserve",
    "reserve": "Réserve",
    "nettoyage": "Nettoyage",
    "stock n a": "Nettoyage",
    "stock na": "Nettoyage",
    "congèle bas": "Congélateur bas",
    "congele bas": "Congélateur bas",
    "congèle haut": "Congélateur haut",
    "congele haut": "Congélateur haut",
    "congèle": "Congélateur haut",
    "congele": "Congélateur haut",
    "haut": "Congélateur haut",
    "bas": "Frigots bas",
    "glaces": "Congélateur haut",
}

# Aligné sur lib/product-categories.ts
PRODUCT_CATEGORIES = (
    "Fruits et légumes",
    "Boissons",
    "Alimentaire",
    "Surgelés",
    "Glaces",
    "Produits nettoyage",
    "Non alimentaire",
)


def slug(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "supplier"


def norm_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def is_euro_price(line: str) -> bool:
    return bool(re.match(r"^\d+([.,]\d+)?\s*€\s*$", line.strip()))


def canon_location(raw: str, nxt: str | None) -> str:
    a = norm_name(raw)
    b = norm_name(nxt) if nxt else ""
    if a == "pomona":
        return "Frigots bas"
    if raw.strip().lower() in ("congèle", "congele") and nxt:
        nl = nxt.strip().lower()
        if nl == "haut":
            return "Congélateur haut"
        if nl == "bas":
            return "Congélateur bas"
        if nl == "glaces":
            return "Congélateur haut"
    if a in LOCATION_CANON:
        return LOCATION_CANON[a]
    if a + " " + b in ("congèle haut", "congele haut"):
        return "Congélateur haut"
    if a + " " + b in ("congèle bas", "congele bas"):
        return "Congélateur bas"
    if a + " " + b in ("congèle glaces", "congele glaces"):
        return "Congélateur haut"
    if len(raw) < 40 and "€" not in raw and raw and not raw[0].isdigit():
        t = raw.strip()
        if re.match(r"^[A-Za-zÀ-ÿ0-9 .'\-]+$", t):
            if t in (
                "Bar",
                "Stock A",
                "Réserve",
                "Nettoyage",
                "Frigots bas",
                "Frigots hauts",
                "Congélateur bas",
                "Congélateur haut",
            ):
                return t
    return "Réserve"


def parse_pdf_table_body(body: list[str]) -> list[tuple[str, str, str]]:
    """Lignes après « Endroit » : retourne (norm_name, location, nom brut)."""
    out: list[tuple[str, str, str]] = []
    i = 0
    skip_headers = {
        "produits",
        "produit",
        "prix unitaire h t",
        "prix unitaires ht",
        "prix ht",
        "prix",
        "unitaires ht",
        "unitaire ht",
        "stock",
        "endroit",
        "fournisseur",
        "fornisseur",
        "tableau 1",
        "total",
        "ht",
    }

    while i < len(body):
        if re.match(r"^\d+([.,]\d+)?\s*$", body[i]) and i + 1 < len(body):
            if body[i + 1].isdigit() and len(body[i + 1]) < 4:
                i += 2
                continue

        name_parts: list[str] = []
        while i < len(body) and not is_euro_price(body[i]):
            seg = body[i]
            low = seg.lower()
            if low in skip_headers or seg == "Prix":
                i += 1
                continue
            if seg in ("unitaire", "unitaires", "Prix"):
                i += 1
                continue
            # Lignes parasites (Google Docs PDF) entre deux produits
            if "prix" in low and "unitaire" in low:
                i += 1
                continue
            # Titres de section (PDF Google Docs)
            if low in ("bar", "stock a"):
                i += 1
                continue
            if re.match(r"^[a-zà-ÿ0-9 '’\-\.]{1,60}:\s*$", low):
                i += 1
                continue
            name_parts.append(seg)
            i += 1
        if i >= len(body):
            break
        i += 1  # price line
        if not name_parts:
            continue
        raw_name = re.sub(r"\s+", " ", " ".join(name_parts).strip())
        if len(raw_name) < 2:
            continue
        if i >= len(body):
            break
        i += 1  # stock
        if i < len(body) and is_euro_price(body[i]):
            i += 1
        elif i < len(body) and re.match(r"^\d+([.,]\d+)?\s*$", body[i]):
            i += 1
        if i >= len(body):
            break
        loc_line = body[i]
        i += 1
        nxt = body[i] if i < len(body) else None
        loc = canon_location(loc_line, nxt)
        if loc_line.strip().lower() in ("congèle", "congele") and nxt and nxt.strip().lower() in (
            "haut",
            "bas",
            "glaces",
        ):
            i += 1
        if loc_line.strip() == "Pomona" and i < len(body) and body[i].strip().lower() == "frigo":
            i += 1
        if i < len(body) and body[i].strip() == "Pomona":
            i += 1
        out.append((norm_name(raw_name), loc, raw_name))
    return out


def extract_pdf_blocks(pdf_path: Path) -> list[list[tuple[str, str, str]]]:
    """Un bloc par tableau PDF (avec colonne Endroit), ordre = ordre des feuilles Excel."""
    txt = subprocess.check_output(
        ["pdftotext", str(pdf_path), "-"], text=True, errors="replace"
    )
    raw_lines = [ln.strip() for ln in txt.splitlines()]
    lines = [ln for ln in raw_lines if ln]
    joined = "\n".join(lines)
    parts = re.split(r"\bTableau 1\b", joined)
    blocks: list[list[tuple[str, str, str]]] = []
    for part in parts:
        chunk = [ln.strip() for ln in part.splitlines() if ln.strip()]
        if "Endroit" not in chunk:
            continue
        idx = chunk.index("Endroit")
        body = chunk[idx + 1 :]
        pairs = parse_pdf_table_body(body)
        if pairs:
            blocks.append(pairs)
    return blocks


def pdf_location_lookup(blocks: list[list[tuple[str, str, str]]]) -> dict[str, str]:
    """Dernier emplacement gagnant par nom normalisé (repli si décalage d’index)."""
    merged: dict[str, str] = {}
    for block in blocks:
        for nkey, loc, _ in block:
            merged[nkey] = loc
    return merged


def read_xlsx_products(xlsx_path: Path) -> list[tuple[str, list[dict]]]:
    """(sheet_name, [{name, unitPrice, stock, section}]). section = dernière ligne-titre sans prix."""
    out: list[tuple[str, list[dict]]] = []
    with zipfile.ZipFile(xlsx_path) as z:
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target: dict[str, str] = {}
        for rel in rels:
            rid, target = rel.attrib.get("Id"), rel.attrib.get("Target")
            if rid and target:
                rid_to_target[rid] = "xl/" + target.lstrip("/")

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheet_entries: list[tuple[str, str | None]] = []
        for sh in wb.findall(f".//{NS_MAIN}sheet"):
            name = (sh.attrib.get("name") or "").strip()
            rid = sh.attrib.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            sheet_entries.append((name, rid_to_target.get(rid)))

        ss: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall(f".//{NS_MAIN}si"):
                parts: list[str] = []
                for t in si.iter(f"{NS_MAIN}t"):
                    if t.text:
                        parts.append(t.text)
                ss.append("".join(parts))

        def col_row(cell_ref: str) -> tuple[str, int]:
            col, row = "", ""
            for c in cell_ref:
                if c.isalpha():
                    col += c
                else:
                    row += c
            return col, int(row)

        def col_to_idx(col: str) -> int:
            n = 0
            for ch in col:
                n = n * 26 + (ord(ch.upper()) - 64)
            return n - 1

        def cell_value(c: ET.Element) -> str:
            t = c.attrib.get("t")
            v = c.find(f"{NS_MAIN}v")
            if v is None or v.text is None:
                is_el = c.find(f"{NS_MAIN}is")
                if is_el is not None:
                    ts = is_el.findall(f".//{NS_MAIN}t")
                    return "".join((t.text or "") for t in ts)
                return ""
            if t == "s":
                return ss[int(v.text)]
            return v.text

        for sheet_name, sheet_path in sheet_entries:
            if not sheet_path or sheet_path not in z.namelist():
                continue
            root = ET.fromstring(z.read(sheet_path))
            rows: dict[int, dict[int, str]] = {}
            for c in root.findall(f".//{NS_MAIN}c"):
                ref = c.attrib.get("r")
                if not ref:
                    continue
                col, row = col_row(ref)
                rows.setdefault(row, {})[col_to_idx(col)] = cell_value(c)

            plist: list[dict] = []
            current_section = ""
            for r in sorted(rows):
                line = rows[r]
                if r <= 2:
                    continue
                name = (line.get(0) or "").strip()
                price_s = (line.get(1) or "").strip().replace(" ", "").replace(",", ".")
                stock = (line.get(2) or "").strip()
                if not name:
                    continue
                try:
                    price = float(price_s)
                except ValueError:
                    current_section = name
                    continue
                if price <= 0 or price > 8000:
                    continue
                plist.append(
                    {
                        "name": name,
                        "unitPrice": price,
                        "stock": stock,
                        "section": current_section,
                    }
                )
            out.append((sheet_name, plist))
    return out


def guess_unit(stock: str) -> str:
    u = stock.upper()
    if "CART" in u or "COLIS" in u:
        return "COL"
    if "KG" in u:
        return "KG"
    if "PAQUET" in u or "PAQ" in u:
        return "PAQ"
    if "L" in u and re.search(r"\d+\s*L", u):
        return "L"
    if "BQT" in u or "BARQUET" in u:
        return "BQT"
    if "SACHET" in u or "SAC" in u:
        return "SAC"
    if "PI" in u or "PIECE" in u:
        return "PI"
    if "BT" in u or "BOUT" in u:
        return "BT"
    return "UN"


def infer_category(sheet_slug: str, section: str, name: str, location: str) -> str:
    n = norm_name(name)
    sec = norm_name(section)

    if "pomona" in sheet_slug or "legumes" in sheet_slug or "fruits-et" in sheet_slug:
        return "Fruits et légumes"

    if "adelya" in sheet_slug or "hygiene" in sheet_slug:
        if any(
            x in n
            for x in (
                "papier wc",
                "papier toilette",
            )
        ):
            return "Produits nettoyage"
        if any(
            x in n
            for x in (
                "film",
                "sac 130",
                "bobine",
                "essuie",
            )
        ):
            return "Non alimentaire"
        return "Produits nettoyage"

    ice_kw = ("glace", "sorbet", "ice ", "magnum", "cornetto", "frozen", "gelato")
    if any(k in n for k in ice_kw):
        return "Glaces"
    if any(k in sec for k in ("glace", "sorbet", "dessert glace")):
        return "Glaces"

    if location.startswith("Congélateur"):
        if any(k in n for k in ice_kw):
            return "Glaces"
        return "Surgelés"

    if sheet_slug in ("rega", "vita-impex-boissons", "distri-cafe"):
        return "Boissons"

    if "epicerie" in sheet_slug:
        return "Alimentaire"

    if "froberest" in sheet_slug or "essentiel" in sheet_slug or "iller" in sheet_slug:
        if any(
            k in n
            for k in (
                "surgele",
                "surgel",
                "congel",
                "frites",
                "mccain",
                "basilic sachet",
                "mangue chunk",
            )
        ):
            return "Surgelés"
        if sec and any(k in sec for k in ("surgele", "surgel", "congel", "glace")):
            return "Surgelés"
        return "Alimentaire"

    return "Alimentaire"


def resolve_location(
    idx: int,
    name: str,
    block: list[tuple[str, str, str]] | None,
    loc_map: dict[str, str],
    use_index: bool,
) -> str:
    key = norm_name(name)
    if use_index and block and idx < len(block):
        return block[idx][1]
    if key in loc_map:
        return loc_map[key]
    best = None
    best_len = 0
    for pk, pl in loc_map.items():
        if pk in key or key in pk:
            ln = min(len(pk), len(key))
            if ln > best_len:
                best_len = ln
                best = pl
    return best or "Réserve"


def load_preserved_locations(path: Path) -> tuple[dict[str, str], dict[tuple[str, str], str]]:
    """Maps: product id -> location, (supplierId, norm_name) -> location."""
    by_id: dict[str, str] = {}
    by_supplier_name: dict[tuple[str, str], str] = {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    for p in raw:
        if not isinstance(p, dict):
            continue
        loc = p.get("location")
        if not isinstance(loc, str) or not loc.strip():
            continue
        loc = loc.strip()
        pid = p.get("id")
        if isinstance(pid, str):
            by_id[pid] = loc
        sup = p.get("supplierId")
        name = p.get("name")
        if isinstance(sup, str) and isinstance(name, str) and name.strip():
            by_supplier_name[(sup, norm_name(name))] = loc
    return by_id, by_supplier_name


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--xlsx",
        type=Path,
        default=Path("/mnt/c/Users/pc/Downloads/Inventaire 2025 Felicita .xlsx"),
    )
    ap.add_argument(
        "--pdf",
        type=Path,
        default=Path("/mnt/c/Users/pc/Downloads/Inventaire 2025 Felicita .pdf"),
    )
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument(
        "--keep-locations",
        action="store_true",
        help="Réutiliser les emplacements de data/products.json (sous --root) pour les produits reconnus.",
    )
    ap.add_argument(
        "--preserve-locations-from",
        type=Path,
        default=None,
        metavar="PATH",
        help="JSON produits dont on reprend les champs location (prioritaire sur --keep-locations).",
    )
    args = ap.parse_args()

    preserve_path: Path | None = args.preserve_locations_from
    if preserve_path is None and args.keep_locations:
        preserve_path = args.root / "data" / "products.json"
    preserve_by_id: dict[str, str] = {}
    preserve_by_supplier_name: dict[tuple[str, str], str] = {}
    if preserve_path is not None:
        pth = preserve_path if preserve_path.is_absolute() else args.root / preserve_path
        if pth.is_file():
            preserve_by_id, preserve_by_supplier_name = load_preserved_locations(pth)
            print(
                f"Preserving locations from {pth} "
                f"({len(preserve_by_id)} ids, {len(preserve_by_supplier_name)} supplier+name keys)."
            )
        elif args.keep_locations or args.preserve_locations_from is not None:
            print(f"Warning: preserve locations file missing, ignoring: {pth}")

    blocks = extract_pdf_blocks(args.pdf)
    loc_map = pdf_location_lookup(blocks)
    sheets = read_xlsx_products(args.xlsx)

    if len(blocks) != len(sheets):
        print(
            f"Warning: {len(blocks)} blocs PDF « Endroit » vs {len(sheets)} feuilles Excel — "
            "alignement par index peut être partiel."
        )

    suppliers: list[dict] = []
    products: list[dict] = []
    seen_loc: set[str] = set()
    mismatch = 0
    reused_loc = 0

    for si, (sheet_name, plist) in enumerate(sheets):
        sid = slug(sheet_name)
        block = blocks[si] if si < len(blocks) else None
        use_index = block is not None and len(block) == len(plist)
        suppliers.append(
            {
                "id": sid,
                "name": sheet_name,
                "phone": "",
                "orderEmail": "",
            }
        )
        for idx, row in enumerate(plist):
            name = row["name"]
            key = norm_name(name)
            code = f"{idx + 1:03d}"
            pid = f"{sid}-{code}"
            loc_pdf = resolve_location(idx, name, block, loc_map, use_index)
            prev_loc = preserve_by_id.get(pid) or preserve_by_supplier_name.get((sid, key))
            loc = prev_loc or loc_pdf
            if prev_loc:
                reused_loc += 1
            seen_loc.add(loc)
            if use_index and block and idx < len(block):
                bn = block[idx][0]
                if bn != key and bn not in key and key not in bn:
                    mismatch += 1
            cat = infer_category(sid, row.get("section", ""), name, loc)
            if cat not in PRODUCT_CATEGORIES:
                cat = "Alimentaire"
            products.append(
                {
                    "id": pid,
                    "supplierId": sid,
                    "code": code,
                    "name": name,
                    "category": cat,
                    "location": loc,
                    "unit": guess_unit(row.get("stock", "")),
                    "unitPrice": round(float(row["unitPrice"]), 4),
                }
            )

    (args.root / "data" / "suppliers.json").write_text(
        json.dumps(suppliers, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (args.root / "data" / "products.json").write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Wrote {len(suppliers)} suppliers, {len(products)} products.")
    print("Locations used:", sorted(seen_loc))
    print(f"Index/name PDF mismatches (approx): {mismatch}")
    if preserve_path is not None and (preserve_by_id or preserve_by_supplier_name):
        print(f"Locations reused from previous products file: {reused_loc}")


if __name__ == "__main__":
    main()
