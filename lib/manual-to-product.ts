import type { ManualProduct, Product } from "@/types/supply";

const DEFAULT_CATEGORY = "Ajout manuel";
const DEFAULT_LOCATION = "Frigots bas";
const DEFAULT_UNIT = "Unité";

export function manualProductToRow(m: ManualProduct): Product {
  return {
    id: m.id,
    supplierId: m.supplierId,
    code: "",
    name: m.name,
    category: m.category?.trim() || DEFAULT_CATEGORY,
    location: m.location?.trim() || DEFAULT_LOCATION,
    unit: m.unit?.trim() || DEFAULT_UNIT,
    unitPrice:
      typeof m.unitPrice === "number" && Number.isFinite(m.unitPrice)
        ? Math.max(0, m.unitPrice)
        : 0,
    isManual: true,
  };
}
