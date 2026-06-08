/** Sélection de commande partagée entre appareils (KV). */
export type SharedOrderSelection = {
  quantities: Record<string, number>;
  orderUnits: Record<string, string>;
  updatedAt: string;
  updatedBy?: string;
};

export function normalizeQuantities(
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

export function normalizeOrderUnits(
  raw: Record<string, unknown> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const [id, u] of Object.entries(raw)) {
    if (typeof u === "string" && u.trim()) out[id] = u.trim();
  }
  return out;
}

export function hasSelectionItems(
  quantities: Record<string, number>,
): boolean {
  return Object.keys(quantities).length > 0;
}
