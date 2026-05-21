"use client";

import { useState } from "react";
import type { ManualProductInput } from "@/types/supply";
import { AddManualProductModal } from "./AddManualProductModal";

type Props = {
  supplierLabel: string;
  onAdd: (input: ManualProductInput) => void;
};

export function AddManualProduct({ supplierLabel, onAdd }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-900/40">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Produit hors catalogue — {supplierLabel}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Catégorie, emplacement, unité et prix optionnel pour un article absent du
          fichier fournisseur.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto"
        >
          Ajouter un produit…
        </button>
      </div>

      <AddManualProductModal
        supplierLabel={supplierLabel}
        open={open}
        onClose={() => setOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
}
