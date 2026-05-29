import Link from "next/link";
import type { Session } from "next-auth";
import { SignOutButton } from "@/app/components/SignOutButton";

export function HeaderNav({ session }: { session: Session | null }) {
  if (!session) return null;

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-center px-3 sm:h-14 sm:px-6">
        <nav className="flex max-w-full items-center gap-2.5 text-xs sm:gap-4 sm:text-sm">
          <Link
            href="/"
            className="whitespace-nowrap text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Catalogue
          </Link>
          <Link
            href="/historique"
            className="whitespace-nowrap text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Historique
          </Link>
          <SignOutButton className="whitespace-nowrap text-xs sm:text-sm" />
        </nav>
      </div>
    </header>
  );
}
