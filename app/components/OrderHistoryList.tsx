"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderStatus, StoredOrder } from "@/types/supply";
import { loadOrders, updateOrderStatus } from "@/lib/orders-storage";

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
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
        Aucune commande enregistrée pour l’instant. Passez une commande depuis
        le catalogue pour alimenter l’historique.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li
          key={o.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {o.supplierName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(o.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">
                  Livraison :{" "}
                </span>
                {o.deliveryPreference}
              </p>
            </div>
            <label className="flex flex-col gap-1 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Statut
              </span>
              <select
                value={o.status}
                onChange={(e) => {
                  const status = e.target.value as OrderStatus;
                  updateOrderStatus(o.id, status);
                  refresh();
                }}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className="mt-3 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
            {o.lines.map((l) => (
              <li key={`${o.id}-${l.productId}`} className="py-0.5">
                <span className="font-mono text-xs text-zinc-500">{l.code}</span>{" "}
                {l.name}{" "}
                <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
                  × {l.qty} {l.unit}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
