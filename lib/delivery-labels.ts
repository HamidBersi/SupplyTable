export type DeliveryChoice =
  | "today"
  | "tomorrow"
  | "day_after"
  | "custom";

export function humanDeliveryLabel(
  choice: DeliveryChoice,
  customDate: string,
): string {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  const now = new Date();

  switch (choice) {
    case "today":
      return `Aujourd'hui (${fmt.format(now)})`;
    case "tomorrow":
      return `Demain (${fmt.format(addDays(now, 1))})`;
    case "day_after":
      return `Après-demain (${fmt.format(addDays(now, 2))})`;
    case "custom": {
      if (!customDate) return "Date à préciser";
      const d = new Date(customDate + "T12:00:00");
      return fmt.format(d);
    }
    default:
      return "";
  }
}
