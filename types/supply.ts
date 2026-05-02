export type Supplier = {
  id: string;
  name: string;
  phone: string;
  orderEmail: string;
  address?: string;
  /** Seuil HT pour livraison offerte (si défini, affichage d’un indicateur). */
  freeDeliveryMinHt?: number;
};

/** Produit saisi à la main (nom seul), stocké en local par fournisseur. */
export type ManualProduct = {
  id: string;
  supplierId: string;
  name: string;
};

export type ManualBySupplier = Record<string, ManualProduct[]>;

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
