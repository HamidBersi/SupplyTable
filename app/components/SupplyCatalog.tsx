"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ManualBySupplier,
  ManualProductInput,
  OrderLine,
  Product,
  Supplier,
} from "@/types/supply";
import {
  addManualProduct,
  loadManualBySupplier,
  removeManualProduct,
} from "@/lib/manual-products-storage";
import { manualProductToRow } from "@/lib/manual-to-product";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { productMatchesSearch } from "@/lib/product-search";
import {
  orderUnitLabel,
  resolveOrderUnitId,
} from "@/lib/order-unit-options";
import { loadOrderSelection, saveOrderSelection, saveProductOrderUnit, saveProfileUnitDefault } from "@/lib/order-selection-storage";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierId, setSupplierId] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState<"all" | "selected">(
    "all",
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    return loadOrderSelection().quantities;
  });
  const [orderUnits, setOrderUnits] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    return loadOrderSelection().orderUnits;
  });
  const [profileUnitDefaults, setProfileUnitDefaults] = useState<
    Record<string, string>
  >(() => {
    if (typeof window === "undefined") return {};
    return loadOrderSelection().profileUnitDefaults;
  });
  const [selectionHydrated, setSelectionHydrated] = useState(false);
  const selectionRef = useRef({
    quantities: {} as Record<string, number>,
    orderUnits: {} as Record<string, string>,
    profileUnitDefaults: {} as Record<string, string>,
  });

  selectionRef.current = { quantities, orderUnits, profileUnitDefaults };

  useEffect(() => {
    const saved = loadOrderSelection();
    setQuantities(saved.quantities);
    setOrderUnits(saved.orderUnits);
    setProfileUnitDefaults(saved.profileUnitDefaults);
    setSelectionHydrated(true);
  }, []);

  useEffect(() => {
    if (!selectionHydrated) return;
    saveOrderSelection(quantities, orderUnits, profileUnitDefaults);
  }, [quantities, orderUnits, profileUnitDefaults, selectionHydrated]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [manualBySupplier, setManualBySupplier] =
    useState<ManualBySupplier>({});

  useEffect(() => {
    setManualBySupplier(loadManualBySupplier());
  }, []);

  const scopedProducts = useMemo(() => {
    if (supplierId === "all") {
      const manualRows = Object.values(manualBySupplier)
        .flat()
        .map(manualProductToRow);
      return [...manualRows, ...products];
    }
    const manualRows = (manualBySupplier[supplierId] ?? []).map(
      manualProductToRow,
    );
    const catalog = products.filter((p) => p.supplierId === supplierId);
    return [...manualRows, ...catalog];
  }, [products, supplierId, manualBySupplier]);

  const categoryOptions = useMemo(() => {
    const present = new Set(scopedProducts.map((p) => p.category));
    const canon = new Set<string>([...PRODUCT_CATEGORIES]);
    const ordered = PRODUCT_CATEGORIES.filter((c) => present.has(c));
    const extra = [...present]
      .filter((c) => !canon.has(c))
      .sort((a, b) => a.localeCompare(b, "fr"));
    return [...ordered, ...extra];
  }, [scopedProducts]);

  /** Liste fixe d’emplacements (cohérente avec `data/products.json`). */
  const locationOptions = useMemo(() => [...STORAGE_LOCATIONS], []);

  const sameStorageLocation = (a: string, b: string) =>
    a.normalize("NFC") === b.normalize("NFC");

  const supplierMap = useMemo(() => {
    const m = new Map<string, Supplier>();
    suppliers.forEach((s) => m.set(s.id, s));
    return m;
  }, [suppliers]);

  const activeSupplier =
    supplierId !== "all" ? supplierMap.get(supplierId) : undefined;

  const filteredProducts = useMemo(() => {
    return scopedProducts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (
        location !== "all" &&
        !sameStorageLocation(p.location, location)
      ) {
        return false;
      }
      if (selectionMode === "selected") {
        const qty = quantities[p.id] ?? 0;
        if (qty <= 0) return false;
      }
      if (
        !productMatchesSearch(p, searchQuery, {
          supplierName:
            supplierId === "all"
              ? supplierMap.get(p.supplierId)?.name
              : undefined,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    scopedProducts,
    category,
    location,
    selectionMode,
    quantities,
    searchQuery,
    supplierMap,
    supplierId,
  ]);

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
          unit: orderUnitLabel(
            resolveOrderUnitId(p, orderUnits, profileUnitDefaults),
          ),
        });
      }
    }
    return out;
  }, [activeSupplier, rowsForActiveSupplier, quantities, orderUnits, profileUnitDefaults]);

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

  const handleAddManual = (targetSupplierId: string, input: ManualProductInput) => {
    try {
      addManualProduct(targetSupplierId, input);
      setManualBySupplier(loadManualBySupplier());
    } catch {
      /* noop — validation côté UI */
    }
  };

  const handleRemoveManual = (productId: string) => {
    const ownerSupplierId =
      supplierId !== "all"
        ? supplierId
        : Object.entries(manualBySupplier).find(([, list]) =>
            list.some((p) => p.id === productId),
          )?.[0];
    if (!ownerSupplierId) return;
    removeManualProduct(ownerSupplierId, productId);
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
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Catalogue des Produits
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm text-zinc-600 md:block dark:text-zinc-400">
            Filtrez les produits par fournisseur, catégorie ou emplacement. Vous pouvez également rechercher un produit par nom, code ou catégorie.
          </p>
        </div>

        <div className="mb-6">
          <FilterBar
            searchValue={searchQuery}
            supplierValue={supplierId}
            categoryValue={category}
            locationValue={location}
            selectionMode={selectionMode}
            supplierOptions={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            onSearchChange={setSearchQuery}
            onSupplierChange={onSupplierChange}
            onCategoryChange={setCategory}
            onLocationChange={setLocation}
            onSelectionModeChange={setSelectionMode}
          />
        </div>

        <ProductTable
          products={filteredProducts}
          quantities={quantities}
          orderUnits={orderUnits}
          unitDefaults={profileUnitDefaults}
          onQtyChange={(id, qty) =>
            setQuantities((prev) => ({ ...prev, [id]: qty }))
          }
          onOrderUnitChange={(id, unitId) => {
            const cur = selectionRef.current;
            const nextUnits = saveProductOrderUnit(
              id,
              unitId,
              cur.quantities,
              cur.orderUnits,
              cur.profileUnitDefaults,
            );
            setOrderUnits(nextUnits);
          }}
          onSetUnitDefault={(profileKey, unitId) => {
            const cur = selectionRef.current;
            const nextDefaults = saveProfileUnitDefault(
              profileKey,
              unitId,
              cur.quantities,
              cur.orderUnits,
              cur.profileUnitDefaults,
            );
            setProfileUnitDefaults(nextDefaults);
          }}
          onRemoveManual={handleRemoveManual}
        />

        <AddManualProduct
          supplierLabel={
            activeSupplier?.name ?? "tous les fournisseurs"
          }
          fixedSupplierId={
            supplierId !== "all" ? supplierId : undefined
          }
          supplierOptions={
            supplierId === "all"
              ? suppliers.map((s) => ({ id: s.id, name: s.name }))
              : undefined
          }
          onAdd={handleAddManual}
        />
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
