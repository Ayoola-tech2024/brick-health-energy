"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { User, Package, Heart, ChevronRight, ShoppingBag } from "lucide-react";

export default function AccountDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    document.title = "My Account | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) { router.push("/login?callbackUrl=/account"); return; }

    fetch(`/api/orders?user_id=${user.id}&limit=3`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setRecentOrders(data); })
      .catch(() => {});
  }, [mounted, user, authLoading]);

  if (!mounted || authLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center animate-pulse"><h1 className="text-2xl font-bold font-serif text-secondary">Loading...</h1></div>;
  }

  if (!user) return null;

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          My Account
        </h1>
        <p className="mt-1 text-muted-foreground font-light">Welcome back, {user.name || user.email?.split("@")[0] || "User"}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
        <Link href="/account/profile" className="group rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <User className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-secondary group-hover:text-primary">Profile</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal details</p>
        </Link>
        <Link href="/account/orders" className="group rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <Package className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-secondary group-hover:text-primary">Order History</h3>
          <p className="text-sm text-muted-foreground mt-1">View and track your orders</p>
        </Link>
        <Link href="/account/wishlist" className="group rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <Heart className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-secondary group-hover:text-primary">Wishlist</h3>
          <p className="text-sm text-muted-foreground mt-1">Products you&apos;ve saved</p>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold font-serif text-secondary flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Recent Orders
        </h2>
        <Link href="/account/orders" className="text-sm text-primary hover:underline">View all</Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-lg font-semibold text-secondary">No Orders Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground font-light">Start shopping to see your orders here.</p>
          <Link href="/products"><Button className="mt-4">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                <p className="text-sm font-medium text-secondary">{formatNaira(order.total)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${statusBadge[order.status] || "bg-slate-100"} border-none capitalize`}>
                  {order.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
