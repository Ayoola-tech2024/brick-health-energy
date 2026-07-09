"use client";

import { use, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira, cn } from "@/lib/utils";
import { products } from "@/lib/seed-data";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const displayProducts = dbProducts.length > 0 ? dbProducts : products;
  const product = displayProducts.find((p) => p.id === resolvedParams.id);
  const addItem = useCartStore((s) => s.addItem);

  const related = useMemo(() => {
    if (!product) return [];
    return displayProducts
      .filter((p) => p.category === product.category && p.id !== resolvedParams.id)
      .slice(0, 4);
  }, [product, displayProducts, resolvedParams.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Link href="/products" className="mt-4 text-primary underline">Back to Products</Link>
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