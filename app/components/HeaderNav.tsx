"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { SignOutButton } from "@/app/components/SignOutButton";

const links = [
  { href: "/", label: "Catalogue" },
  { href: "/historique", label: "Historique" },
] as const;

function navLinkClass(active: boolean) {
  return active
    ? "whitespace-nowrap rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent sm:px-3 sm:text-[13px]"
    : "whitespace-nowrap rounded-lg px-2.5 py-1 text-xs text-muted transition hover:bg-surface-muted hover:text-foreground sm:px-3 sm:text-[13px]";
}

export function HeaderNav({ session }: { session: Session | null }) {
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 transition sm:gap-3"
        >
          <Image
            src="/images/logo.webp"
            alt="La Félicità"
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-foreground group-hover:text-accent sm:text-base">
              Felicita commandes
            </span>
            <span className="hidden text-[11px] text-muted sm:block">
              Commandes fournisseurs
            </span>
          </span>
        </Link>

        <nav className="flex max-w-full items-center gap-2 text-sm sm:gap-3.5">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={navLinkClass(active)}>
                {label}
              </Link>
            );
          })}
          <span
            className="mx-0.5 hidden h-4 w-px bg-border sm:mx-1 sm:block"
            aria-hidden
          />
          <SignOutButton className="whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:px-3 sm:text-[13px] dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300" />
        </nav>
      </div>
    </header>
  );
}
