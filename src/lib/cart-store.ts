"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variantSku?: string, quantity?: number) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, variantSku: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotal: () => number;
  getCount: () => number;
  syncToServer: (userId: string) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, variantSku, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product_id === product.id && item.variant_sku === variantSku
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.id && item.variant_sku === variantSku
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { id: crypto.randomUUID(), product_id: product.id, variant_sku: variantSku, quantity, product }],
          };
        });
      },
      removeItem: (productId, variantSku) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === productId && item.variant_sku === variantSku)
          ),
        }));
      },
      updateQuantity: (productId, variantSku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantSku);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId && item.variant_sku === variantSku
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      syncToServer: async (userId: string) => {
        const { items } = get();
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              items: items.map((i) => ({ product_id: i.product_id, variant_sku: i.variant_sku, quantity: i.quantity })),
            }),
          });
        } catch (e) {
          console.error("Cart sync failed:", e);
        }
      },
      loadFromServer: async (userId: string) => {
        try {
          const res = await fetch(`/api/cart?user_id=${userId}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const { items: localItems } = get();
            if (localItems.length === 0) {
              const res2 = await fetch("/api/products");
              const allProducts = await res2.json();
              const items = data.map((ci: any) => {
                const product = (Array.isArray(allProducts) ? allProducts : []).find((p: any) => p.id === ci.product_id);
                return product ? { id: ci.id, product_id: ci.product_id, variant_sku: ci.variant_sku, quantity: ci.quantity, product } : null;
              }).filter(Boolean);
              if (items.length > 0) set({ items: items as CartItem[] });
            }
          }
        } catch (e) {
          console.error("Cart load failed:", e);
        }
      },
    }),
    {
      name: "brick-health-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
