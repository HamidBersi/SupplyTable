import type { Product, ProductOverride, ProductOverridesMap } from "@/types/supply";

const STORAGE_KEY = "supply-table-product-overrides-v1";

function safeParse(raw: string | null): ProductOverridesMap {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {};
    }
    return data as ProductOverridesMap;
  } catch {
    return {};
  }
}

export function loadProductOverrides(): ProductOverridesMap {
  if (typeof window === "undefined") return {};
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveProductOverrides(next: ProductOverridesMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function upsertProductOverride(
  productId: string,
  patch: ProductOverride,
): ProductOverridesMap {
  const all = loadProductOverrides();
  const prev = all[productId] ?? {};
  const merged: ProductOverride = { ...prev, ...patch };

  const cleaned: ProductOverride = {};
  if (merged.name !== undefined) cleaned.name = merged.name;
  if (merged.category !== undefined) cleaned.category = merged.category;
  if (merged.location !== undefined) cleaned.location = merged.location;
  if (merged.unitPrice !== undefined) cleaned.unitPrice = merged.unitPrice;
  if (merged.hidden) cleaned.hidden = true;

  if (Object.keys(cleaned).length === 0) {
    delete all[productId];
  } else {
    all[productId] = cleaned;
  }
  saveProductOverrides(all);
  return all;
}

export function hideProduct(productId: string): ProductOverridesMap {
  return upsertProductOverride(productId, { hidden: true });
}

export function unhideProduct(productId: string): ProductOverridesMap {
  const all = loadProductOverrides();
  const prev = all[productId];
  if (!prev) return all;
  const { hidden: _h, ...rest } = prev;
  if (Object.keys(rest).length === 0) {
    delete all[productId];
  } else {
    all[productId] = rest;
  }
  saveProductOverrides(all);
  return all;
}

/** Applique les surcharges d’affichage (hors `hidden`). */
export function applyProductOverride(
  product: Product,
  override: ProductOverride | undefined,
): Product {
  if (!override) return product;
  return {
    ...product,
    name: override.name ?? product.name,
    category: override.category ?? product.category,
    location: override.location ?? product.location,
    unitPrice:
      override.unitPrice !== undefined ? override.unitPrice : product.unitPrice,
  };
}
