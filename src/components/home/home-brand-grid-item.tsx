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
      className="flex min-h-[88px] h-[88px] flex-shrink-0 select-none touch-manipulation items-center justify-center rounded-2xl border border-border bg-white px-3 py-3 shadow-sm ring-1 ring-inset ring-black/5 transition-[transform,box-shadow,background-color] duration-150 ease-out active:scale-[0.98] active:translate-y-[1px] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none dark:bg-white dark:ring-black/10"
    >
      <span className="flex h-[72px] w-full items-center justify-center">
        <BrandLogoTile slug={slug} name={name} />
      </span>
    </Link>
  );
}
