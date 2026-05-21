"use client";

import { useEffect, useRef, useState } from "react";
import type { ManualProductInput } from "@/types/supply";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { STORAGE_LOCATIONS } from "@/lib/locations";
import { ORDER_UNITS } from "@/lib/order-units";

type Props = {
  supplierLabel: string;
  open: boolean;
  onClose: () => void;
  onAdd: (input: ManualProductInput) => void;
};

const emptyForm = (): ManualProductInput => ({
  name: "",
  category: PRODUCT_CATEGORIES[0],
  location: STORAGE_LOCATIONS[1],
  unit: ORDER_UNITS[0],
  unitPrice: undefined,
});

export function AddManualProductModal({
  supplierLabel,
  open,
  onClose,
  onAdd,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [priceText, setPriceText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setForm(emptyForm());
      setPriceText("");
      setErr(null);
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const sync = () => onClose();
    el.addEventListener("close", sync);
    return () => el.removeEventListener("close", sync);
  }, [onClose]);

  const submit = () => {
    const name = form.name.trim();
    if (!name) {
      setErr("Indiquez un nom de produit.");
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
    onAdd({
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
      className="w-[min(100%,28rem)] max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-zinc-900/50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col"
      >
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Produit hors catalogue</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {supplierLabel}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
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
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>

          <label className="block text-sm font-medium">
            Catégorie
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
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
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
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
              <span className="font-normal text-zinc-500">(optionnel)</span>
              <input
                type="text"
                inputMode="decimal"
                value={priceText}
                onChange={(e) => {
                  setPriceText(e.target.value);
                  setErr(null);
                }}
                placeholder="—"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
              />
            </label>
          </div>

          {err ? (
            <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:justify-end dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Ajouter à la liste
          </button>
        </div>
      </form>
    </dialog>
  );
}
