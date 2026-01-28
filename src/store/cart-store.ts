"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: number;
  variantId: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  slug: string;
  brand: string;
};

type CartState = {
  items: CartItem[];
  cartOpen: boolean;
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

function cartItemId(productId: number, variantId: number): string {
  return `${productId}-${variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,

      addItem: (item) => {
        const id = cartItemId(item.productId, item.variantId);
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          const qty = item.quantity ?? 1;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                id,
                quantity: qty,
                image: item.image ?? null,
              } as CartItem,
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
    }),
    { name: "cart-storage" }
  )
);
