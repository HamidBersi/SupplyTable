"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

const LONG_PRESS_MS = 480;
const MOVE_CANCEL_PX = 12;

type Props = {
  productName: string;
  onEdit: () => void;
  /** Demande de masquage (la confirmation est gérée plus haut). */
  onRequestHide: () => void;
  /** Contenu de la cellule « Produit » (zone d’appui long sur tactile). */
  children: ReactNode;
};

type MenuSource = "dots" | "press";

/**
 * Desktop : bouton ⋯.
 * Tactile : appui long sur la case produit.
 * Même menu dans les deux cas.
 */
export function ProductRowMenuCells({
  productName,
  onEdit,
  onRequestHide,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<MenuSource>("dots");
  const rootRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const openedByPress = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openMenu = useCallback((from: MenuSource) => {
    setSource(from);
    setOpen(true);
    if (from === "press" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || pressRef.current?.contains(t)) return;
      setOpen(false);
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

  useEffect(() => () => clearTimer(), [clearTimer]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startPos.current = { x: t.clientX, y: t.clientY };
    openedByPress.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      openedByPress.current = true;
      openMenu("press");
    }, LONG_PRESS_MS);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!startPos.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startPos.current.x);
    const dy = Math.abs(t.clientY - startPos.current.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearTimer();
  };

  const onTouchEnd = () => {
    clearTimer();
    startPos.current = null;
  };

  const menu = open ? (
    <ul
      id={menuId}
      role="menu"
      className={`absolute z-50 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg ${
        source === "dots" ? "left-0" : "left-0 top-full"
      }`}
    >
      <li role="none">
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
          Modifier…
        </button>
      </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => {
                setOpen(false);
                onRequestHide();
              }}
            >
              Masquer du tableau
            </button>
          </li>
    </ul>
  ) : null;

  return (
    <>
      {/* Desktop : ⋯ */}
      <td className="hidden px-1 py-2 align-middle md:table-cell md:px-2">
        <div ref={rootRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              if (open && source === "dots") setOpen(false);
              else openMenu("dots");
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-expanded={open && source === "dots"}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label={`Actions pour ${productName}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {source === "dots" ? menu : null}
        </div>
      </td>

      {/* Produit : appui long (tactile) */}
      <td className="min-w-0 px-2 py-3 md:px-4">
        <div
          ref={pressRef}
          className="relative min-w-0 touch-manipulation select-none md:select-text"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onContextMenu={(e) => {
            // Évite le menu natif après un appui long
            if (openedByPress.current) {
              e.preventDefault();
              openedByPress.current = false;
            }
          }}
        >
          {children}
          {source === "press" ? menu : null}
        </div>
      </td>
    </>
  );
}
