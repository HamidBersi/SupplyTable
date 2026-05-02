"use client";

type SelectionMode = "all" | "selected";

type Props = {
  supplierValue: string;
  categoryValue: string;
  locationValue: string;
  /** N’afficher que les lignes avec quantité &gt; 0. */
  selectionMode: SelectionMode;
  supplierOptions: { id: string; name: string }[];
  categoryOptions: string[];
  locationOptions: string[];
  onSupplierChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSelectionModeChange: (v: SelectionMode) => void;
};

export function FilterBar({
  supplierValue,
  categoryValue,
  locationValue,
  selectionMode,
  supplierOptions,
  categoryOptions,
  locationOptions,
  onSupplierChange,
  onCategoryChange,
  onLocationChange,
  onSelectionModeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex min-w-[200px] flex-1 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Fournisseur
        </span>
        <select
          value={supplierValue}
          onChange={(e) => onSupplierChange(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="all">Tous les fournisseurs</option>
          {supplierOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Catégorie
        </span>
        <select
          value={categoryValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="all">Toutes</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Emplacement
        </span>
        <select
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="all">Tous</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[200px] flex-1 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Affichage
        </span>
        <select
          value={selectionMode}
          onChange={(e) =>
            onSelectionModeChange(e.target.value as SelectionMode)
          }
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="all">Tout le catalogue</option>
          <option value="selected">Sélectionnés uniquement</option>
        </select>
      </label>
    </div>
  );
}
