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
      <p className="text-sm font-semibold tracking-tight text-accent">
        Supply Table
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Connexion
      </h1>
      <p className="mt-2 text-sm text-muted">
        Accès réservé au catalogue et à l’historique des commandes.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted">Chargement…</p>}>
        <LoginForm authReady={ready} defaultEmail={email} />
      </Suspense>
    </div>
  );
}
