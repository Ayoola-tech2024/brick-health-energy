"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Search,

} from "lucide-react";

interface Order {
  id: string;
  user_id?: string;
  items: { product_id: string; name: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  payment_reference?: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const isAdmin = user ? isAdminEmail(user.email) : false;

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [user, authLoading]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdatingOrder(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id?.toLowerCase().includes(q) ||
      order.delivery_name?.toLowerCase().includes(q) ||
      order.delivery_email?.toLowerCase().includes(q) ||
      order.delivery_phone?.includes(q);
    return matchesStatus && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <LayoutDashboard className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-6 text-3xl font-semibold font-serif text-secondary">Access Denied</h1>
        <p className="mt-3 text-muted-foreground font-light">
          You need admin privileges to access this page.
        </p>
        <Button onClick={() => router.push("/")} className="mt-8">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground font-light">
          Manage orders, update statuses, and track performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-bold text-secondary">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Shipped</p>
            <Truck className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">{formatNaira(stats.revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by ID, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border bg-white py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-secondary">No Orders Found</h3>
          <p className="mt-2 text-sm text-muted-foreground font-light">
            {searchQuery ? "No orders match your search." : "No orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 px-6 py-4 border-b">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={updatingOrder === order.id}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[order.status] || "bg-slate-100"
                    }`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="text-lg font-bold text-primary">
                    {formatNaira(order.total)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="px-6 py-4 bg-white space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Customer Details
                      </h4>
                      <p className="text-sm">{order.delivery_name}</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_email}</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_phone}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Shipping Address
                      </h4>
                      <p className="text-sm">{order.delivery_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_city}, {order.delivery_state}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Items
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatNaira(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatNaira(order.total)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
