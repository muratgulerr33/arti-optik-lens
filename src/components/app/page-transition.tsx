"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Page transition wrapper: pathname-keyed, bg-background, CSS-only.
 * GPU-friendly: opacity + transform (translate3d) only; no JS timer/rAF.
 * scrollTo(0,0) not used — Next.js default scroll behavior (OS back / scroll restore).
 * Reduced motion: .page-enter-none in globals.css under prefers-reduced-motion.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "min-h-dvh w-full bg-background page-enter motion-reduce:page-enter-none",
        className
      )}
    >
      {children}
    </div>
  );
}
