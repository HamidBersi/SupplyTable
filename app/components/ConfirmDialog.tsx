"use client";

import { useDialog } from "@/lib/use-dialog";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  onConfirm,
  onClose,
}: Props) {
  const dialogRef = useDialog(open, onClose);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,24rem)] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/45"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={
            tone === "danger"
              ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              : "btn-primary"
          }
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
