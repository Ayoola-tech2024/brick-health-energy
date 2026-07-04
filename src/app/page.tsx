"use client";

import Link from "next/link";
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,65,12,0.15),transparent_45%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-950/20 text-orange-400 text-sm font-semibold animate-pulse">
              🔥 Transforming Clean Cooking in Nigeria
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
              Powering Healthier <br />
              <span className="text-primary">Homes & Communities</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              We manufacture premium smokeless biomass briquettes from recycled agricultural waste and supply advanced, energy-saving cookstoves that turn cooking heat into electricity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                  Shop Clean Fuel
                </Button>
              </Link>
              <Link href="/products?category=stoves">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-full font-bold border-slate-700 text-white hover:bg-slate-800 hover:scale-105 transition-all">
                  Explore Stoves
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center items-center lg:h-[500px]">
            {/* Clean Cooking Graphic / Visualization */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-2xl overflow-hidden flex flex-col justify-center items-center p-8 text-center">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              <span className="text-[120px] filter drop-shadow-xl animate-bounce relative z-10">⚡</span>
              <h3 className="text-2xl font-bold tracking-tight text-white mt-4 relative z-10">TEG Technology</h3>
              <p className="text-slate-100 text-sm mt-2 max-w-xs relative z-10">
                Our smart stoves generate up to 30W of clean electricity directly from waste cooking heat to power phones and lights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section (Content adapted from smokelessbriqs.org) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold">The Challenge</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Clean Cooking Matters
            </p>
            <p className="mt-4 text-lg text-slate-600 font-light">
              Traditional cooking methods like firewood and charcoal contribute to severe health risks, deforestation, and high family expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border hover:shadow-xl transition-all space-y-4">
              <div className="text-4xl">🫁</div>
              <h3 className="text-xl font-bold text-slate-900">Health Vulnerability</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Over 100,500 deaths occur annually in Nigeria due to indoor smoke inhalation from traditional three-stone fires, primarily affecting women and young children.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border hover:shadow-xl transition-all space-y-4">
              <div className="text-4xl">🌳</div>
              <h3 className="text-xl font-bold text-slate-900">Deforestation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Millions of trees are felled daily for firewood and charcoal production, leading to rapid desertification, soil erosion, and severe ecological imbalance.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border hover:shadow-xl transition-all space-y-4">
              <div className="text-4xl">💸</div>
              <h3 className="text-xl font-bold text-slate-900">Financial Burden</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Household income is disproportionately spent on expensive, inefficient fuels. Our systems save families up to 60% on fuel costs starting from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlight Banner / Features */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.1),transparent_35%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-secondary uppercase">Brick Health Ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Double-Impact Solution</h2>
              <p className="text-slate-300 font-light leading-relaxed">
                We close the loop by recycling post-harvest agricultural waste (rice husks, coconut shells) into premium, high-density biomass briquettes, and designing high-thermal efficiency stoves that make combustion completely clean.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="text-2xl font-bold text-white">60%</h4>
                  <p className="text-slate-400 text-xs mt-1">Fuel cost savings</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="text-2xl font-bold text-white">80%</h4>
                  <p className="text-slate-400 text-xs mt-1">Reduction in toxic smoke</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="text-2xl font-bold text-white">30W</h4>
                  <p className="text-slate-400 text-xs mt-1">Stove generated off-grid electricity</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="text-2xl font-bold text-white">100%</h4>
                  <p className="text-slate-400 text-xs mt-1">Recycled agricultural waste</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">Clean Cooking Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <strong className="text-white">Eco-friendly Biomass:</strong> No forest timber is cut. We burn crop waste that would otherwise be discarded or openly burned.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <strong className="text-white">Smokeless Combustion:</strong> Advanced airflow engineering ensures perfect mixing of fuel gases, leaving pots clean and soot-free.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <strong className="text-white">Integrated USB Charging:</strong> The stove generates electricity to charge phones and power the built-in fan and lighting accessories.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Featured Products</h2>
              <p className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">Our Premium Clean Cook Catalog</p>
            </div>
            <Link href="/products" className="mt-4 md:mt-0 text-sm font-semibold text-primary hover:underline flex items-center gap-1 group">
              View All Products <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((p) => {
              const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
              return (
                <div key={p.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <Link href={`/products/${p.id}`} className="relative aspect-square bg-slate-100 block overflow-hidden">
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                      <span className="text-[100px] select-none group-hover:scale-110 transition-transform duration-300">
                        {p.category === "fuel" ? "🪵" : "🔥"}
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                        {discount}% OFF
                      </span>
                    )}
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold tracking-wider text-primary uppercase">{p.category}</span>
                      <Link href={`/products/${p.id}`}>
                        <h3 className="mt-1 font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                      </Link>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed font-light">{p.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xl text-primary">{formatNaira(p.price)}</span>
                        {p.original_price && (
                          <span className="text-sm text-slate-400 line-through">{formatNaira(p.original_price)}</span>
                        )}
                      </div>
                      <Link href={`/products/${p.id}`}>
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Delivery CTA Banner */}
      <section className="bg-gradient-to-r from-orange-700 to-orange-600 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Transition to Clean Cooking?</h2>
          <p className="text-orange-100 max-w-2xl mx-auto font-light leading-relaxed">
            Order your Biomass Briquettes or Smokeless Stoves today. Enjoy nationwide delivery across Nigeria with **FREE shipping** on all orders above {formatNaira(50000)}!
          </p>
          <div className="pt-2">
            <Link href="/products">
              <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-900 border-none font-bold text-base px-10 py-6 rounded-full shadow-xl hover:scale-105 transition-all">
                Shop Our Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}