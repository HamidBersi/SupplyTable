import type { OrderLine } from "@/types/supply";
import { sentenceCaseFr } from "@/lib/text";

const MAX_MAILTO_LENGTH = 1800;

export const RESTAURANT_NAME = "LA FELICITA SAS";
export const RESTAURANT_ADDRESS = "52 rue de Strasbourg, 67117 Furdenheim";

export { sentenceCaseFr } from "@/lib/text";

export function formatOrderEmailLine(line: OrderLine): string {
  const unit = line.unit.trim().toUpperCase();
  return `- ${sentenceCaseFr(line.name)} — ${line.qty} ${unit}`;
}

export function buildOrderEmailBody(params: {
  deliveryLabel: string;
  lines: OrderLine[];
}): string {
  const { deliveryLabel, lines } = params;
  const header = [
    `Bonjour,`,
    ``,
    `Commande pour : ${RESTAURANT_NAME}`,
    `Adresse de livraison : ${RESTAURANT_ADDRESS}`,
    `Livraison souhaitée : ${deliveryLabel}`,
    ``,
    `Détail :`,
  ].join("\n");

  const detail = lines.map(formatOrderEmailLine).join("\n");

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
