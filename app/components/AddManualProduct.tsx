"use client";

import { useState } from "react";

type Props = {
  supplierLabel: string;
  onAdd: (name: string) => void;
};

export function AddManualProduct({ supplierLabel, onAdd }: Props) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    const t = value.trim();
    if (!t) {
      setErr("Indiquez un nom de produit.");
      return;
    }
    setErr(null);
    onAdd(t);
    setValue("");
  };

  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-3 dark:border-zinc-600 dark:bg-zinc-900/40">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Produit hors catalogue — {supplierLabel}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErr(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Ex. : persil plat botte"
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Ajouter à la liste
        </button>
      </div>
      {err && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{err}</p>
      )}
    </div>
  );
}
