import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function EmptyState({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-surface-muted/80 px-6 py-12 text-center text-sm text-muted ${className}`}
    >
      {children}
    </div>
  );
}
