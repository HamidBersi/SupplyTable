"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderLine, Supplier } from "@/types/supply";
import { buildMailtoHref, buildOrderEmailBody } from "@/lib/mailto-order";
import {
  humanDeliveryLabel,
  type DeliveryChoice,
} from "@/lib/delivery-labels";
import { saveOrder } from "@/lib/orders-storage";

const RESTAURANT_NAME = "LA FELICITA SAS";

type Props = {
  supplier: Supplier;
  lines: OrderLine[];
  open: boolean;
  onClose: () => void;
};

export function EmailOrderDialog({ supplier, lines, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState<DeliveryChoice>("tomorrow");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const sync = () => onClose();
    el.addEventListener("close", sync);
    return () => el.removeEventListener("close", sync);
  }, [onClose]);

  const deliveryLabel = humanDeliveryLabel(choice, customDate);
  const body = buildOrderEmailBody({
    restaurantName: RESTAURANT_NAME,
    supplierName: supplier.name,
    deliveryLabel,
    lines,
  });

  const handlePrimary = () => {
    if (lines.length === 0) return;

    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: "envoyee" as const,
      deliveryPreference: deliveryLabel,
      lines,
    };
    saveOrder(order);

    const to = supplier.orderEmail.trim();
    if (!to) {
      window.alert(
        "Aucune adresse e-mail de commande pour ce fournisseur. Ajoutez « orderEmail » dans data/suppliers.json. Le message est copiable ci-dessous.",
      );
      return;
    }

    const href = buildMailtoHref({
      to,
      subject: `Commande ${RESTAURANT_NAME} — ${supplier.name}`,
      body,
    });
    window.location.href = href;
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,480px)] rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Commande par e-mail</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Quand souhaitez-vous être livré(e) ?
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["today", "Aujourd'hui"],
              ["tomorrow", "Demain"],
              ["day_after", "Après-demain"],
              ["custom", "Autre date"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setChoice(key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                choice === key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {choice === "custom" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Date
            </span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
        )}

        <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Livraison :{" "}
          </span>
          {deliveryLabel}
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Sélectionnez au moins une quantité dans le tableau.
          </p>
        ) : (
          <ul className="max-h-40 overflow-auto rounded-lg border border-zinc-200 text-sm dark:border-zinc-700">
            {lines.map((l) => (
              <li
                key={l.productId}
                className="border-b border-zinc-100 px-3 py-2 last:border-0 dark:border-zinc-800"
              >
                <span className="font-mono text-xs text-zinc-500">{l.code}</span>{" "}
                {l.name}{" "}
                <span className="tabular-nums font-medium">
                  × {l.qty} {l.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => {
            void navigator.clipboard.writeText(body).catch(() => {});
          }}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Copier le texte
        </button>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={handlePrimary}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
        >
          Ouvrir l’e-mail
        </button>
      </div>
    </dialog>
  );
}
