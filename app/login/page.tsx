import { auth, getAuthConfigStatus } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");
  const { ready, email } = getAuthConfigStatus();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Connexion
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Accès réservé au catalogue et à l’historique des commandes.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Chargement…</p>}>
        <LoginForm authReady={ready} defaultEmail={email} />
      </Suspense>
    </div>
  );
}
