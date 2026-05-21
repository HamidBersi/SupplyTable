"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginFormProps = {
  authReady: boolean;
  defaultEmail: string;
};

export function LoginForm({ authReady, defaultEmail }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [pending, setPending] = useState(false);
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
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {!authReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Authentification incomplète : définissez{" "}
          <code className="text-xs">AUTH_EMAIL</code> et{" "}
          <code className="text-xs">AUTH_PASSWORD_HASH_BASE64</code> dans{" "}
          <code className="text-xs">.env.local</code>, puis redémarrez{" "}
          <code className="text-xs">pnpm dev</code>.
        </p>
      ) : null}
      {error === "config" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Connexion impossible : configuration auth invalide.
        </p>
      ) : null}
      {error === "credentials" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Email ou mot de passe incorrect. Utilisez l’email configuré dans{" "}
          <code className="text-xs">AUTH_EMAIL</code> et le mot de passe passé à{" "}
          <code className="text-xs">npm run hash-password</code>.
        </p>
      ) : null}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultEmail}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mot de passe
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
