"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export default function CheckoutSuccess() {
  useEffect(() => {
    document.title = "Order Placed | Brick Health Energy";
  }, []);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("last-order");
    if (saved) setOrder(JSON.parse(saved));
  }, []);

  const method = order?.payment_method;

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="mb-6 text-6xl">
        {method === "bank_deposit" ? "🏦" : method === "whatsapp" ? "💬" : method === "cod" ? "🚚" : "✅"}
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Order Placed Successfully!</h1>

      {method === "bank_deposit" && (
        <div className="mt-4 space-y-2">
          <p className="text-lg text-muted-foreground">
            Please transfer the total amount to the bank account provided and send your payment receipt to our WhatsApp for confirmation.
          </p>
          <a
            href={`https://wa.me/2347035689394?text=${encodeURIComponent(
              `Hello, I have placed an order (${order?.id}) and made a transfer. Please find the receipt attached.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="mt-2">Send Receipt via WhatsApp</Button>
          </a>
        </div>
      )}

      {method === "whatsapp" && (
        <div className="mt-4">
          <p className="text-lg text-muted-foreground">
            Check your WhatsApp for payment instructions from our team. We will reach out to you shortly to confirm your order and discuss payment options.
          </p>
        </div>
      )}

      {method === "cod" && (
        <div className="mt-4">
          <p className="text-lg text-muted-foreground">
            Your order will be delivered within <strong>3–5 business days</strong>. Payment is due upon delivery to the courier.
          </p>
        </div>
      )}

      {!method && (
        <p className="mt-4 text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      )}

      {order && (
        <div className="mt-8 rounded-lg border bg-white p-6 text-left shadow-sm">
          <h3 className="mb-4 font-semibold">Order Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{order.id}</span></p>
            <p><span className="text-muted-foreground">Total:</span> <span className="font-semibold text-primary">{formatNaira(order.total)}</span></p>
            <p><span className="text-muted-foreground">Status:</span> <span className="capitalize">{order.status}</span></p>
            {order.payment_method && (
              <p><span className="text-muted-foreground">Payment:</span> <span className="capitalize">{order.payment_method.replace("_", " ")}</span></p>
            )}
            <div className="mt-4 border-t pt-4">
              <p className="font-semibold">Items:</p>
              <ul className="mt-2 space-y-1">
                {order.items?.map((item: any, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    {item.image && (
                      <div className="relative h-8 w-8 overflow-hidden rounded bg-gray-100">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <span>{item.name} x{item.quantity}</span>
                    <span className="ml-auto text-muted-foreground">{formatNaira(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
