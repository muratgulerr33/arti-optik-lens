"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  getWishlistProductIds,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
} from "@/app/actions/wishlist";

const WISHLIST_INTENT_KEY = "ao:wishlist:intent";

type WishlistIntent = {
  productId: number;
  returnTo: string;
  scrollY: number;
  ts: number;
};

// ---------------------------------------------------------------------------
// Provider contract: state + API
// ---------------------------------------------------------------------------

export type WishlistContextValue = {
  /** Favorideki ürün id'leri (product.id). Giriş yoksa boş dizi. */
  wishlistProductIds: number[];
  /** İlk liste yükleniyor mu (sadece authenticated iken anlamlı). */
  isLoading: boolean;
  /** Ürünü favorilere ekler. */
  addToWishlist: (productId: number) => Promise<{ ok: boolean; error?: string }>;
  /** Ürünü favorilerden çıkarır. */
  removeFromWishlist: (
    productId: number
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Favoride varsa çıkarır, yoksa ekler. */
  toggleWishlist: (
    productId: number
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Ürün favoride mi? */
  isInWishlist: (productId: number) => boolean;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function useWishlist(): WishlistContextValue {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within FavoritesProvider");
  }
  return ctx;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const [wishlistProductIds, setWishlistProductIds] = React.useState<
    number[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const inFlightIds = React.useRef<Set<number>>(new Set());

  React.useEffect(() => {
    if (status !== "authenticated") {
      setWishlistProductIds([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getWishlistProductIds()
      .then((ids) => {
        if (!cancelled) setWishlistProductIds(ids);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const addToWishlist = React.useCallback(
    async (productId: number): Promise<{ ok: boolean; error?: string }> => {
      if (inFlightIds.current.has(productId)) return { ok: false };
      inFlightIds.current.add(productId);
      try {
        setWishlistProductIds((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
        const result = await addToWishlistAction(productId);
        if (result.success) {
          if (pathname === "/account/wishlist") {
            toast.success("Favorilere eklendi");
          }
          return { ok: true };
        }
        setWishlistProductIds((prev) => prev.filter((id) => id !== productId));
        if (pathname === "/account/wishlist") {
          toast.error("İşlem başarısız");
        }
        return { ok: false, error: result.error };
      } finally {
        inFlightIds.current.delete(productId);
      }
    },
    [pathname]
  );

  const removeFromWishlist = React.useCallback(
    async (productId: number): Promise<{ ok: boolean; error?: string }> => {
      if (inFlightIds.current.has(productId)) return { ok: false };
      inFlightIds.current.add(productId);
      try {
        setWishlistProductIds((prev) => {
          const next = prev.filter((id) => id !== productId);
          return next;
        });
        const result = await removeFromWishlistAction(productId);
        if (result.success) {
          if (pathname === "/account/wishlist") {
            toast.success("Favorilerden kaldırıldı");
          }
          return { ok: true };
        }
        setWishlistProductIds((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
        if (pathname === "/account/wishlist") {
          toast.error("İşlem başarısız");
        }
        return { ok: false, error: result.error };
      } finally {
        inFlightIds.current.delete(productId);
      }
    },
    [pathname]
  );

  const toggleWishlist = React.useCallback(
    async (productId: number): Promise<{ ok: boolean; error?: string }> => {
      const inList = wishlistProductIds.includes(productId);
      return inList
        ? removeFromWishlist(productId)
        : addToWishlist(productId);
    },
    [wishlistProductIds, addToWishlist, removeFromWishlist]
  );

  const isInWishlist = React.useCallback(
    (productId: number) => wishlistProductIds.includes(productId),
    [wishlistProductIds]
  );

  // Post-login: restore scroll, add product from guest intent, toast, clear intent
  React.useEffect(() => {
    if (status !== "authenticated" || typeof sessionStorage === "undefined") return;
    const raw = sessionStorage.getItem(WISHLIST_INTENT_KEY);
    if (!raw) return;
    let intent: WishlistIntent;
    try {
      intent = JSON.parse(raw) as WishlistIntent;
    } catch {
      sessionStorage.removeItem(WISHLIST_INTENT_KEY);
      return;
    }
    const intentPath = intent.returnTo.split("?")[0];
    if (pathname !== intentPath) return;

    const productId = intent.productId;
    const scrollY = Number(intent.scrollY) || 0;
    sessionStorage.removeItem(WISHLIST_INTENT_KEY);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });

    void addToWishlist(productId).then((res) => {
      if (res.ok) {
        toast.success("Favorilere eklendi");
      } else {
        toast.error("Favorilere eklenemedi");
        if (res.error) console.error("[wishlist] add after login:", res.error);
      }
    });
  }, [status, pathname, addToWishlist]);

  const value: WishlistContextValue = React.useMemo(
    () => ({
      wishlistProductIds,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [
      wishlistProductIds,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}
