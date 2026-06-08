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
        <table className="w-full text-left text-base md:text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-sm uppercase tracking-wide text-zinc-500 md:text-xs dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Code
              </th>
              <th className="px-3 py-3.5 font-medium md:px-4 md:py-3">Produit</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Catégorie
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Emplacement
              </th>
              <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                PU HT
              </th>
              <th className="w-[10.5rem] shrink-0 px-2 py-3.5 text-center font-medium md:w-[8.5rem] md:px-4 md:py-3">
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
                  <td className="min-w-0 px-3 py-3.5 text-[15px] leading-snug font-medium text-zinc-900 md:px-4 md:py-2.5 md:text-sm dark:text-zinc-100">
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
                  <td className="px-2 py-3 md:px-4 md:py-2">
                    <div className="ml-auto flex max-w-[11rem] items-center justify-end gap-2 md:mx-auto md:max-w-[9.5rem] md:gap-1.5">
                      <div className="flex items-center gap-1.5 md:gap-1">
                        <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 md:h-7 md:rounded-lg dark:border-zinc-600 dark:bg-zinc-900">
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
                            className="h-full w-12 border-0 bg-transparent px-1 py-0 text-center text-lg font-medium tabular-nums outline-none [appearance:textfield] focus:ring-0 md:w-9 md:text-sm md:font-normal [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label={`Quantité pour ${p.name}`}
                          />
                          <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-600">
                            <button
                              type="button"
                              className="flex h-5 w-7 items-center justify-center bg-zinc-50 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 md:h-[14px] md:w-5 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                              onClick={() => onQtyChange(p.id, qty + 1)}
                              aria-label="Augmenter la quantité"
                            >
                              <IconChevronUp className="h-3 w-3 md:h-2 md:w-2" />
                            </button>
                            <button
                              type="button"
                              disabled={qty <= 0}
                              className="flex h-5 w-7 items-center justify-center border-t border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 disabled:cursor-default disabled:opacity-40 md:h-[14px] md:w-5 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                              onClick={() =>
                                onQtyChange(p.id, Math.max(0, qty - 1))
                              }
                              aria-label="Diminuer la quantité"
                            >
                              <IconChevronDown className="h-3 w-3 md:h-2 md:w-2" />
                            </button>
                          </div>
                        </div>
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
