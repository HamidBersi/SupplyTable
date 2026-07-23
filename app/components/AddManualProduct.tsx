"use client";

import { useState } from "react";
import type { ManualProductInput } from "@/types/supply";
import { AddManualProductModal } from "./AddManualProductModal";

type SupplierOption = { id: string; name: string };

type Props = {
  /** Libellé affiché (fournisseur actif ou « tous »). */
  supplierLabel: string;
  /** Fournisseur cible quand un seul est sélectionné. */
  fixedSupplierId?: string;
  /** Liste pour choisir le fournisseur (vue « tous »). */
  supplierOptions?: SupplierOption[];
  onAdd: (supplierId: string, input: ManualProductInput) => void;
};

export function AddManualProduct({
  supplierLabel,
  fixedSupplierId,
  supplierOptions,
  onAdd,
}: Props) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-muted/80 px-4 py-3">
        <p className="field-label">
          Produit hors catalogue — {supplierLabel}
        </p>
        <p className="mt-1 text-sm text-muted">
          Catégorie, emplacement, unité et prix optionnel pour un article absent du
          fichier fournisseur.
        </p>
        <button
          type="button"
          onClick={() => {
            setSession((s) => s + 1);
            setOpen(true);
          }}
          className="btn-primary mt-3 w-full py-2.5 sm:w-auto"
        >
          Ajouter un produit…
        </button>
      </div>

      <AddManualProductModal
        key={session}
        supplierLabel={supplierLabel}
        fixedSupplierId={fixedSupplierId}
        supplierOptions={supplierOptions}
        open={open}
        onClose={() => setOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
}
