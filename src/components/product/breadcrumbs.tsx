import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-6 max-w-full overflow-hidden", className)}
    >
      <ol className="flex min-w-0 max-w-full flex-nowrap items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isFirst = idx === 0;

          return (
            <li
              key={`${idx}-${item.label}`}
              className={cn(
                "flex items-center gap-1",
                isLast ? "min-w-0 flex-1" : "shrink-0"
              )}
            >
              {!isFirst && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="min-w-0 flex-1 truncate font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href!}
                  className="shrink-0 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
