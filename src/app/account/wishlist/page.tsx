"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { products } from "@/lib/seed-data";
import { Heart, Trash2 } from "lucide-react";

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Wishlist | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) { router.push("/login?callbackUrl=/account/wishlist"); return; }

    fetch("/api/wishlist")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setWishlist(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, user, authLoading]);

  async function handleRemove(productId: string) {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    if (res.ok) {
      setWishlist((prev) => prev.filter((w) => w.product_id !== productId));
    }
  }

  if (!mounted || authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse" /></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const wishlistedProducts = wishlist
    .map((w) => products.find((p) => p.id === w.product_id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          My Wishlist
        </h1>
        <p className="mt-1 text-muted-foreground font-light">Products you&apos;ve saved for later.</p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="rounded-lg border bg-white py-20 text-center">
          <Heart className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-secondary">Your Wishlist is Empty</h3>
          <p className="mt-2 text-sm text-muted-foreground font-light">Save products you love by tapping the heart icon.</p>
          <Link href="/products"><Button className="mt-6">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistedProducts.map((product: any) => (
            <div key={product.id} className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
              <Link href={`/products/${product.id}`} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    {product.category === "fuel" ? "🪵" : "🔥"}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="font-semibold text-secondary hover:text-primary truncate block">
                  {product.name}
                </Link>
                <p className="text-lg font-bold text-primary mt-1">{formatNaira(product.price)}</p>
              </div>
              <button
                onClick={() => handleRemove(product.id)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
