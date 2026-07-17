"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { unwrapItemsField, type TrackingInfo } from "@/lib/order-tracking";
import { Package, Truck, Clock, MapPin, ChevronLeft } from "lucide-react";

interface OrderDetail {
  id: string;
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
}

const STATUS_ICONS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Order Tracking | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) { router.push(`/login?callbackUrl=/account/orders/${resolvedParams.id}/tracking`); return; }

    fetch(`/api/orders?user_id=${user.id}&id=${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        const orderData = Array.isArray(data) ? data[0] : data;
        if (orderData) {
          setOrder(orderData);
          const { tracking: trackInfo } = unwrapItemsField(orderData.items);
          setTracking(trackInfo);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, user, authLoading, resolvedParams.id]);

  if (!mounted || authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-slate-100 rounded" />
          <div className="h-48 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-4 text-2xl font-semibold text-secondary">Order Not Found</h1>
        <Link href="/account/orders"><Button className="mt-6">Back to Orders</Button></Link>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const timeline = tracking?.timeline || [];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          Order Tracking
        </h1>
        <p className="mt-1 text-muted-foreground font-mono text-sm">#{order.id.slice(0, 8)}</p>
      </div>

      <div className="rounded-lg border bg-white p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${STATUS_ICONS[order.status] || "bg-slate-100"} border-none capitalize px-3 py-1`}>
            {order.status}
          </Badge>
          <span className="text-lg font-bold text-primary">{formatNaira(order.total)}</span>
        </div>

        {tracking?.number && (
          <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t">
            <div>
              <span className="text-muted-foreground">Tracking Number</span>
              <p className="font-medium">{tracking.number}</p>
            </div>
            {tracking.carrier && (
              <div>
                <span className="text-muted-foreground">Carrier</span>
                <p className="font-medium">{tracking.carrier}</p>
              </div>
            )}
          </div>
        )}

        {tracking?.estimated_delivery && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Estimated delivery by</span>
              <span className="font-medium">{formatDate(tracking.estimated_delivery)}</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{order.delivery_name}</p>
              <p className="text-muted-foreground">{order.delivery_address}, {order.delivery_city}, {order.delivery_state}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold font-serif text-secondary mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Tracking Timeline
        </h2>

        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tracking updates yet.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-0.5 bg-slate-200" />
            <div className="space-y-8">
              {[...timeline].reverse().map((entry, i) => (
                <div key={i} className="relative flex gap-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 bg-white ${
                    i === 0 ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      i === 0 ? "bg-primary" : "bg-slate-300"
                    }`} />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="font-medium text-slate-900 capitalize">{entry.note || entry.status}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 mt-6 shadow-sm">
        <h2 className="text-lg font-semibold font-serif text-secondary mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Order Items
        </h2>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
              <span className="font-medium">{formatNaira(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery</span><span>{order.delivery_fee === 0 ? "FREE" : formatNaira(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-secondary pt-2 border-t">
            <span>Total</span><span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
