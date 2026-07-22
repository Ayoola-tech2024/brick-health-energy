"use client";

import { use, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira, cn } from "@/lib/utils";
import { products } from "@/lib/seed-data";
import { Star, MessageSquare, Heart } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Product | Brick Health Energy";
    fetch("/api/wishlist")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setWishlistIds(data.map((w: any) => w.product_id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
          if (data.length === 0 && process.env.NODE_ENV === "development") {
            console.warn(
              "[product] InsForge returned 0 products. Falling back to local seed data (development only)."
            );
          }
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setProductsLoading(false));
  }, []);

  const displayProducts =
    dbProducts.length > 0 ? dbProducts : process.env.NODE_ENV === "development" ? products : [];
  const product = displayProducts.find((p) => p.id === resolvedParams.id);
  const productNotFound = !productsLoading && !product;
  const addItem = useCartStore((s) => s.addItem);

  async function handleToggleWishlist() {
    if (!product) return;
    const isWished = wishlistIds.includes(product.id);
    try {
      if (isWished) {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (res.ok) setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (res.ok) setWishlistIds((prev) => [...prev, product.id]);
      }
    } catch {}
  }

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Brick Health Energy`;
    }
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return displayProducts
      .filter((p) => p.category === product.category && p.id !== resolvedParams.id)
      .slice(0, 4);
  }, [product, displayProducts, resolvedParams.id]);

  if (productNotFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Link href="/products" className="mt-4 text-primary underline">Back to Products</Link>
      </div>
    );
  }

  if (productsLoading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-slate-200" />
            <div className="space-y-6">
              <div className="h-6 w-24 bg-slate-200 rounded" />
              <div className="h-10 w-3/4 bg-slate-200 rounded" />
              <div className="h-8 w-1/3 bg-slate-200 rounded" />
              <div className="h-20 w-full bg-slate-200 rounded" />
              <div className="h-12 w-full bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
              <span className="text-8xl select-none">
                {product.category === "fuel" ? "🪵" : "🔥"}
              </span>
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute left-4 top-4 bg-red-500 text-white">
              -{discount}% OFF
            </Badge>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.brand && <span className="text-sm text-muted-foreground">{product.brand}</span>}
            {product.featured && <Badge>Featured</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatNaira(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xl text-muted-foreground line-through">{formatNaira(product.original_price)}</span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
          {Object.keys(product.specifications).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Specifications</h3>
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-slate-50 p-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{key}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex items-center gap-4">
            <Button size="lg" onClick={() => addItem(product)} disabled={!product.in_stock} className="flex-1">
              {product.in_stock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <button
              onClick={handleToggleWishlist}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 hover:bg-red-50 transition-colors"
              title={wishlistIds.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-5 w-5 ${
                  wishlistIds.includes(product.id)
                    ? "fill-red-500 text-red-500"
                    : "text-slate-400"
                }`}
              />
            </button>
            <span className={cn("text-sm font-medium", product.in_stock ? "text-green-600" : "text-red-600")}>
              {product.in_stock ? `In Stock (${product.stock_count})` : "Currently Unavailable"}
            </span>
          </div>
          {product.variants && (product.variants as any[]).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {(product.variants as any[]).map((v: any) => (
                  <Badge key={v.sku} variant="outline" className="px-3 py-1">
                    {v.label} — {formatNaira(v.price)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Reviews Section */}
      <section className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {product.review_count || 0} review{(product.review_count || 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(product.rating || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
            <span className="ml-1 text-lg font-semibold">{(product.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <ProductReviews productId={product.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-square bg-slate-100">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl bg-gradient-to-br from-orange-50 to-amber-50 select-none">
                        {p.category === "fuel" ? "🪵" : "🔥"}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary">{p.name}</h3>
                    <p className="mt-1 font-bold text-primary">{formatNaira(p.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_name: "", rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.user_name.trim() || !form.rating) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_name: form.user_name,
          rating: form.rating,
          title: form.title || undefined,
          comment: form.comment || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitSuccess(true);
      setForm({ user_name: "", rating: 5, title: "", comment: "" });
      setShowForm(false);

      // Refresh reviews
      const refresh = await fetch(`/api/reviews?product_id=${productId}`);
      const refreshed = await refresh.json();
      if (Array.isArray(refreshed)) setReviews(refreshed);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-white p-6 space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {reviews.length === 0 && !showForm ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-secondary">No Reviews Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground font-light">
            Be the first to review this product!
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-6">
            Write a Review
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
            {!showForm && !submitSuccess && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                Write a Review
              </Button>
            )}
          </div>
          
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{review.user_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && (
                <h4 className="mt-3 font-semibold text-slate-800">{review.title}</h4>
              )}
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mt-8 rounded-lg border bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Write Your Review</h3>
          
          {submitSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-4 text-sm rounded-sm">
              Review submitted successfully! It may take a moment to appear.
            </div>
          )}
          
          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-4 text-sm rounded-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1 h-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, rating: s })}
                      disabled={submitting}
                    >
                      <Star
                        className={`h-7 w-7 cursor-pointer transition-colors ${
                          s <= form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Review Title</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Review</label>
              <textarea
                rows={4}
                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSubmitError(null);
                  setSubmitSuccess(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}