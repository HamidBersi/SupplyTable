export type Supplier = {
  id: string;
  name: string;
  phone: string;
  orderEmail: string;
  address?: string;
  /** Seuil HT pour livraison offerte (si défini, affichage d’un indicateur). */
  freeDeliveryMinHt?: number;
};

/** Données saisies pour un produit hors catalogue. */
export type ManualProductInput = {
  name: string;
  category: string;
  location: string;
  unit: string;
  /** Prix unitaire HT — optionnel. */
  unitPrice?: number;
};

/** Produit saisi à la main, stocké en local par fournisseur. */
export type ManualProduct = ManualProductInput & {
  id: string;
  supplierId: string;
};

export type ManualBySupplier = Record<string, ManualProduct[]>;

/** Catégorie métier (voir `lib/product-categories.ts`). Les ajouts manuels utilisent encore une chaîne libre. */
export type Product = {
  id: string;
  supplierId: string;
  code: string;
  name: string;
  category: string;
  location: string;
  unit: string;
  unitPrice: number;
  /** Ligne issue d’un ajout manuel (pas de code / PU). */
  isManual?: boolean;
};

export type OrderStatus = "brouillon" | "envoyee" | "en_cours" | "recue" | "annulee";

export type OrderLine = {
  productId: string;
  name: string;
  code: string;
  qty: number;
  unit: string;
};

export type StoredOrder = {
  id: string;
  createdAt: string;
  supplierId: string;
  supplierName: string;
  status: OrderStatus;
  deliveryPreference: string;
  lines: OrderLine[];
};
