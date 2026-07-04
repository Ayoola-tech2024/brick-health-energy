"use client";

import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setCartOpen(false)} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button onClick={() => setCartOpen(false)} className="text-2xl leading-none text-muted-foreground hover:text-foreground">
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="mb-4 text-muted-foreground">Your cart is empty</p>
                <button onClick={() => setCartOpen(false)} className="text-primary underline">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.product.image ? (
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-emerald-200">⚡</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      {item.variant_sku && (
                        <p className="text-xs text-muted-foreground">Variant: {item.variant_sku}</p>
                      )}
                      <p className="text-sm font-semibold text-primary">{formatNaira(item.product.price)}</p>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id, item.variant_sku)}
                          className="ml-auto text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t px-6 py-4">
              <div className="mb-4 flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formatNaira(getTotal())}</span>
              </div>
              <Link href="/cart" onClick={() => setCartOpen(false)}>
                <button className="mb-2 w-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  View Cart
                </button>
              </Link>
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                <button className="w-full bg-secondary py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90">
                  Checkout
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
