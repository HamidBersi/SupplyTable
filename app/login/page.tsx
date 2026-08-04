import { auth, getAuthConfigStatus } from "@/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");
  const { ready, email } = getAuthConfigStatus();

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[28rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
        <div className="absolute bottom-16 left-8 h-40 w-40 rounded-full bg-lime-100/50 blur-2xl dark:bg-lime-900/10" />
      </div>

      <div className="w-full max-w-[390px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-surface shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.03)] sm:rounded-[2.25rem]">
          <div
            aria-hidden
            className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-foreground/10 sm:mt-3.5"
          />

          <div className="px-6 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-9">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-accent-soft shadow-sm ring-1 ring-accent/10">
                <Image
                  src="/images/logo.webp"
                  alt="La Félicità"
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                  priority
                />
              </div>
              <h1 className="mt-5 text-[1.65rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[1.85rem]">
                Felicita{" "}
                <span className="bg-gradient-to-r from-accent to-emerald-600 bg-clip-text text-transparent">
                  commandes
                </span>
              </h1>
              <p className="mt-2 text-sm font-medium text-muted">Connexion</p>
            </div>

            <Suspense
              fallback={
                <p className="mt-10 text-center text-sm text-muted">
                  Chargement…
                </p>
              }
            >
              <LoginForm authReady={ready} defaultEmail={email} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
