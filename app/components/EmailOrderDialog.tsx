"use client";

import { useState } from "react";
import type { OrderLine, Supplier } from "@/types/supply";
import {
  buildMailtoHref,
  buildOrderEmailBody,
  RESTAURANT_NAME,
} from "@/lib/mailto-order";
import { sentenceCaseFr } from "@/lib/text";
import {
  humanDeliveryLabel,
  type DeliveryChoice,
} from "@/lib/delivery-labels";
import { saveOrder } from "@/lib/orders-storage";
import { useDialog } from "@/lib/use-dialog";

type Props = {
  supplier: Supplier;
  lines: OrderLine[];
  open: boolean;
  onClose: () => void;
};

export function EmailOrderDialog({ supplier, lines, open, onClose }: Props) {
  const dialogRef = useDialog(open, onClose);
  const [choice, setChoice] = useState<DeliveryChoice>("tomorrow");
  const [customDate, setCustomDate] = useState("");

  const deliveryLabel = humanDeliveryLabel(choice, customDate);
  const body = buildOrderEmailBody({
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
      className="w-[min(100%,480px)] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/40"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">Commande par e-mail</h2>
        <p className="mt-1 text-sm text-muted">
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
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "bg-surface-muted text-foreground hover:bg-border/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {choice === "custom" && (
          <label className="flex flex-col gap-1">
            <span className="field-label">Date</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="field-input"
            />
          </label>
        )}

        <div className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
          <span className="font-medium text-muted">Livraison : </span>
          {deliveryLabel}
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Sélectionnez au moins une quantité dans le tableau.
          </p>
        ) : (
          <ul className="max-h-40 overflow-auto rounded-lg border border-border text-sm">
            {lines.map((l) => (
              <li
                key={l.productId}
                className="border-b border-border px-3 py-2 last:border-0"
              >
                {sentenceCaseFr(l.name)}{" "}
                <span className="tabular-nums font-medium">
                  × {l.qty} {l.unit.trim().toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
        <button type="button" onClick={onClose} className="btn-ghost">
          Annuler
        </button>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => {
            void navigator.clipboard.writeText(body).catch(() => {});
          }}
          className="btn-secondary"
        >
          Copier le texte
        </button>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={handlePrimary}
          className="btn-primary"
        >
          Ouvrir l’e-mail
        </button>
      </div>
    </dialog>
  );
}
