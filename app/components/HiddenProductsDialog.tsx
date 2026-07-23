"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/supply";
import { useDialog } from "@/lib/use-dialog";
import { sentenceCaseFr } from "@/lib/text";

type Props = {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onRestore: (productIds: string[]) => void;
};

export function HiddenProductsDialog({
  open,
  products,
  onClose,
  onRestore,
}: Props) {
  const dialogRef = useDialog(open, onClose);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
  }, [open, products]);

  const ids = useMemo(() => products.map((p) => p.id), [products]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(ids));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,28rem)] max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/45"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Produits masqués
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sélectionnez ceux à réafficher dans le catalogue.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">
          Aucun produit masqué.
        </p>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-surface-muted/50 px-5 py-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = someSelected && !allSelected;
                }
              }}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-border text-accent focus:ring-ring"
            />
            <span>Tout sélectionner</span>
            <span className="ml-auto text-xs font-normal text-muted">
              {selected.size}/{products.length}
            </span>
          </label>

          <ul className="max-h-[min(50vh,20rem)] overflow-y-auto py-1">
            {products.map((p) => {
              const checked = selected.has(p.id);
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-5 py-2.5 text-sm hover:bg-surface-muted/60">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(p.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-ring"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">
                        {sentenceCaseFr(p.name)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {sentenceCaseFr(p.category)}
                        <span className="mx-1 text-border">·</span>
                        {sentenceCaseFr(p.location)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Fermer
        </button>
        <button
          type="button"
          disabled={!someSelected}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => {
            onRestore([...selected]);
            onClose();
          }}
        >
          Réafficher
          {someSelected ? ` (${selected.size})` : ""}
        </button>
      </div>
    </dialog>
  );
}
