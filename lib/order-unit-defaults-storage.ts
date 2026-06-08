/**
 * @deprecated Utiliser `order-selection-storage` (v2).
 */
import { loadOrderSelection } from "@/lib/order-selection-storage";

export function loadOrderUnitDefaults(): Record<string, string> {
  return loadOrderSelection().profileUnitDefaults;
}
