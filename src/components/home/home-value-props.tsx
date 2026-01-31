import { BadgeCheck, Truck, RefreshCcw } from "lucide-react";

const ITEMS = [
  {
    title: "%100 Orijinallik",
    description: "Tüm ürünlerimiz orijinal ve garantilidir.",
    Icon: BadgeCheck,
  },
  {
    title: "Hızlı Kargo",
    description: "Siparişleriniz hızlı ve güvenli kargoyla ulaşır.",
    Icon: Truck,
  },
  {
    title: "Kolay İade",
    description: "Memnun kalmazsanız kolay iade imkânı.",
    Icon: RefreshCcw,
  },
] as const;

export function HomeValueProps() {
  return (
    <section
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      data-testid="home-value-props"
    >
      {ITEMS.map(({ title, description, Icon }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm"
        >
          <span className="flex-shrink-0 text-primary" aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
