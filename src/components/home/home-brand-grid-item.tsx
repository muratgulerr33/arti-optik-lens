import Link from "next/link";
import { BrandLogoTile } from "./brand-logo-tile";

type HomeBrandGridItemProps = {
  slug: string;
  name: string;
};

export function HomeBrandGridItem({ slug, name }: HomeBrandGridItemProps) {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(slug)}`}
      aria-label={`${name} markası için ara`}
      className="flex min-h-[88px] h-[88px] flex-shrink-0 select-none touch-manipulation items-center justify-center rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-sm transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-white"
    >
      <span className="flex h-[72px] w-full items-center justify-center">
        <BrandLogoTile slug={slug} name={name} />
      </span>
    </Link>
  );
}
