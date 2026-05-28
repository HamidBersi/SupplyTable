"use client";

import type { Product } from "@/types/supply";
import {
  getOrderUnitProfile,
  orderUnitAbbrev,
  resolveOrderUnitId,
} from "@/lib/order-unit-options";
import { OrderUnitSelect } from "./OrderUnitSelect";

function IconChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type Props = {
  products: Product[];
  quantities: Record<string, number>;
  orderUnits: Record<string, string>;
  unitDefaults: Record<string, string>;
  onQtyChange: (productId: string, qty: number) => void;
  onOrderUnitChange: (productId: string, unitId: string) => void;
  onSetUnitDefault: (profileKey: string, unitId: string) => void;
  onRemoveManual?: (productId: string) => void;
};

export function ProductTable({
  products,
  quantities,
  orderUnits,
  unitDefaults,
  onQtyChange,
  onOrderUnitChange,
  onSetUnitDefault,
  onRemoveManual,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
        Aucun produit ne correspond à ces filtres.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="max-md:overflow-visible md:overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Code
              </th>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Catégorie
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Emplacement
              </th>
              <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                PU HT
              </th>
              <th className="w-[8.5rem] shrink-0 px-4 py-3 text-center font-medium md:w-auto">
                <span className="md:hidden">Qté · Unité</span>
                <span className="hidden md:inline">Qté / Unité</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((p, i) => {
              const qty = quantities[p.id] ?? 0;
              const profile = getOrderUnitProfile(p);
              const unitId = resolveOrderUnitId(p, orderUnits, unitDefaults);
              const abbrev = orderUnitAbbrev(unitId);
              return (
                <tr
                  key={p.id}
                  className={
                    i % 2 === 0
                      ? "bg-white dark:bg-zinc-950"
                      : "bg-zinc-50/80 dark:bg-zinc-900/40"
                  }
                >
                  <td className="hidden whitespace-nowrap px-4 py-2.5 font-mono text-xs text-zinc-600 md:table-cell dark:text-zinc-400">
                    {p.isManual ? "—" : p.code || "—"}
                  </td>
                  <td className="min-w-0 px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-start justify-between gap-2">
                      <span className="block break-words">{p.name}</span>
                      {p.isManual && onRemoveManual && (
                        <button
                          type="button"
                          onClick={() => onRemoveManual(p.id)}
                          className="shrink-0 rounded-md px-2 py-0.5 text-xs font-normal text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                          title="Retirer de la liste"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-2.5 text-zinc-600 md:table-cell dark:text-zinc-400">
                    {p.category}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-2.5 text-zinc-600 md:table-cell dark:text-zinc-400">
                    {p.location}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-zinc-800 md:table-cell dark:text-zinc-200">
                    {p.isManual && p.unitPrice <= 0 ? (
                      <span className="text-zinc-400 dark:text-zinc-500">—</span>
                    ) : (
                      <>
                        {p.unitPrice.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        })}{" "}
                        € / {p.unit}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="ml-auto flex max-w-[9.5rem] items-center justify-end gap-1.5 md:mx-auto">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={qty || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? 0 : Math.max(0, Number(v));
                            onQtyChange(
                              p.id,
                              Number.isFinite(n) ? n : 0,
                            );
                          }}
                          className="h-7 w-11 shrink-0 rounded-lg border border-zinc-200 bg-white px-1 py-0 text-center text-sm tabular-nums shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-600 dark:bg-zinc-900 sm:w-12"
                          aria-label={`Quantité pour ${p.name}`}
                        />
                        <OrderUnitSelect
                          valueId={unitId}
                          abbrev={abbrev}
                          options={profile.units}
                          profileKey={profile.key}
                          savedDefaultId={unitDefaults[profile.key]}
                          productName={p.name}
                          onChange={(id) => onOrderUnitChange(p.id, id)}
                          onSetDefault={onSetUnitDefault}
                        />
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          onClick={() => onQtyChange(p.id, qty + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          <IconChevronUp className="h-2.5 w-2.5" />
                        </button>
                        {qty > 0 && (
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            onClick={() =>
                              onQtyChange(p.id, Math.max(0, qty - 1))
                            }
                            aria-label="Diminuer la quantité"
                          >
                            <IconChevronDown className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
