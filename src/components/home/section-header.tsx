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
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {hrefLabel}
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      )}
    </div>
  );
}
