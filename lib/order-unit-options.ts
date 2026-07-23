import type { Product } from "@/types/supply";

export type OrderUnitOption = {
  id: string;
  abbrev: string;
  label: string;
};

export type OrderUnitProfile = {
  key: string;
  units: readonly OrderUnitOption[];
  defaultUnitId: string;
};

const U = {
  KG: { id: "KG", abbrev: "KG", label: "Kilo" },
  UN: { id: "UN", abbrev: "UN", label: "Unité" },
  COL: { id: "COL", abbrev: "Col", label: "Colis" },
  PQT: { id: "PQT", abbrev: "PQT", label: "Paquet" },
  CTN: { id: "CTN", abbrev: "Ctn", label: "Carton" },
  BT: { id: "BT", abbrev: "Bt", label: "Botte" },
  BQT: { id: "BQT", abbrev: "Bqt", label: "Botte / bouquet" },
  PLT: { id: "PLT", abbrev: "Plt", label: "Plateau" },
  BTE: { id: "BTE", abbrev: "Bte", label: "Boîte" },
  PI: { id: "PI", abbrev: "PI", label: "Pièce" },
  L: { id: "L", abbrev: "L", label: "Litre" },
  SAC: { id: "SAC", abbrev: "Sac", label: "Sac" },
} as const satisfies Record<string, OrderUnitOption>;

const byId = new Map<string, OrderUnitOption>(
  Object.values(U).map((o) => [o.id, o]),
);

/** Surcharge par produit (ex. raviolis). */
const PRODUCT_PROFILES: Record<string, OrderUnitProfile> = {
  "vita-impex-epicerie-006": {
    key: "product:vita-impex-epicerie-006",
    units: [U.PQT, U.CTN],
    defaultUnitId: U.CTN.id,
  },
};

const MANUAL_UNIT_TO_OPTION: Record<string, OrderUnitOption> = {
  Unité: U.UN,
  Kilo: U.KG,
  Botte: U.BT,
  Colis: U.COL,
  Plateau: U.PLT,
  Boîte: U.BTE,
  Carton: U.CTN,
  Paquet: U.PQT,
};

function dedupeUnits(list: readonly OrderUnitOption[]): OrderUnitOption[] {
  const seen = new Map<string, OrderUnitOption>();
  for (const u of list) seen.set(u.id, u);
  return [...seen.values()];
}

function optionFromCatalogCode(code: string): OrderUnitOption {
  return (
    byId.get(code) ?? {
      id: code,
      abbrev: code.length <= 4 ? code : code.slice(0, 4),
      label: code,
    }
  );
}

/** Options de base selon le code unité du fichier fournisseur. */
function baseUnitsForCatalogCode(code: string): {
  units: OrderUnitOption[];
  defaultUnitId: string;
} {
  const native = optionFromCatalogCode(code);

  switch (code) {
    case "KG":
    case "KILO":
      return {
        units: [U.KG, U.UN, U.COL, U.SAC],
        defaultUnitId: U.KG.id,
      };
    case "UN":
      return {
        units: [U.UN, U.COL, U.PQT, U.CTN],
        defaultUnitId: U.UN.id,
      };
    case "COL":
      return {
        units: [U.COL, U.CTN, U.UN],
        defaultUnitId: U.COL.id,
      };
    case "PAQ":
      return {
        units: [U.PQT, U.CTN, U.UN],
        defaultUnitId: U.PQT.id,
      };
    case "BT":
      return {
        units: [U.BT, U.UN, U.COL],
        defaultUnitId: U.BT.id,
      };
    case "BQT":
      return {
        units: [U.BQT, U.UN, U.KG, U.COL],
        defaultUnitId: U.BQT.id,
      };
    case "PLT":
      return {
        units: [U.PLT, U.UN, U.COL],
        defaultUnitId: U.PLT.id,
      };
    case "BTE":
      return {
        units: [U.BTE, U.UN, U.COL],
        defaultUnitId: U.BTE.id,
      };
    case "PI":
      return {
        units: [U.PI, U.UN, U.COL, U.PQT],
        defaultUnitId: U.PI.id,
      };
    case "L":
      return {
        units: [U.L, U.UN, U.COL],
        defaultUnitId: U.L.id,
      };
    case "SAC":
      return {
        units: [U.SAC, U.KG, U.COL, U.UN],
        defaultUnitId: U.SAC.id,
      };
    default:
      return {
        units: dedupeUnits([native, U.UN, U.COL]),
        defaultUnitId: native.id,
      };
  }
}

