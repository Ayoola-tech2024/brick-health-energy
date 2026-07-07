"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { products } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,166,103,0.05),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-secondary leading-tight">
            Crafted for Impact.<br />
            <span className="text-primary italic">Designed for Life.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Premium clean energy solutions for the modern individual who values sustainability, quality, and performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto text-base px-10 py-7 rounded-none font-medium hover:scale-[1.02] transition-transform">
                Shop Collection
              </Button>
            </Link>
            <Link href="/products?category=stoves">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-10 py-7 rounded-none font-medium border-secondary text-secondary hover:bg-secondary hover:text-white hover:scale-[1.02] transition-all">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-semibold text-secondary">Featured Collections</h2>
            <p className="text-muted-foreground font-light text-lg">Discover our most loved sustainable solutions, crafted with precision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((p) => {
              const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
              return (
                <div key={p.id} className="group flex flex-col bg-white rounded-sm overflow-hidden border border-border/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <Link href={`/products/${p.id}`} className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-[120px] select-none group-hover:scale-110 transition-transform duration-700">
                        {p.category === "fuel" ? "🪵" : "⚡"}
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="absolute left-4 top-4 bg-secondary text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        Sale {discount}%
                      </span>
                    )}
                    <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-medium uppercase tracking-widest border border-white px-6 py-3">Quick View</span>
                    </div>
                  </Link>
                  <div className="p-8 flex flex-col items-center text-center">
                    <span className="text-xs font-medium tracking-widest text-primary uppercase mb-3">{p.category}</span>
                    <Link href={`/products/${p.id}`}>
                      <h3 className="font-semibold text-xl text-secondary hover:text-primary transition-colors">{p.name}</h3>
                    </Link>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="font-semibold text-lg text-secondary">{formatNaira(p.price)}</span>
                      {p.original_price && (
                        <span className="text-sm text-muted-foreground line-through">{formatNaira(p.original_price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-white rounded-none px-12 py-6 uppercase tracking-widest text-sm font-semibold">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 bg-slate-50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-semibold text-secondary leading-tight">Engineering Meets Sustainable Design</h2>
              <div className="space-y-6 text-muted-foreground font-light text-lg leading-relaxed">
                <p>
                  At Brick Health Energy, we believe that every step towards sustainability should be a statement of confidence. Our engineers combine traditional principles with contemporary clean technology to create solutions that don't just perform exceptionally—they feel extraordinary.
                </p>
                <p>
                  From the careful selection of premium recycled materials to the meticulous attention to detail in every component, we ensure that each product represents the pinnacle of quality and environmental stewardship.
                </p>
              </div>
              <Link href="/about">
                <Button className="rounded-none px-8 py-6 font-medium mt-4">Discover Our Process</Button>
              </Link>
            </div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-slate-200 rounded-sm overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <span className="text-[150px]">🏭</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}