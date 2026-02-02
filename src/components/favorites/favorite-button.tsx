"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/components/favorites/favorites-provider";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
  /** Wishlist sayfasında kaldırma için özel handler (fade-out + gecikmeli listeden düşürme). */
  onRemoveFromWishlist?: (productId: number) => Promise<void>;
}

export function FavoriteButton({ productId, className, onRemoveFromWishlist }: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inList = isInWishlist(productId);
  const isWishlistPage = pathname === "/account/wishlist";
  const [isPending, setIsPending] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const pressTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const qs = new URLSearchParams(sp?.toString() ?? "");
  qs.delete("callbackUrl");
  const query = qs.toString();
  let current = query ? `${pathname}?${query}` : pathname;
  if (typeof current === "string" && (current.includes("http") || current.includes("://"))) {
    current = pathname;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading" || isPending) return;
    // Guest: redirect to login only; no server action / Next-Action POST.
    if (status !== "authenticated") {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          "ao:wishlist:intent",
          JSON.stringify({
            productId,
            returnTo: current,
            scrollY: window.scrollY,
            ts: Date.now(),
          })
        );
      }
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(current)}`);
      return;
    }
    setIsPending(true);
    try {
      if (isWishlistPage && inList && onRemoveFromWishlist) {
        await onRemoveFromWishlist(productId);
      } else {
        await toggleWishlist(productId);
      }
    } finally {
      setIsPending(false);
    }
  };

  const disabled = status === "loading" || isPending;

  const clearPressTimeout = React.useCallback(() => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
  }, []);

  const handlePointerDown = React.useCallback(() => {
      if (disabled) return;
      setIsPressed(true);
      clearPressTimeout();
      pressTimeoutRef.current = setTimeout(() => {
        pressTimeoutRef.current = null;
        setIsPressed(false);
      }, 120);
    },
    [disabled, clearPressTimeout]
  );

  const handlePointerUp = React.useCallback(() => {
    setIsPressed(false);
    clearPressTimeout();
  }, [clearPressTimeout]);

  React.useEffect(() => () => clearPressTimeout(), [clearPressTimeout]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled}
      aria-label={inList ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={cn(
        "absolute top-2 right-2 z-10 flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full",
        "bg-transparent",
        "transition-transform duration-100 ease-out will-change-transform",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-200",
        "active:scale-[0.92]",
        "hover:opacity-90",
        isPressed && "scale-[0.92]",
        isPending && "opacity-80 pointer-events-none",
        className
      )}
    >
      {isPending ? (
        <Loader2
          className="size-5 shrink-0 animate-spin text-zinc-900/25 drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]"
          aria-hidden
        />
      ) : (
        <Heart
          className={cn(
            "size-5 shrink-0 transition-colors drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]",
            inList ? "fill-red-500 text-red-500" : "fill-transparent text-zinc-900/25"
          )}
          aria-hidden
        />
      )}
    </button>
  );
}
