import type { OrderLine } from "@/types/supply";

const MAX_MAILTO_LENGTH = 1800;

export function buildOrderEmailBody(params: {
  restaurantName: string;
  supplierName: string;
  deliveryLabel: string;
  lines: OrderLine[];
}): string {
  const { restaurantName, supplierName, deliveryLabel, lines } = params;
  const header = [
    `Bonjour,`,
    ``,
    `Commande pour : ${restaurantName}`,
    `Fournisseur : ${supplierName}`,
    `Livraison souhaitée : ${deliveryLabel}`,
    ``,
    `Détail :`,
  ].join("\n");

  const detail = lines
    .map((l) => `- [${l.code}] ${l.name} — ${l.qty} ${l.unit}`)
    .join("\n");

  return `${header}\n${detail}\n\nCordialement`;
}

export function buildMailtoHref(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const { to, subject, body } = params;
  const q = (s: string) => encodeURIComponent(s);
  let href = `mailto:${q(to)}?subject=${q(subject)}&body=${q(body)}`;
  if (href.length > MAX_MAILTO_LENGTH) {
    const truncated =
      body.slice(0, Math.max(0, body.length - (href.length - MAX_MAILTO_LENGTH) - 40)) +
      "\n[… message tronqué — raccourcir la commande]";
    href = `mailto:${q(to)}?subject=${q(subject)}&body=${q(truncated)}`;
  }
  return href;
}
