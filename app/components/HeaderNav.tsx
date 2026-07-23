"use client";

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
    ? "whitespace-nowrap rounded-md bg-accent-soft px-2.5 py-1 text-sm font-medium text-accent"
    : "whitespace-nowrap rounded-md px-2.5 py-1 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground";
}

export function HeaderNav({ session }: { session: Session | null }) {
  const pathname = usePathname();

  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 tracking-tight text-foreground transition hover:text-accent"
        >
          <span className="text-base font-semibold sm:text-lg">Supply Table</span>
        </Link>

        <nav className="flex max-w-full items-center gap-1 text-sm sm:gap-1.5">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={navLinkClass(active)}>
                {label}
              </Link>
            );
          })}
          <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
          <SignOutButton className="whitespace-nowrap rounded-md px-2.5 py-1 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground" />
        </nav>
      </div>
    </header>
  );
}
