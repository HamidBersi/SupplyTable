import Link from "next/link";

export function HeaderNav() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Supply Table
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Catalogue
          </Link>
          <Link
            href="/historique"
            className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}
