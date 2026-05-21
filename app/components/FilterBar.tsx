"use client";

type SelectionMode = "all" | "selected";

type Props = {
  searchValue: string;
  supplierValue: string;
  categoryValue: string;
  locationValue: string;
  selectionMode: SelectionMode;
  supplierOptions: { id: string; name: string }[];
  categoryOptions: string[];
  locationOptions: string[];
  onSearchChange: (v: string) => void;
  onSupplierChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSelectionModeChange: (v: SelectionMode) => void;
};

export function FilterBar({
  searchValue,
  supplierValue,
  categoryValue,
  locationValue,
  selectionMode,
  supplierOptions,
  categoryOptions,
  locationOptions,
  onSearchChange,
  onSupplierChange,
  onCategoryChange,
  onLocationChange,
  onSelectionModeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex w-full flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Rechercher
        </span>
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400"
            aria-hidden
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nom, code ou catégorie…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pr-16 pl-10 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-2 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Effacer la recherche"
            >
              Effacer
            </button>
          ) : null}
        </div>
      </label>

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
    </div>
  );
}
