"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/supply";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { useDialog } from "@/lib/use-dialog";
import { sentenceCaseFr } from "@/lib/text";

export type ProductEditValues = {
  name: string;
  category: string;
  location: string;
  unitPrice: number;
};

type Props = {
  product: Product | null;
  /** Nom d’origine (fichier / saisie), pour rappel sous le champ. */
  originalName?: string;
  open: boolean;
  onClose: () => void;
  onSave: (productId: string, values: ProductEditValues) => void;
};

export function EditProductModal({
  product,
  originalName,
  open,
  onClose,
  onSave,
}: Props) {
  const dialogRef = useDialog(open, onClose);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [location, setLocation] = useState<string>(STORAGE_LOCATIONS[0]);
  const [priceText, setPriceText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !product) return;
    setName(product.name);
    setCategory(product.category);
    setLocation(product.location);
    setPriceText(
      product.unitPrice > 0
        ? String(product.unitPrice).replace(".", ",")
        : "",
    );
    setErr(null);
  }, [open, product]);

  const submit = () => {
    if (!product) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Indiquez un nom de produit.");
      return;
    }
    let unitPrice = 0;
    const pt = priceText.trim().replace(",", ".");
    if (pt !== "") {
      const n = Number(pt);
      if (!Number.isFinite(n) || n < 0) {
        setErr("Prix invalide.");
        return;
      }
      unitPrice = n;
    }
    onSave(product.id, {
      name: sentenceCaseFr(trimmed),
      category,
      location,
      unitPrice,
    });
    onClose();
  };

  const categoryOptions = PRODUCT_CATEGORIES.includes(
    category as (typeof PRODUCT_CATEGORIES)[number],
  )
    ? PRODUCT_CATEGORIES
    : [category, ...PRODUCT_CATEGORIES];

  const locationOptions = STORAGE_LOCATIONS.includes(
    location as (typeof STORAGE_LOCATIONS)[number],
  )
    ? STORAGE_LOCATIONS
    : [location, ...STORAGE_LOCATIONS];

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,28rem)] max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col"
      >
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Modifier le produit</h2>
          <p className="mt-1 text-sm text-muted">
            Les changements restent locaux (navigateur) — le fichier fournisseur
            n’est pas modifié.
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block text-sm font-medium">
            Nom
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr(null);
              }}
              className="field-input mt-1 w-full"
              autoFocus
            />
            {originalName &&
            originalName.trim() !== name.trim() &&
            originalName.trim() !== "" ? (
              <span className="mt-1 block text-xs text-muted">
                Origine : {sentenceCaseFr(originalName)}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium">
            Catégorie
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-select mt-1 w-full"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {sentenceCaseFr(c)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Emplacement
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="field-select mt-1 w-full"
            >
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {sentenceCaseFr(loc)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Prix unitaire HT
            <input
              type="text"
              inputMode="decimal"
              value={priceText}
              onChange={(e) => {
                setPriceText(e.target.value);
                setErr(null);
              }}
              placeholder="—"
              className="field-input mt-1 w-full"
            />
          </label>

          {err ? (
            <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </form>
    </dialog>
  );
}
