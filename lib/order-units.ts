/** Unités de commande pour les ajouts manuels. */
export const ORDER_UNITS = [
  "Unité",
  "Kilo",
  "Botte",
  "Colis",
  "Plateau",
  "Boîte",
  "Carton",
] as const;

export type OrderUnit = (typeof ORDER_UNITS)[number];
