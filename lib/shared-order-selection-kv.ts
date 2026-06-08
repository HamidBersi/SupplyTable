import { kv } from "@vercel/kv";
import type { SharedOrderSelection } from "@/lib/shared-order-selection";

const KV_KEY = "supply-table:shared-order-selection";

export function isSharedSelectionConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() &&
      process.env.KV_REST_API_TOKEN?.trim(),
  );
}

export async function readSharedOrderSelection(): Promise<SharedOrderSelection | null> {
  if (!isSharedSelectionConfigured()) return null;
  try {
    const data = await kv.get<SharedOrderSelection>(KV_KEY);
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

export async function writeSharedOrderSelection(
  payload: SharedOrderSelection,
): Promise<boolean> {
  if (!isSharedSelectionConfigured()) return false;
  try {
    await kv.set(KV_KEY, payload);
    return true;
  } catch {
    return false;
  }
}
