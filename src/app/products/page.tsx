"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { products } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const categories = ["all", "stoves", "fuel"];

const categoryLabels: Record<string, string> = {
  all: "All Products",
  stoves: "Smokeless Stoves",
  fuel: "Eco Biomass Fuel",
};

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("q") || "";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("featured");
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Products | Brick Health Energy";
  }, []);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
          if (data.length === 0 && process.env.NODE_ENV === "development") {
            console.warn(
              "[products] InsForge returned 0 products. Falling back to local seed data (development only)."
            );
          }
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  // In production we trust the database. Seed data is only a development
  // fallback so the UI isn't empty before products are seeded.
  const displayProducts =
    dbProducts.length > 0 ? dbProducts : process.env.NODE_ENV === "development" ? products : [];

  const filtered = useMemo(() => {
    let result = [...displayProducts];
    
    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    
    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [displayProducts, activeCategory, sortBy, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Products</h1>
        <p className="mt-2 text-muted-foreground">Browse our clean cooking stove tech and eco-friendly biomass fuels</p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) {
              params.set("q", e.target.value);
            } else {
              params.delete("q");
            }
            router.replace(`/products?${params.toString()}`, { scroll: false });
          }}
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              const params = new URLSearchParams(searchParams.toString());
              params.delete("q");
              router.replace(`/products?${params.toString()}`, { scroll: false });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat]}
            </Button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="featured">Sort by: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
      <div className="mt-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            {searchQuery && (
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
              </p>
            )}
            <ProductGrid products={filtered} />
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}