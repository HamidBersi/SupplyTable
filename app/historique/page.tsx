import { OrderHistoryList } from "@/app/components/OrderHistoryList";

export default function HistoriquePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Historique des commandes
      </h1>
      <p className="mt-2 text-sm text-muted">
        Les commandes sont enregistrées dans ce navigateur (stockage local).
      </p>
      <div className="mt-8">
        <OrderHistoryList />
      </div>
    </div>
  );
}
