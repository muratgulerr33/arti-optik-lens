import {
  HOME_BRAND_SLUGS,
  HOME_BRAND_DISPLAY_NAMES,
} from "./home-brand-config";
import { SectionHeader } from "./section-header";
import { HomeBrandGridItem } from "./home-brand-grid-item";

export function HomeBrandGrid() {
  return (
    <section data-testid="home-brand-grid">
      <SectionHeader
        title="Popüler Markalar"
        href="/search"
        hrefLabel="Tümünü Gör"
        ariaLabel="Tüm ürünleri gör"
      />
      <div className="grid grid-cols-2 gap-3 overflow-visible sm:grid-cols-4">
        {HOME_BRAND_SLUGS.map((slug) => (
          <HomeBrandGridItem
            key={slug}
            slug={slug}
            name={HOME_BRAND_DISPLAY_NAMES[slug]}
          />
        ))}
      </div>
    </section>
  );
}
