/** Catégories métier du catalogue (ordre d’affichage dans les filtres). */
export const PRODUCT_CATEGORIES = [
  "Fruits et légumes",
  "Boissons",
  "Alimentaire",
  "Surgelés",
  "Glaces",
  "Produits nettoyage",
  "Non alimentaire",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
