"use client";

import type { Product } from "@/types/supply";
import {
  getOrderUnitProfile,
  orderUnitAbbrev,
  resolveOrderUnitId,
} from "@/lib/order-unit-options";
import { sentenceCaseFr } from "@/lib/text";
import { EmptyState } from "./EmptyState";
import { OrderUnitSelect } from "./OrderUnitSelect";
import { ProductRowMenuCells } from "./ProductRowMenu";

function IconMinus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function formatPrice(n: number): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

type Props = {
  products: Product[];
  quantities: Record<string, number>;
  orderUnits: Record<string, string>;
  onQtyChange: (productId: string, qty: number) => void;
  onOrderUnitChange: (productId: string, unitId: string) => void;
  onSetUnitDefault: (productId: string, unitId: string) => void;
  onEditProduct: (product: Product) => void;
  onRequestHideProduct: (product: Product) => void;
};

export function ProductTable({
  products,
  quantities,
  orderUnits,
  onQtyChange,
  onOrderUnitChange,
  onSetUnitDefault,
  onEditProduct,
  onRequestHideProduct,
}: Props) {
  if (products.length === 0) {
    return (
      <EmptyState>Aucun produit ne correspond à ces filtres.</EmptyState>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="max-md:overflow-visible md:overflow-x-auto">
        <table className="w-full border-collapse text-left text-base md:text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/90 text-[11px] font-medium tracking-wider text-muted uppercase">
              <th className="hidden w-9 px-1 py-3 md:table-cell md:px-2">
                <span className="sr-only">Actions</span>
              </th>
              <th className="px-2 py-3 md:px-4">Produit</th>
              <th className="hidden px-4 py-3 md:table-cell">Catégorie</th>
              <th className="hidden px-4 py-3 md:table-cell">Lieu</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">
                PU HT
              </th>
              <th className="w-[9.5rem] shrink-0 px-2 py-3 text-right md:w-[10rem] md:px-4 md:text-left">
                Qté
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const qty = quantities[p.id] ?? 0;
              const selected = qty > 0;
              const profile = getOrderUnitProfile(p);
              const unitId = resolveOrderUnitId(p, orderUnits);
              const abbrev = orderUnitAbbrev(unitId);
              const name = sentenceCaseFr(p.name);
              const category = sentenceCaseFr(p.category);
              const location = sentenceCaseFr(p.location);

              return (
                <tr
                  key={p.id}
                  className={`border-b border-border/60 transition-colors last:border-0 ${
                    selected
                      ? "bg-accent-soft/70"
                      : "bg-surface hover:bg-surface-muted/50"
                  }`}
                >
                  <ProductRowMenuCells
                    productName={name}
                    onEdit={() => onEditProduct(p)}
                    onRequestHide={() => onRequestHideProduct(p)}
                  >
                    <div className="min-w-0">
                      <span className="text-[15px] leading-snug font-medium text-foreground md:text-sm">
                        {name}
                      </span>
                      <p className="mt-0.5 text-xs text-muted md:hidden">
                        {category}
                        <span className="mx-1 text-border">·</span>
                        {location}
                        {!(p.isManual && p.unitPrice <= 0) ? (
                          <>
                            <span className="mx-1 text-border">·</span>
                            <span className="tabular-nums">
                              {formatPrice(p.unitPrice)} €
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </ProductRowMenuCells>

                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted md:table-cell">
                    {category}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted md:table-cell">
                    {location}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground md:table-cell">
                    {p.isManual && p.unitPrice <= 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span>
                        {formatPrice(p.unitPrice)}{" "}
                        <span className="text-muted">
                          €/{p.unit.trim().toUpperCase()}
                        </span>
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-2.5 md:px-4">
                    <div className="flex items-center justify-end gap-1.5 md:justify-start">
                      <div
                        className={`flex h-9 shrink-0 items-stretch overflow-hidden rounded-lg border bg-surface md:h-8 ${
                          selected
                            ? "border-accent/40 shadow-sm"
                            : "border-border"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={qty <= 0}
                          className="flex w-8 items-center justify-center text-muted transition hover:bg-surface-muted hover:text-foreground disabled:cursor-default disabled:opacity-30 md:w-7"
                          onClick={() =>
                            onQtyChange(p.id, Math.max(0, qty - 1))
                          }
                          aria-label="Diminuer la quantité"
                        >
                          <IconMinus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={qty || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? 0 : Math.max(0, Number(v));
                            onQtyChange(p.id, Number.isFinite(n) ? n : 0);
                          }}
                          className={`w-10 border-x border-border bg-transparent text-center text-base font-semibold tabular-nums outline-none [appearance:textfield] placeholder:font-normal placeholder:text-muted/50 focus:ring-0 md:w-9 md:text-sm ${
                            selected ? "text-accent" : "text-foreground"
                          } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                          aria-label={`Quantité pour ${name}`}
                        />
                        <button
                          type="button"
                          className="flex w-8 items-center justify-center text-muted transition hover:bg-surface-muted hover:text-foreground md:w-7"
                          onClick={() => onQtyChange(p.id, qty + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          <IconPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <OrderUnitSelect
                        valueId={unitId}
                        abbrev={abbrev}
                        options={profile.units}
                        productId={p.id}
                        savedDefaultId={orderUnits[p.id]}
                        productName={name}
                        onChange={(id) => onOrderUnitChange(p.id, id)}
                        onSetDefault={onSetUnitDefault}
                      />
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
