"use client";

import { useState } from "react";
import type { ManualProductInput } from "@/types/supply";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { ORDER_UNITS } from "@/lib/order-units";
import { useDialog } from "@/lib/use-dialog";
import { sentenceCaseFr } from "@/lib/text";

type Props = {
  supplierLabel: string;
  fixedSupplierId?: string;
  supplierOptions?: { id: string; name: string }[];
  open: boolean;
  onClose: () => void;
  onAdd: (supplierId: string, input: ManualProductInput) => void;
};

export function AddManualProductModal({
  supplierLabel,
  fixedSupplierId,
  supplierOptions,
  open,
  onClose,
  onAdd,
}: Props) {
  const dialogRef = useDialog(open, onClose);
  const [form, setForm] = useState<ManualProductInput>({
    name: "",
    category: PRODUCT_CATEGORIES[0],
    location: STORAGE_LOCATIONS[1],
    unit: ORDER_UNITS[0],
  });
  const [priceText, setPriceText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pickedSupplierId, setPickedSupplierId] = useState(
    () => supplierOptions?.[0]?.id ?? "",
  );

  const needsSupplierPick =
    !fixedSupplierId && (supplierOptions?.length ?? 0) > 0;

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      setErr("Indiquez un nom de produit.");
      return;
    }
    const targetSupplierId = fixedSupplierId ?? pickedSupplierId;
    if (!targetSupplierId) {
      setErr("Choisissez un fournisseur.");
      return;
    }
    let unitPrice: number | undefined;
    const pt = priceText.trim().replace(",", ".");
    if (pt !== "") {
      const n = Number(pt);
      if (!Number.isFinite(n) || n < 0) {
        setErr("Prix invalide.");
        return;
      }
      unitPrice = n;
    }
    setErr(null);
    onAdd(targetSupplierId, {
      name,
      category: form.category,
      location: form.location,
      unit: form.unit,
      unitPrice,
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,28rem)] max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col"
      >
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Produit hors catalogue</h2>
          <p className="mt-1 text-sm text-muted">{supplierLabel}</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          {needsSupplierPick ? (
            <label className="block text-sm font-medium">
              Fournisseur
              <select
                value={pickedSupplierId}
                onChange={(e) => {
                  setPickedSupplierId(e.target.value);
                  setErr(null);
                }}
                className="field-select mt-1 w-full"
              >
                {supplierOptions!.map((s) => (
                  <option key={s.id} value={s.id}>
                    {sentenceCaseFr(s.name)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-sm font-medium">
            Nom du produit
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErr(null);
              }}
              placeholder="Ex. : persil plat botte"
              autoFocus
              className="field-input mt-1 w-full"
            />
          </label>

          <label className="block text-sm font-medium">
            Catégorie
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="field-select mt-1 w-full"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {sentenceCaseFr(c)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Emplacement
            <select
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="field-select mt-1 w-full"
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {sentenceCaseFr(loc)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              Unité de commande
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                className="field-select mt-1 w-full"
              >
                {ORDER_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Prix unitaire HT{" "}
              <span className="font-normal text-muted">(optionnel)</span>
              <input
                type="text"
                inputMode="decimal"
                value={priceText}
                onChange={(e) => {
                  setPriceText(e.target.value);
                  setErr(null);
                }}
                placeholder="—"
                className="field-input mt-1 w-full"
              />
            </label>
          </div>

          {err ? (
            <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary">
            Ajouter à la liste
          </button>
        </div>
      </form>
    </dialog>
  );
}
