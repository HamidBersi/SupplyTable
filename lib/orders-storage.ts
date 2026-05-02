import type { OrderStatus, StoredOrder } from "@/types/supply";

const STORAGE_KEY = "supply-table-orders-v1";

function safeParse(raw: string | null): StoredOrder[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as StoredOrder[];
  } catch {
    return [];
  }
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveOrder(order: StoredOrder): void {
  const all = loadOrders();
  all.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const all = loadOrders();
  const next = all.map((o) => (o.id === id ? { ...o, status } : o));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
