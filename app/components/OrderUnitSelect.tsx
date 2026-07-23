"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { OrderUnitOption } from "@/lib/order-unit-options";

type Props = {
  valueId: string;
  options: readonly OrderUnitOption[];
  abbrev: string;
  productId: string;
  savedDefaultId: string | undefined;
  productName: string;
  onChange: (unitId: string) => void;
  onSetDefault: (productId: string, unitId: string) => void;
};

export function OrderUnitSelect({
  valueId,
  options,
  abbrev,
  productId,
  savedDefaultId,
  productName,
  onChange,
  onSetDefault,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (options.length <= 1) {
    return (
      <span
        className="min-w-[2.25rem] shrink-0 text-center text-[11px] font-semibold tracking-wide text-muted uppercase"
        title={options[0]?.label ?? abbrev}
      >
        {abbrev}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-w-[2.75rem] items-center justify-center gap-0.5 rounded-md px-1.5 py-1.5 text-[11px] font-semibold tracking-wide text-foreground uppercase transition hover:bg-surface-muted"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={`Unité de commande pour ${productName} : ${abbrev}`}
      >
        <span>{abbrev}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3.5 w-3.5 text-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {options.map((opt) => {
            const selected = opt.id === valueId;
            const isDefault = opt.id === savedDefaultId;
            return (
              <li key={opt.id} role="option" aria-selected={selected}>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 text-left text-sm ${
                    selected
                      ? "bg-accent-soft"
                      : "hover:bg-surface-muted"
                  }`}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onClick={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                  >
                    <span className="w-8 shrink-0 text-xs font-bold text-foreground uppercase">
                      {opt.abbrev}
                    </span>
                    <span className="truncate text-muted">{opt.label}</span>
                  </button>
                  <label
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-muted hover:bg-surface-muted"
                    title="Utiliser par défaut pour ce produit"
                  >
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={() => {
                        onSetDefault(productId, opt.id);
                        onChange(opt.id);
                      }}
                      className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-ring"
                    />
                    <span className="sr-only">Par défaut</span>
                    <span aria-hidden>déf.</span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
