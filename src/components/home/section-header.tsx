import { ChevronRight } from "lucide-react";
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  href?: string;
  hrefLabel?: string;
  /** Erişilebilirlik için; görünür metin hrefLabel, ekran okuyucu bunu kullanır. */
  ariaLabel?: string;
};

export function SectionHeader({
  title,
  href,
  hrefLabel = "Tümünü Gör",
  ariaLabel,
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          aria-label={ariaLabel ?? hrefLabel}
          className="inline-flex touch-manipulation select-none items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-primary transition-[transform,box-shadow,background-color] duration-150 ease-out hover:underline active:scale-[0.98] active:translate-y-[1px] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none"
        >
          {hrefLabel}
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      )}
    </div>
  );
}
