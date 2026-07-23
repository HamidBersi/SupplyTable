"use client";

import { sentenceCaseFr } from "@/lib/text";

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
        <span className="field-label">Rechercher</span>
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"
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
            className="field-input w-full py-2.5 pr-16 pl-10"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-2 rounded-md px-2 text-xs text-muted hover:bg-surface-muted hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              Effacer
            </button>
          ) : null}
        </div>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="field-label">Fournisseur</span>
          <select
            value={supplierValue}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="field-select"
          >
            <option value="all">Tous les fournisseurs</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {sentenceCaseFr(s.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[180px] flex-1 flex-col gap-1">
          <span className="field-label">Catégorie</span>
          <select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="field-select"
          >
            <option value="all">Toutes</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {sentenceCaseFr(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[180px] flex-1 flex-col gap-1">
          <span className="field-label">Emplacement</span>
          <select
            value={locationValue}
            onChange={(e) => onLocationChange(e.target.value)}
            className="field-select"
          >
            <option value="all">Tous</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {sentenceCaseFr(loc)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="field-label">Affichage</span>
          <select
            value={selectionMode}
            onChange={(e) =>
              onSelectionModeChange(e.target.value as SelectionMode)
            }
            className="field-select"
          >
            <option value="all">Tout le catalogue</option>
            <option value="selected">Sélectionnés uniquement</option>
          </select>
        </label>
      </div>
    </div>
  );
}
