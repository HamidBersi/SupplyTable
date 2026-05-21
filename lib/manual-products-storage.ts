import type { ManualBySupplier, ManualProduct, ManualProductInput } from "@/types/supply";

const STORAGE_KEY = "supply-table-manual-products-v1";

function safeParse(raw: string | null): ManualBySupplier {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null) return {};
    return data as ManualBySupplier;
  } catch {
    return {};
  }
}

export function loadManualBySupplier(): ManualBySupplier {
  if (typeof window === "undefined") return {};
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveManualBySupplier(next: ManualBySupplier): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function addManualProduct(
  supplierId: string,
  input: ManualProductInput,
): ManualProduct {
  const name = input.name.trim();
  if (!name) throw new Error("Nom vide");

  const unitPrice =
    input.unitPrice !== undefined &&
    input.unitPrice !== null &&
    String(input.unitPrice).trim() !== ""
      ? Math.max(0, Number(input.unitPrice))
      : undefined;

  const item: ManualProduct = {
    id: `manual-${crypto.randomUUID()}`,
    supplierId,
    name,
    category: input.category.trim(),
    location: input.location.trim(),
    unit: input.unit.trim(),
    ...(unitPrice !== undefined && Number.isFinite(unitPrice)
      ? { unitPrice }
      : {}),
  };

  const all = loadManualBySupplier();
  const list = all[supplierId] ?? [];
  all[supplierId] = [...list, item];
  saveManualBySupplier(all);
  return item;
}

export function removeManualProduct(supplierId: string, productId: string): void {
  const all = loadManualBySupplier();
  const list = all[supplierId] ?? [];
  all[supplierId] = list.filter((p) => p.id !== productId);
  if (all[supplierId]?.length === 0) delete all[supplierId];
  saveManualBySupplier(all);
}
