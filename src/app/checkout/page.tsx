"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 50000 ? 0 : 2000;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const order = {
      id: crypto.randomUUID(),
      items: items.map((item) => ({
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        variant_sku: item.variant_sku,
        image: item.product.image,
      })),
      subtotal, delivery_fee: deliveryFee, total,
      status: "pending",
      payment_method: "paystack",
      ...form,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("last-order", JSON.stringify(order));
    clearCart();
    router.push(`/checkout/success?order=${order.id}`);
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <h1 className="text-2xl font-bold text-slate-800">Loading Checkout...</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Add some products before checking out.</p>
          <Link href="/products">
            <Button className="mt-8">Browse Products</Button>
          </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Delivery Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input placeholder="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone Number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Delivery Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Payment Method</h3>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-100 text-xl">💳</div>
              <div>
                <p className="font-semibold">Paystack</p>
                <p className="text-sm text-muted-foreground">Pay with card, bank transfer, or mobile money</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-emerald-200">⚡</div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatNaira(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : formatNaira(deliveryFee)}</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span className="text-primary">{formatNaira(total)}</span></div>
            </div>
            <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
              {loading ? "Processing..." : `Pay ${formatNaira(total)}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}