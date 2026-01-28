import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 overflow-hidden">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap overflow-hidden min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 flex-shrink-0",
                isLast && "min-w-0 flex-1 overflow-hidden"
              )}
            >
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "truncate block min-w-0",
                    isLast && "text-foreground font-medium"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate inline-block min-w-0 max-w-full"
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
