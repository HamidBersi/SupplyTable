const STORAGE_KEY = "supply-table:order-selection-v2";

/** @deprecated v1 — migré automatiquement au chargement. */
const LEGACY_SELECTION_KEY = "supply-table:order-selection-v1";
const LEGACY_DEFAULTS_KEY = "supply-table:order-unit-defaults";

export type OrderSelectionSnapshot = {
  quantities: Record<string, number>;
  /** Unité choisie explicitement par produit (prioritaire). */
  orderUnits: Record<string, string>;
  /** Case « déf. » par type de produit (catégorie + code catalogue). */
  profileUnitDefaults: Record<string, string>;
  updatedAt: string;
};

function emptySnapshot(): OrderSelectionSnapshot {
  return {
    quantities: {},
    orderUnits: {},
    profileUnitDefaults: {},
    updatedAt: new Date(0).toISOString(),
  };
}

function normalizeQuantities(
  raw: Record<string, unknown> | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [id, n] of Object.entries(raw)) {
    if (typeof n === "number" && Number.isFinite(n) && n > 0) {
      out[id] = Math.floor(n);
    }
  }
  return out;
}

function normalizeUnits(
  raw: Record<string, unknown> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const [id, u] of Object.entries(raw)) {
    if (typeof u === "string" && u.trim()) out[id] = u.trim();
  }
  return out;
}

function safeParse(raw: string | null): OrderSelectionSnapshot | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    return {
      quantities: normalizeQuantities(
        o.quantities as Record<string, unknown> | undefined,
      ),
      orderUnits: normalizeUnits(
        o.orderUnits as Record<string, unknown> | undefined,
      ),
      profileUnitDefaults: normalizeUnits(
        o.profileUnitDefaults as Record<string, unknown> | undefined,
      ),
      updatedAt:
        typeof o.updatedAt === "string"
          ? o.updatedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

/** Anciennes clés de profil → clés stables `catégorie:code`. */
const LEGACY_PROFILE_KEY_ALIASES: Record<string, string> = {
  "category:fruits-legumes": "fruits-et-légumes:KG",
  "catalog:un": "alimentaire:UN",
  "catalog:kg": "fruits-et-légumes:KG",
  "catalog:col": "boissons:COL",
  "catalog:paq": "alimentaire:PAQ",
  "catalog:bt": "fruits-et-légumes:BT",
  "catalog:bqt": "fruits-et-légumes:BQT",
};

function migrateProfileDefaults(
  raw: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, unit] of Object.entries(raw)) {
    const mapped = LEGACY_PROFILE_KEY_ALIASES[key] ?? key;
    out[mapped] = unit;
  }
  return out;
}

function migrateFromLegacy(): OrderSelectionSnapshot | null {
  if (typeof window === "undefined") return null;

  const current = safeParse(localStorage.getItem(STORAGE_KEY));
  if (current) return current;

  const legacy = safeParse(localStorage.getItem(LEGACY_SELECTION_KEY));
  let profileUnitDefaults: Record<string, string> = {};

  try {
    const rawDefaults = localStorage.getItem(LEGACY_DEFAULTS_KEY);
    if (rawDefaults) {
      const parsed = JSON.parse(rawDefaults) as unknown;
      if (parsed && typeof parsed === "object") {
        profileUnitDefaults = migrateProfileDefaults(
          parsed as Record<string, string>,
        );
      }
    }
  } catch {
    /* noop */
  }

  if (!legacy && Object.keys(profileUnitDefaults).length === 0) {
    return null;
  }

  const migrated: OrderSelectionSnapshot = {
    quantities: legacy?.quantities ?? {},
    orderUnits: legacy?.orderUnits ?? {},
    profileUnitDefaults,
    updatedAt: legacy?.updatedAt ?? new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  return migrated;
}

export function loadOrderSelection(): OrderSelectionSnapshot {
  if (typeof window === "undefined") return emptySnapshot();

  const parsed = migrateFromLegacy() ?? safeParse(localStorage.getItem(STORAGE_KEY));
  if (!parsed) return emptySnapshot();

  return {
    quantities: parsed.quantities,
    orderUnits: parsed.orderUnits,
    profileUnitDefaults: parsed.profileUnitDefaults,
    updatedAt: parsed.updatedAt,
  };
}

export function saveOrderSelection(
  quantities: Record<string, number>,
  orderUnits: Record<string, string>,
  profileUnitDefaults: Record<string, string>,
): void {
  if (typeof window === "undefined") return;

  const payload: OrderSelectionSnapshot = {
    quantities: normalizeQuantities(quantities),
    orderUnits: normalizeUnits(orderUnits),
    profileUnitDefaults: normalizeUnits(profileUnitDefaults),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** Enregistre l’unité d’un produit tout de suite (sans attendre un re-render). */
export function saveProductOrderUnit(
  productId: string,
  unitId: string,
  quantities: Record<string, number>,
  orderUnits: Record<string, string>,
  profileUnitDefaults: Record<string, string>,
): Record<string, string> {
  const next = { ...orderUnits, [productId]: unitId.trim() };
  saveOrderSelection(quantities, next, profileUnitDefaults);
  return next;
}

export function saveProfileUnitDefault(
  profileKey: string,
  unitId: string,
  quantities: Record<string, number>,
  orderUnits: Record<string, string>,
  profileUnitDefaults: Record<string, string>,
): Record<string, string> {
  const next = {
    ...profileUnitDefaults,
    [profileKey]: unitId.trim(),
  };
  saveOrderSelection(quantities, orderUnits, next);
  return next;
}

export function clearOrderSelection(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_SELECTION_KEY);
  localStorage.removeItem(LEGACY_DEFAULTS_KEY);
}
