import type { ManualProduct, Product } from "@/types/supply";

export function manualProductToRow(m: ManualProduct): Product {
  return {
    id: m.id,
    supplierId: m.supplierId,
    code: "",
    name: m.name,
    category: "Ajout manuel",
    location: "Frigots bas",
    unit: "—",
    unitPrice: 0,
    isManual: true,
  };
}
