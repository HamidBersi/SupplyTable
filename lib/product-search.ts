import type { Product } from "@/types/supply";

export type ProductSearchOptions = {
  /** Nom du fournisseur (utile quand « Tous les fournisseurs » est affiché). */
  supplierName?: string;
};

/** Filtre nom, code, catégorie, emplacement et fournisseur (plusieurs mots = tous requis). */
export function productMatchesSearch(
  product: Product,
  query: string,
  options?: ProductSearchOptions,
): boolean {
  const terms = query
    .trim()
    .toLocaleLowerCase("fr")
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = [
    product.name,
    product.code,
    product.category,
    product.location,
    options?.supplierName ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase("fr");

  return terms.every((term) => haystack.includes(term));
}
