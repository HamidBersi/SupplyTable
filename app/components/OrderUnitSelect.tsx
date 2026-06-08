"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { OrderUnitOption } from "@/lib/order-unit-options";

type Props = {
  valueId: string;
  options: readonly OrderUnitOption[];
  abbrev: string;
  profileKey: string;
  savedDefaultId: string | undefined;
  productName: string;
  onChange: (unitId: string) => void;
  onSetDefault: (profileKey: string, unitId: string) => void;
};

export function OrderUnitSelect({
  valueId,
  options,
  abbrev,
  profileKey,
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
        className="shrink-0 text-xs font-bold uppercase tracking-wide text-zinc-500 md:text-[11px] dark:text-zinc-400"
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
        className="inline-flex items-center gap-0.5 rounded-md px-1 py-1 text-xs font-bold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:px-0.5 md:py-0.5 md:text-[11px] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={`Unité de commande pour ${productName} : ${abbrev}`}
      >
        <span>{abbrev}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-zinc-400 transition md:h-3.5 md:w-3.5 ${open ? "rotate-180" : ""}`}
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
          className="absolute right-0 z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((opt) => {
            const selected = opt.id === valueId;
            const isDefault = opt.id === savedDefaultId;
            return (
              <li key={opt.id} role="option" aria-selected={selected}>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 text-left text-sm ${
                    selected
                      ? "bg-emerald-50 dark:bg-emerald-950/40"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
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
                    <span className="w-8 shrink-0 text-xs font-bold uppercase text-zinc-800 dark:text-zinc-100">
                      {opt.abbrev}
                    </span>
                    <span className="truncate text-zinc-600 dark:text-zinc-300">
                      {opt.label}
                    </span>
                  </button>
                  <label
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Utiliser par défaut pour ce type de produit"
                  >
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={() => {
                        onSetDefault(profileKey, opt.id);
                        onChange(opt.id);
                      }}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/40"
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
