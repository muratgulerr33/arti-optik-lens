import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  HOME_BRAND_SLUGS,
  HOME_BRAND_DISPLAY_NAMES,
} from "./home-brand-config";
import { HomeBrandGridItem } from "./home-brand-grid-item";

export function HomeBrandGrid() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">
        Popüler Markalar
      </h2>
      <div className="grid grid-cols-2 gap-3 overflow-visible">
        {HOME_BRAND_SLUGS.map((slug) => (
          <HomeBrandGridItem
            key={slug}
            slug={slug}
            name={HOME_BRAND_DISPLAY_NAMES[slug]}
          />
        ))}
        {/* Link to /search for now */}
        <Link
          href="/search"
          aria-label="Tüm markaları gör"
          className="flex h-[88px] min-h-[88px] flex-shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-primary/25 bg-white px-3 py-3 text-center font-medium text-primary transition-transform hover:bg-primary/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-white dark:text-primary dark:hover:bg-primary/5"
        >
          Tümünü Gör
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      </div>
    </section>
  );
}
