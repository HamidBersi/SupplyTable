"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addManualProduct,
  loadManualBySupplier,
  saveManualBySupplier,
} from "@/lib/manual-products-storage";
import { manualProductToRow } from "@/lib/manual-to-product";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { productMatchesSearch } from "@/lib/product-search";
import {
  orderUnitAbbrev,
  resolveOrderUnitId,
} from "@/lib/order-unit-options";
import { sentenceCaseFr } from "@/lib/text";
import {
  applyProductOverride,
  hideProduct,
  loadProductOverrides,
  saveProductOverrides,
} from "@/lib/product-overrides-storage";
import type { ProductOverride } from "@/types/supply";
import { loadOrderSelection, saveOrderSelection, saveProductOrderUnit } from "@/lib/order-selection-storage";
import type {
  ManualBySupplier,
  ManualProductInput,
  OrderLine,
  Product,
  ProductOverridesMap,
  Supplier,
} from "@/types/supply";
import { FilterBar } from "./FilterBar";
import { ProductTable } from "./ProductTable";
import { OrderDock } from "./OrderDock";
import { EmailOrderDialog } from "./EmailOrderDialog";
import { AddManualProduct } from "./AddManualProduct";
import {
  EditProductModal,
  type ProductEditValues,
} from "./EditProductModal";
import { HiddenProductsDialog } from "./HiddenProductsDialog";
import { ConfirmDialog } from "./ConfirmDialog";

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
  // Toujours {} au 1er rendu (SSR = client) pour éviter un mismatch d’hydratation ;
  // localStorage est lu dans l’effet ci-dessous.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderUnits, setOrderUnits] = useState<Record<string, string>>({});
  const [profileUnitDefaults, setProfileUnitDefaults] = useState<
    Record<string, string>
  >({});
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
  const [overrides, setOverrides] = useState<ProductOverridesMap>({});
  const [hiddenListOpen, setHiddenListOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingHide, setPendingHide] = useState<Product | null>(null);

  useEffect(() => {
    setManualBySupplier(loadManualBySupplier());
    setOverrides(loadProductOverrides());
  }, []);

  const baseScopedProducts = useMemo(() => {
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

  const originalById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of baseScopedProducts) m.set(p.id, p);
    return m;
  }, [baseScopedProducts]);

  const scopedProducts = useMemo(() => {
    return baseScopedProducts
      .filter((p) => overrides[p.id]?.hidden !== true)
      .map((p) => applyProductOverride(p, overrides[p.id]));
  }, [baseScopedProducts, overrides]);

  const hiddenProducts = useMemo(() => {
    return baseScopedProducts
      .filter((p) => overrides[p.id]?.hidden === true)
      .map((p) => applyProductOverride(p, overrides[p.id]));
  }, [baseScopedProducts, overrides]);

  const hiddenCount = hiddenProducts.length;

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
    return [...manualRows, ...catalog]
      .filter((p) => overrides[p.id]?.hidden !== true)
      .map((p) => applyProductOverride(p, overrides[p.id]));
  }, [activeSupplier, manualBySupplier, products, overrides]);

  const orderLines: OrderLine[] = useMemo(() => {
    if (!activeSupplier) return [];
    const out: OrderLine[] = [];
    for (const p of rowsForActiveSupplier) {
      const qty = quantities[p.id] ?? 0;
      if (qty > 0) {
        out.push({
          productId: p.id,
          name: sentenceCaseFr(p.name),
          code: p.isManual ? "—" : p.code,
          qty,
          unit: orderUnitAbbrev(resolveOrderUnitId(p, orderUnits)),
        });
      }
    }
    return out;
  }, [activeSupplier, rowsForActiveSupplier, quantities, orderUnits]);

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
      addManualProduct(targetSupplierId, {
        ...input,
        name: sentenceCaseFr(input.name),
        category: sentenceCaseFr(input.category),
        location: sentenceCaseFr(input.location),
      });
      setManualBySupplier(loadManualBySupplier());
    } catch {
      /* noop — validation côté UI */
    }
  };

  const handleHideProduct = (productId: string) => {
    setOverrides(hideProduct(productId));
    setQuantities((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleSaveProductEdit = (
    productId: string,
    values: ProductEditValues,
  ) => {
    const original = originalById.get(productId);
    if (!original) return;

    if (original.isManual) {
      const ownerSupplierId = original.supplierId;
      const all = loadManualBySupplier();
      const list = all[ownerSupplierId] ?? [];
      const idx = list.findIndex((m) => m.id === productId);
      if (idx < 0) return;
      list[idx] = {
        ...list[idx],
        name: values.name,
        category: values.category,
        location: values.location,
        ...(values.unitPrice > 0
          ? { unitPrice: values.unitPrice }
          : { unitPrice: undefined }),
      };
      all[ownerSupplierId] = list;
      saveManualBySupplier(all);
      setManualBySupplier(loadManualBySupplier());
      return;
    }

    const rebuilt: ProductOverride = {};
    if (values.name !== original.name) rebuilt.name = values.name;
    if (values.category !== original.category) {
      rebuilt.category = values.category;
    }
    if (values.location !== original.location) {
      rebuilt.location = values.location;
    }
    if (values.unitPrice !== original.unitPrice) {
      rebuilt.unitPrice = values.unitPrice;
    }
    if (overrides[productId]?.hidden) rebuilt.hidden = true;

    const all = loadProductOverrides();
    if (Object.keys(rebuilt).length === 0) {
      delete all[productId];
    } else {
      all[productId] = rebuilt;
    }
    saveProductOverrides(all);
    setOverrides(loadProductOverrides());
  };

  const handleRestoreHidden = (productIds: string[]) => {
    const all = loadProductOverrides();
    for (const id of productIds) {
      const ov = all[id];
      if (!ov?.hidden) continue;
      const { hidden: _h, ...rest } = ov;
      if (Object.keys(rest).length === 0) delete all[id];
      else all[id] = rest;
    }
    saveProductOverrides(all);
    setOverrides(all);
  };

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Catalogue des Produits
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm text-muted md:block">
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
          {hiddenCount > 0 ? (
            <p className="mt-3 text-xs text-muted">
              {hiddenCount} produit{hiddenCount > 1 ? "s" : ""} masqué
              {hiddenCount > 1 ? "s" : ""}.{" "}
              <button
                type="button"
                className="font-medium text-accent underline-offset-2 hover:underline"
                onClick={() => setHiddenListOpen(true)}
              >
                Voir la liste
              </button>
            </p>
          ) : null}
        </div>

        <ProductTable
          products={filteredProducts}
          quantities={quantities}
          orderUnits={orderUnits}
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
          onSetUnitDefault={(productId, unitId) => {
            const cur = selectionRef.current;
            const nextUnits = saveProductOrderUnit(
              productId,
              unitId,
              cur.quantities,
              cur.orderUnits,
              cur.profileUnitDefaults,
            );
            setOrderUnits(nextUnits);
          }}
          onEditProduct={setEditingProduct}
          onRequestHideProduct={setPendingHide}
        />

        <AddManualProduct
          supplierLabel={
            activeSupplier
              ? sentenceCaseFr(activeSupplier.name)
              : "tous les fournisseurs"
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

      <EditProductModal
        product={editingProduct}
        originalName={
          editingProduct
            ? originalById.get(editingProduct.id)?.name
            : undefined
        }
        open={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProductEdit}
      />

      <HiddenProductsDialog
        open={hiddenListOpen}
        products={hiddenProducts}
        onClose={() => setHiddenListOpen(false)}
        onRestore={handleRestoreHidden}
      />

      <ConfirmDialog
        open={pendingHide !== null}
        title="Masquer ce produit ?"
        description={
          pendingHide
            ? `« ${sentenceCaseFr(pendingHide.name)} » disparaîtra du tableau, sans être supprimé définitivement. Vous pourrez le réafficher plus tard depuis la liste des produits masqués.`
            : ""
        }
        confirmLabel="Masquer"
        tone="danger"
        onConfirm={() => {
          if (pendingHide) handleHideProduct(pendingHide.id);
        }}
        onClose={() => setPendingHide(null)}
      />

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
