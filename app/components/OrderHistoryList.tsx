"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderStatus, StoredOrder } from "@/types/supply";
import { loadOrders, updateOrderStatus } from "@/lib/orders-storage";
import { sentenceCaseFr } from "@/lib/text";
import { EmptyState } from "./EmptyState";

const STATUS_LABELS: Record<OrderStatus, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  en_cours: "En cours",
  recue: "Reçue",
  annulee: "Annulée",
};

const STATUS_ORDER: OrderStatus[] = [
  "brouillon",
  "envoyee",
  "en_cours",
  "recue",
  "annulee",
];

export function OrderHistoryList() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  const refresh = useCallback(() => {
    setOrders(loadOrders());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (orders.length === 0) {
    return (
      <EmptyState>
        Aucune commande enregistrée pour l’instant. Passez une commande depuis
        le catalogue pour alimenter l’historique.
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li
          key={o.id}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">
                {sentenceCaseFr(o.supplierName)}
              </p>
              <p className="text-xs text-muted">
                {new Date(o.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-2 text-sm text-muted">
                <span className="font-medium text-foreground">Livraison : </span>
                {o.deliveryPreference}
              </p>
            </div>
            <label className="flex flex-col gap-1 sm:items-end">
              <span className="field-label">Statut</span>
              <select
                value={o.status}
                onChange={(e) => {
                  const status = e.target.value as OrderStatus;
                  updateOrderStatus(o.id, status);
                  refresh();
                }}
                className="field-select"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className="mt-3 border-t border-border pt-3 text-sm">
            {o.lines.map((l) => (
              <li key={`${o.id}-${l.productId}`} className="py-0.5">
                {sentenceCaseFr(l.name)}{" "}
                <span className="tabular-nums text-foreground">
                  × {l.qty} {l.unit.trim().toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
