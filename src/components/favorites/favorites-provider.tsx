"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  getWishlistProductIds,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
} from "@/app/actions/wishlist";

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
  const [wishlistProductIds, setWishlistProductIds] = React.useState<
    number[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
      const result = await addToWishlistAction(productId);
      if (result.success) {
        setWishlistProductIds((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
        return { ok: true };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const removeFromWishlist = React.useCallback(
    async (productId: number): Promise<{ ok: boolean; error?: string }> => {
      const result = await removeFromWishlistAction(productId);
      if (result.success) {
        setWishlistProductIds((prev) => prev.filter((id) => id !== productId));
        return { ok: true };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const isInWishlist = React.useCallback(
    (productId: number) => wishlistProductIds.includes(productId),
    [wishlistProductIds]
  );

  const value: WishlistContextValue = React.useMemo(
    () => ({
      wishlistProductIds,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }),
    [
      wishlistProductIds,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}
