/** Emplacements de stockage — liste fixe pour filtres et données. */
export const STORAGE_LOCATIONS = [
  "Frigots hauts",
  "Frigots bas",
  "Congélateur bas",
  "Congélateur haut",
  "Bar",
  "Nettoyage",
  "Réserve",
] as const;

export type StorageLocation = (typeof STORAGE_LOCATIONS)[number];