/** Affinage par catégorie métier. */
function applyCategoryRules(
  category: string,
  code: string,
  base: { units: OrderUnitOption[]; defaultUnitId: string },
): OrderUnitProfile {
  let units = [...base.units];
  let defaultUnitId = base.defaultUnitId;

  switch (category) {
    case "Fruits et légumes":
      units = dedupeUnits([U.KG, U.UN, U.COL, U.BQT, U.BT, ...units]);
      if (code === "KG") defaultUnitId = U.KG.id;
      else if (code === "BQT") defaultUnitId = U.BQT.id;
      else if (code === "BT") defaultUnitId = U.BT.id;
      else if (code === "UN") defaultUnitId = U.UN.id;
      break;

    case "Poissons":
      units = dedupeUnits([U.KG, U.UN, U.COL, U.PQT, ...units]);
      if (code === "KG") defaultUnitId = U.KG.id;
      else if (code === "UN") defaultUnitId = U.UN.id;
      else if (code === "PAQ" || code === "PQT") defaultUnitId = U.PQT.id;
      break;

    case "Boissons":
      units = dedupeUnits([U.COL, U.UN, U.CTN, ...units]);
      defaultUnitId = code === "UN" ? U.UN.id : U.COL.id;
      break;

    case "Surgelés":
      units = dedupeUnits([U.PQT, U.CTN, U.COL, U.UN, U.KG, ...units]);
      if (code === "UN") defaultUnitId = U.CTN.id;
      else if (code === "PAQ") defaultUnitId = U.PQT.id;
      else if (code === "KG") defaultUnitId = U.KG.id;
      break;

    case "Glaces":
      units = dedupeUnits([U.COL, U.CTN, U.UN, U.PQT, ...units]);
      defaultUnitId = code === "COL" ? U.COL.id : U.CTN.id;
      break;

    case "Alimentaire":
      if (code === "UN") {
        units = dedupeUnits([U.UN, U.PQT, U.CTN, U.COL]);
        defaultUnitId = U.UN.id;
      } else if (code === "PAQ") {
        units = dedupeUnits([U.PQT, U.CTN, U.UN]);
        defaultUnitId = U.PQT.id;
      } else if (code === "PI") {
        units = dedupeUnits([U.PI, U.UN, U.COL, U.PQT]);
        defaultUnitId = U.PI.id;
      } else {
        units = dedupeUnits([...units, U.UN, U.COL]);
      }
      break;

    case "Produits nettoyage":
      units = dedupeUnits([U.UN, U.COL, U.BTE, ...units]);
      defaultUnitId = code === "COL" ? U.COL.id : U.UN.id;
      break;

    case "Non alimentaire":
      units = dedupeUnits([U.UN, U.COL, U.CTN, ...units]);
      defaultUnitId = code === "COL" ? U.COL.id : U.UN.id;
      break;

    default:
      units = dedupeUnits([...units, U.UN, U.COL]);
      break;
  }

  return {
    key: `cat:${category}:${code}`,
    units,
    defaultUnitId,
  };
}

function profileForManualProduct(
  product: Product,
  category: string,
): OrderUnitProfile {
  const manualUnit = product.unit.trim();
  const mapped =
    MANUAL_UNIT_TO_OPTION[manualUnit] ?? optionFromCatalogCode(manualUnit);

  const base = baseUnitsForCatalogCode(mapped.id);
  const withNative = {
    units: dedupeUnits([mapped, ...base.units]),
    defaultUnitId: mapped.id,
  };

  if (category === "Fruits et légumes") {
    return applyCategoryRules(category, mapped.id, withNative);
  }

  return {
    key: `manual:${category}:${mapped.id}`,
    units: withNative.units,
    defaultUnitId: withNative.defaultUnitId,
  };
}

/** Clé stable pour les préférences « déf. » (survit aux changements de libellés). */
export function orderUnitProfileKey(product: Product): string {
  const category = product.category.trim().toLowerCase() || "autre";
  const code = product.unit.trim().toUpperCase() || "UN";
  return `${category}:${code}`;
}

export function getOrderUnitProfile(product: Product): OrderUnitProfile {
  const custom = PRODUCT_PROFILES[product.id];
  if (custom) return custom;

  const code = product.unit.trim().toUpperCase();
  const category = product.category.trim() || "Autre";

  if (product.isManual) {
    const manual = profileForManualProduct(product, category);
    return { ...manual, key: orderUnitProfileKey(product) };
  }

  const base = baseUnitsForCatalogCode(code);
  const profile = applyCategoryRules(category, code, base);
  return { ...profile, key: orderUnitProfileKey(product) };
}

export function getOrderUnitOption(unitId: string): OrderUnitOption {
  return (
    byId.get(unitId) ?? {
      id: unitId,
      abbrev: unitId.length <= 4 ? unitId : unitId.slice(0, 4),
      label: unitId,
    }
  );
}

/** Unité effective pour la commande (id interne). */
export function resolveOrderUnitId(
  product: Product,
  productUnits: Record<string, string>,
): string {
  const profile = getOrderUnitProfile(product);

  const perProduct = productUnits[product.id]?.trim();
  if (perProduct && profile.units.some((u) => u.id === perProduct)) {
    return perProduct;
  }

  return profile.defaultUnitId;
}

/** Libellé envoyé dans l’e-mail / historique. */
export function orderUnitLabel(unitId: string): string {
  return getOrderUnitOption(unitId).label;
}

export function orderUnitAbbrev(unitId: string): string {
  return getOrderUnitOption(unitId).abbrev;
}
