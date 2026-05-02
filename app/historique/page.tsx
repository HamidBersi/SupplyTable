import { OrderHistoryList } from "@/app/components/OrderHistoryList";

export default function HistoriquePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Historique des commandes
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Les commandes sont enregistrées dans ce navigateur (stockage local).
      </p>
      <div className="mt-8">
        <OrderHistoryList />
      </div>
    </div>
  );
}
