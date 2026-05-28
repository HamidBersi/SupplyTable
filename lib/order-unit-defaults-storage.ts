const STORAGE_KEY = "supply-table:order-unit-defaults";

/** Préférences « unité par défaut » par profil (catégorie / type produit). */
export function loadOrderUnitDefaults(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveOrderUnitDefault(
  profileKey: string,
  unitId: string,
): Record<string, string> {
  const next = { ...loadOrderUnitDefaults(), [profileKey]: unitId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
