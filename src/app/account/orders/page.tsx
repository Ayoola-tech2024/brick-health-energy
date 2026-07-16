"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { OrderSkeleton } from "@/components/ui/skeleton";
import { Package, History, ChevronRight } from "lucide-react";

interface OrderItem {
  product_id: string; name: string; price: number; quantity: number; image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  delivery_name: string;
  created_at: string;
}

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Order History | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) { router.push("/login?callbackUrl=/account/orders"); return; }

    fetch(`/api/orders?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, user, authLoading]);

  if (!mounted || authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <OrderSkeleton />
      </div>
    );
  }

  if (!user) return null;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          Order History
        </h1>
        <p className="mt-1 text-muted-foreground font-light">View and track all your orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border bg-white py-20 text-center">
          <Package className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-secondary">No Orders Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground font-light">You haven&apos;t placed any orders yet.</p>
          <Link href="/products"><Button className="mt-6">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${STATUS_BADGES[order.status] || "bg-slate-100"} border-none capitalize`}>
                    {order.status}
                  </Badge>
                  <span className="text-lg font-bold text-primary">{formatNaira(order.total)}</span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="px-6 py-4 space-y-2">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatNaira(item.price * item.quantity)}</span>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
