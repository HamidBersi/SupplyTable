"use client";

import { useEffect, useMemo, useState } from "react";
import type { ManualBySupplier, OrderLine, Product, Supplier } from "@/types/supply";
import {
  addManualProduct,
  loadManualBySupplier,
  removeManualProduct,
} from "@/lib/manual-products-storage";
import { manualProductToRow } from "@/lib/manual-to-product";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { FilterBar } from "./FilterBar";
import { ProductTable } from "./ProductTable";
import { OrderDock } from "./OrderDock";
import { EmailOrderDialog } from "./EmailOrderDialog";
import { AddManualProduct } from "./AddManualProduct";

type Props = {
  suppliers: Supplier[];
  products: Product[];
};

export function SupplyCatalog({ suppliers, products }: Props) {
  const [supplierId, setSupplierId] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState<"all" | "selected">(
    "all",
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [emailOpen, setEmailOpen] = useState(false);
  const [manualBySupplier, setManualBySupplier] =
    useState<ManualBySupplier>({});

  useEffect(() => {
    setManualBySupplier(loadManualBySupplier());
  }, []);

  const scopedProducts = useMemo(() => {
    if (supplierId === "all") return products;
    const manualRows = (manualBySupplier[supplierId] ?? []).map(
      manualProductToRow,
    );
    const catalog = products.filter((p) => p.supplierId === supplierId);
    return [...manualRows, ...catalog];
  }, [products, supplierId, manualBySupplier]);

  const categoryOptions = useMemo(() => {
    const s = new Set(scopedProducts.map((p) => p.category));
    return [...s].sort((a, b) => a.localeCompare(b, "fr"));
  }, [scopedProducts]);

  /** Liste fixe d’emplacements (cohérente avec `data/products.json`). */
  const locationOptions = useMemo(() => [...STORAGE_LOCATIONS], []);

  const filteredProducts = useMemo(() => {
    return scopedProducts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (location !== "all" && p.location !== location) return false;
      if (selectionMode === "selected") {
        const qty = quantities[p.id] ?? 0;
        if (qty <= 0) return false;
      }
      return true;
    });
  }, [scopedProducts, category, location, selectionMode, quantities]);

  const supplierMap = useMemo(() => {
    const m = new Map<string, Supplier>();
    suppliers.forEach((s) => m.set(s.id, s));
    return m;
  }, [suppliers]);

  const activeSupplier =
    supplierId !== "all" ? supplierMap.get(supplierId) : undefined;

  /** Catalogue + lignes manuelles pour le fournisseur actif (commande / total). */
  const rowsForActiveSupplier = useMemo((): Product[] => {
    if (!activeSupplier) return [];
    const manualRows = (manualBySupplier[activeSupplier.id] ?? []).map(
      manualProductToRow,
    );
    const catalog = products.filter(
      (p) => p.supplierId === activeSupplier.id,
    );
    return [...manualRows, ...catalog];
  }, [activeSupplier, manualBySupplier, products]);

  const orderLines: OrderLine[] = useMemo(() => {
    if (!activeSupplier) return [];
    const out: OrderLine[] = [];
    for (const p of rowsForActiveSupplier) {
      const qty = quantities[p.id] ?? 0;
      if (qty > 0) {
        out.push({
          productId: p.id,
          name: p.name,
          code: p.isManual ? "—" : p.code,
          qty,
          unit: p.isManual ? "—" : p.unit,
        });
      }
    }
    return out;
  }, [activeSupplier, rowsForActiveSupplier, quantities]);

  /** Estimation HT : Σ (qté × PU catalogue). Les PU ne sont pas forcément ceux du jour. */
  const estimatedSubtotalHt = useMemo(() => {
    if (!activeSupplier) return 0;
    let sum = 0;
    for (const p of rowsForActiveSupplier) {
      const qty = quantities[p.id] ?? 0;
      if (qty > 0) sum += qty * p.unitPrice;
    }
    return sum;
  }, [activeSupplier, rowsForActiveSupplier, quantities]);

  const selectedCount = orderLines.length;

  const onSupplierChange = (v: string) => {
    setSupplierId(v);
    setCategory("all");
    setLocation("all");
  };

  const handleAddManual = (name: string) => {
    if (supplierId === "all") return;
    try {
      addManualProduct(supplierId, name);
      setManualBySupplier(loadManualBySupplier());
    } catch {
      /* noop — validation côté UI */
    }
  };

  const handleRemoveManual = (productId: string) => {
    if (supplierId === "all") return;
    removeManualProduct(supplierId, productId);
    setManualBySupplier(loadManualBySupplier());
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Catalogue fournisseurs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Filtrez par fournisseur, catégorie et emplacement. Utilisez{" "}
            <strong className="font-medium text-zinc-700 dark:text-zinc-300">
              Sélectionnés uniquement
            </strong>{" "}
            pour ne voir que les lignes avec une quantité — pratique avant un
            appel au fournisseur.
          </p>
        </div>

        <div className="mb-6">
          <FilterBar
            supplierValue={supplierId}
            categoryValue={category}
            locationValue={location}
            selectionMode={selectionMode}
            supplierOptions={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            onSupplierChange={onSupplierChange}
            onCategoryChange={setCategory}
            onLocationChange={setLocation}
            onSelectionModeChange={setSelectionMode}
          />
        </div>

        <ProductTable
          products={filteredProducts}
          quantities={quantities}
          onQtyChange={(id, qty) =>
            setQuantities((prev) => ({ ...prev, [id]: qty }))
          }
          onRemoveManual={
            supplierId !== "all" ? handleRemoveManual : undefined
          }
        />

        {supplierId !== "all" && activeSupplier && (
          <AddManualProduct
            supplierLabel={activeSupplier.name}
            onAdd={handleAddManual}
          />
        )}
      </div>

      {activeSupplier && (
        <>
          <OrderDock
            supplier={activeSupplier}
            selectedCount={selectedCount}
            estimatedSubtotalHt={estimatedSubtotalHt}
            onOpenEmail={() => setEmailOpen(true)}
          />
          <EmailOrderDialog
            supplier={activeSupplier}
            lines={orderLines}
            open={emailOpen}
            onClose={() => setEmailOpen(false)}
          />
        </>
      )}
    </div>
  );
}
