"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginFormProps = {
  authReady: boolean;
  defaultEmail: string;
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function LoginForm({ authReady, defaultEmail }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<"config" | "credentials" | false>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authReady) {
      setError("config");
      return;
    }
    setError(false);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("credentials");
        setPending(false);
        return;
      }
      window.location.assign(res?.url ?? callbackUrl);
    } catch {
      setError("credentials");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {!authReady ? (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Authentification incomplète : définissez{" "}
          <code className="text-xs">AUTH_EMAIL</code> et{" "}
          <code className="text-xs">AUTH_PASSWORD_HASH_BASE64</code> dans{" "}
          <code className="text-xs">.env.local</code>, puis redémarrez{" "}
          <code className="text-xs">pnpm dev</code>.
        </p>
      ) : null}
      {error === "config" ? (
        <p className="rounded-2xl border border-red-200/80 bg-red-50 px-3.5 py-3 text-[13px] text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Connexion impossible : configuration auth invalide.
        </p>
      ) : null}
      {error === "credentials" ? (
        <p className="rounded-2xl border border-red-200/80 bg-red-50 px-3.5 py-3 text-[13px] text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Mot de passe ou identifiant incorrect.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-surface-muted ring-1 ring-border/70">
        <label className="block px-4 pt-3 pb-2">
          <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultEmail}
            required
            className="mt-1 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted/60"
            placeholder="vous@exemple.com"
          />
        </label>
        <div className="mx-4 h-px bg-border/80" />
        <label className="block px-4 pt-3 pb-3">
          <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
            Mot de passe
          </span>
          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="w-full bg-transparent py-0.5 pr-10 text-[15px] text-foreground outline-none placeholder:text-muted/60"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-1 text-muted transition hover:text-foreground"
              aria-pressed={showPassword}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-accent-fg shadow-sm transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
