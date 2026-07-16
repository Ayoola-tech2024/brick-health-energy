"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Shopping Cart | Brick Health Energy";
  }, []);

  const subtotal = getTotal();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 50000 ? 0 : 2000);
  const total = subtotal + deliveryFee;

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <h1 className="text-2xl font-bold text-slate-800">Loading Cart...</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/products">
          <Button className="mt-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {item.product.image ? (
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-emerald-200">⚡</div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-semibold hover:text-primary">{item.product.name}</h3>
                    </Link>
                    {item.variant_sku && <p className="text-sm text-muted-foreground">Variant: {item.variant_sku}</p>}
                  </div>
                  <button onClick={() => removeItem(item.product_id, item.variant_sku)} className="text-sm text-red-500 hover:text-red-700">
                    Remove
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded border">-</button>
                    <span className="font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded border">+</button>
                  </div>
                  <span className="text-lg font-bold text-primary">{formatNaira(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatNaira(deliveryFee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatNaira(total)}</span>
              </div>
            </div>
              <Link href="/checkout">
                <Button className="mt-6 w-full" size="lg">Proceed to Checkout</Button>
              </Link>
              <Button variant="ghost" onClick={clearCart} className="mt-2 w-full text-sm text-muted-foreground">
                Clear Cart
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}