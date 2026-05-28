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

const PROFILES = {
  fruitsLegumes: {
    key: "category:fruits-legumes",
    units: [U.KG, U.UN, U.COL],
    defaultUnitId: U.KG.id,
  },
  paquet: {
    key: "catalog:paq",
    units: [U.PQT, U.CTN],
    defaultUnitId: U.PQT.id,
  },
  colis: {
    key: "catalog:col",
    units: [U.COL],
    defaultUnitId: U.COL.id,
  },
  kilo: {
    key: "catalog:kg",
    units: [U.KG],
    defaultUnitId: U.KG.id,
  },
  botte: {
    key: "catalog:bt",
    units: [U.BT, U.UN],
    defaultUnitId: U.BT.id,
  },
  bouquet: {
    key: "catalog:bqt",
    units: [U.BQT, U.UN, U.COL],
    defaultUnitId: U.BQT.id,
  },
  unite: {
    key: "catalog:un",
    units: [U.UN],
    defaultUnitId: U.UN.id,
  },
  boissons: {
    key: "category:boissons",
    units: [U.COL, U.UN],
    defaultUnitId: U.COL.id,
  },
  plateau: {
    key: "catalog:plt",
    units: [U.PLT, U.UN],
    defaultUnitId: U.PLT.id,
  },
  boite: {
    key: "catalog:bte",
    units: [U.BTE, U.UN],
    defaultUnitId: U.BTE.id,
  },
} as const satisfies Record<string, OrderUnitProfile>;

const MANUAL_UNIT_TO_OPTION: Record<string, OrderUnitOption> = {
  Unité: U.UN,
  Kilo: U.KG,
  Botte: U.BT,
  Colis: U.COL,
  Plateau: U.PLT,
  Boîte: U.BTE,
  Carton: U.CTN,
};

export function getOrderUnitProfile(product: Product): OrderUnitProfile {
  const custom = PRODUCT_PROFILES[product.id];
  if (custom) return custom;

  if (product.isManual) {
    if (product.category === "Fruits et légumes") {
      return PROFILES.fruitsLegumes;
    }
    const opt =
      MANUAL_UNIT_TO_OPTION[product.unit.trim()] ??
      ({
        id: product.unit.trim(),
        abbrev: product.unit.trim().slice(0, 4).toUpperCase(),
        label: product.unit.trim(),
      } satisfies OrderUnitOption);
    return {
      key: `manual:${opt.id}`,
      units: [opt],
      defaultUnitId: opt.id,
    };
  }

  if (product.category === "Fruits et légumes") {
    return PROFILES.fruitsLegumes;
  }
  if (product.category === "Boissons") {
    return PROFILES.boissons;
  }

  const code = product.unit.trim().toUpperCase();
  switch (code) {
    case "PAQ":
      return PROFILES.paquet;
    case "COL":
      return PROFILES.colis;
    case "KG":
    case "KILO":
      return PROFILES.kilo;
    case "BT":
      return PROFILES.botte;
    case "BQT":
      return PROFILES.bouquet;
    case "PLT":
      return PROFILES.plateau;
    case "BTE":
      return PROFILES.boite;
    case "UN":
      return PROFILES.unite;
    default: {
      const label = code || "UN";
      return {
        key: `catalog:${label.toLowerCase()}`,
        units: [{ id: label, abbrev: label, label }],
        defaultUnitId: label,
      };
    }
  }
}

export function getOrderUnitOption(unitId: string): OrderUnitOption {
  return (
    byId.get(unitId) ?? {
      id: unitId,
      abbrev: unitId,
      label: unitId,
    }
  );
}

/** Unité effective pour la commande (id interne). */
export function resolveOrderUnitId(
  product: Product,
  sessionUnits: Record<string, string>,
  savedDefaults: Record<string, string>,
): string {
  const profile = getOrderUnitProfile(product);
  const session = sessionUnits[product.id]?.trim();
  if (session && profile.units.some((u) => u.id === session)) return session;
  const saved = savedDefaults[profile.key]?.trim();
  if (saved && profile.units.some((u) => u.id === saved)) return saved;
  return profile.defaultUnitId;
}

/** Libellé envoyé dans l’e-mail / historique. */
export function orderUnitLabel(unitId: string): string {
  return getOrderUnitOption(unitId).label;
}

export function orderUnitAbbrev(unitId: string): string {
  return getOrderUnitOption(unitId).abbrev;
}
