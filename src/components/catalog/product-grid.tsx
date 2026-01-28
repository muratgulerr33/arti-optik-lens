import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8",
        "md:grid-cols-4 md:gap-x-6 md:gap-y-10",
        className
      )}
    >
      {children}
    </div>
  );
}
