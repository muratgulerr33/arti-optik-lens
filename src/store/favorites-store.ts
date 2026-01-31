"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type FavoritesState = {
  wishlistProductIds: number[]
  addToWishlist: (productId: number) => void
  removeFromWishlist: (productId: number) => void
  toggleWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
}

export const useWishlist = create<FavoritesState>()(
  persist(
    (set, get) => ({
      wishlistProductIds: [],

      addToWishlist: (productId) => {
        set((state) => ({
          wishlistProductIds: state.wishlistProductIds.includes(productId)
            ? state.wishlistProductIds
            : [...state.wishlistProductIds, productId],
        }))
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlistProductIds: state.wishlistProductIds.filter((id) => id !== productId),
        }))
      },

      toggleWishlist: (productId) => {
        const ids = get().wishlistProductIds
        if (ids.includes(productId)) {
          get().removeFromWishlist(productId)
        } else {
          get().addToWishlist(productId)
        }
      },

      isInWishlist: (productId) => get().wishlistProductIds.includes(productId),
    }),
    { name: "favorites-storage" }
  )
)
