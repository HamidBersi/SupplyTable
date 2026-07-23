"use client";

import type { Supplier } from "@/types/supply";

type Props = {
  supplier: Supplier;
  selectedCount: number;
  /** Somme estimée Σ(qté × PU catalogue), même devise que le seuil. */
  estimatedSubtotalHt: number;
  onOpenEmail: () => void;
};

function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function telHref(phone: string): string {
  const digits = phone.replace(/\s/g, "");
  if (digits.startsWith("0")) return `tel:+33${digits.slice(1)}`;
  return `tel:${digits}`;
}

export function OrderDock({
  supplier,
  selectedCount,
  estimatedSubtotalHt,
  onOpenEmail,
}: Props) {
  const threshold = supplier.freeDeliveryMinHt;
  const hasThreshold =
    typeof threshold === "number" && threshold > 0 && Number.isFinite(threshold);
  const meetsFreeDelivery =
    hasThreshold && estimatedSubtotalHt >= (threshold as number);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-foreground">Passer la commande</p>
          {hasThreshold && (
            <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
              <div
                className={
                  meetsFreeDelivery
                    ? "inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent shadow-sm"
                    : "inline-flex max-w-full items-center gap-2 rounded-full border border-amber-500/50 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 shadow-sm dark:border-amber-400/40 dark:bg-amber-950/45 dark:text-amber-100"
                }
                role="status"
                aria-label={
                  meetsFreeDelivery
                    ? "Seuil de livraison gratuite atteint"
                    : "Seuil de livraison gratuite non atteint"
                }
              >
                <span
                  className={
                    meetsFreeDelivery
                      ? "h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
                      : "h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"
                  }
                  aria-hidden
                />
                <span>
                  {meetsFreeDelivery
                    ? "Livraison offerte (estimation)"
                    : "Sous le seuil livraison offerte"}
                </span>
              </div>
              <span className="text-xs tabular-nums text-muted">
                Estim.{" "}
                <strong className="text-foreground">
                  {formatEuro(estimatedSubtotalHt)}
                </strong>
                {" / "}
                seuil {formatEuro(threshold as number)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <a
            href={telHref(supplier.phone)}
            className="btn-secondary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 sm:flex-none"
          >
            Appeler
          </a>
          <button
            type="button"
            onClick={onOpenEmail}
            className="btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 sm:flex-none"
          >
            Envoi e-mail
          </button>
        </div>
      </div>
    </div>
  );
}
