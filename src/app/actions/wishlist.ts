"use server";

import { auth } from "@/auth";
import { db } from "@/db/connection";
import { wishlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type WishlistResult =
  | { success: true; productIds?: number[] }
  | { success: false; error: string };

/** Kullanıcının favori ürün id listesini döner. Oturum yoksa boş dizi. */
export async function getWishlistProductIds(): Promise<number[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, session.user.id));
  return rows.map((r) => r.productId);
}

/** Ürünü wishlist'e ekler. Auth gerekir. */
export async function addToWishlist(productId: number): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Oturum açmanız gerekiyor." };
  }
  try {
    await db
      .insert(wishlistItems)
      .values({
        userId: session.user.id,
        productId,
      })
      .onConflictDoNothing({
        target: [wishlistItems.userId, wishlistItems.productId],
      });
    return { success: true };
  } catch (err) {
    console.error("addToWishlist error:", err);
    return { success: false, error: "Favorilere eklenirken bir hata oluştu." };
  }
}

/** Ürünü wishlist'ten çıkarır. Auth gerekir. */
export async function removeFromWishlist(
  productId: number
): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Oturum açmanız gerekiyor." };
  }
  try {
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, session.user.id),
          eq(wishlistItems.productId, productId)
        )
      );
    return { success: true };
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return { success: false, error: "Favorilerden çıkarılırken bir hata oluştu." };
  }
}
