"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { products } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Star, Flame, Zap, Leaf } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
          if (data.length === 0 && process.env.NODE_ENV === "development") {
            console.warn(
              "[home] InsForge returned 0 products. Falling back to local seed data (development only)."
            );
          }
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const displayProducts =
    dbProducts.length > 0 ? dbProducts : process.env.NODE_ENV === "development" ? products : [];
  const featuredProducts = displayProducts.filter((p) => p.featured).slice(0, 3);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center bg-secondary text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/products/brick-health-2.jpeg"
            alt="TEG Smart Cookstove"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/50 to-transparent" />
        </div>

        <div className="mr-auto ml-0 max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold leading-tight mb-6">
                Clean Energy for{" "}
                <span className="text-primary">the Modern Life</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
                A cleantech company transforming agricultural waste into sustainable green briquettes, 
                pellets, and smart cookstoves. Our innovative stoves generate electricity while cooking, 
                with IoT-enabled monitoring for impact tracking and carbon credits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-base px-10 py-7 rounded-none font-medium hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                  Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-10 py-7 rounded-none font-medium border-white/30 text-white hover:bg-white hover:text-secondary transition-all bg-white/10 backdrop-blur-sm">
                  Our Story
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center gap-6 text-sm font-medium text-gray-300"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>5-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>100% Smokeless</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Free Delivery over ₦50k</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Nationwide Shipping</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 bg-secondary border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5+", label: "Years Warranty" },
              { number: "10K+", label: "Happy Customers" },
              { number: "98%", label: "Smoke Reduction" },
              { number: "60%", label: "Fuel Savings" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="space-y-1"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-secondary">Featured Collections</h2>
            <p className="text-muted-foreground font-light text-lg">Discover our most loved sustainable solutions, crafted with precision</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {featuredProducts.map((p) => {
              const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
              return (
                <motion.div
                  variants={fadeInUp}
                  key={p.id}
                  className="group flex flex-col bg-white rounded-sm overflow-hidden border border-border/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <Link href={`/products/${p.id}`} className="relative aspect-[4/5] bg-slate-50 overflow-hidden block">
                    <Image src={p.image || "/images/products/brick-health-1.jpeg"} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    {discount > 0 && (
                      <span className="absolute left-4 top-4 bg-secondary text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        Sale {discount}%
                      </span>
                    )}
                    <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-medium uppercase tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-secondary transition-colors">Quick View</span>
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
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-20 text-center"
          >
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-white rounded-none px-12 py-7 uppercase tracking-widest text-sm font-semibold transition-all hover:tracking-[0.2em]">
                View All Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us — Lightsup-inspired dark section with floating card */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-12 transform origin-top-right" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                  Why <span className="text-primary uppercase">BRICK HEALTH</span>?
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Millions of households across Africa still rely on firewood and charcoal. 
                  We&apos;re here to change that — by converting agricultural waste into clean energy, 
                  reducing indoor air pollution, cutting carbon emissions, and expanding energy access 
                  through our TEG-powered smart cookstoves.
                </p>
              </motion.div>

              <div className="space-y-6">
                {[
                  { icon: Flame, title: "Premium Smokeless Technology", desc: "Advanced forced-draft combustion for 98% smoke reduction. Better health, cleaner kitchens." },
                  { icon: Zap, title: "TEG Power Generation", desc: "Convert heat into electricity while cooking. Charge phones, run lights, power off-grid homes." },
                  { icon: Leaf, title: "Eco-Friendly Biomass Fuel", desc: "Made from 100% recycled agricultural waste. Burns hotter, lasts longer, prevents deforestation." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                    className="flex gap-4"
                  >
                    <div className="mt-1 bg-primary/20 p-2 rounded-lg h-fit">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-10"
              >
                <Link href="/products?category=stoves">
                  <Button className="rounded-none px-8 py-6 text-base hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                    Explore Our Stoves <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary rounded-2xl opacity-20 blur-2xl" />
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[600px] bg-slate-800 rounded-sm overflow-hidden shadow-2xl border border-white/10">
                <Image src="/images/products/brick-health-1.jpeg" alt="Premium Smokeless Rocket Cookstove" fill className="object-cover" />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white text-secondary p-6 rounded-sm shadow-xl max-w-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-current" />)}
                  </div>
                  <span className="font-bold">4.9/5</span>
                </div>
                <p className="text-sm font-medium text-slate-700">&ldquo;Best investment I&apos;ve made for my kitchen. No smoke, no stress.&rdquo;</p>
                <p className="text-xs text-gray-500 mt-2">— Emmanuel O., Lagos</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-32 bg-slate-50 border-y border-border overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-semibold text-secondary leading-tight">Engineering Meets Sustainable Design</h2>
              <div className="space-y-6 text-muted-foreground font-light text-lg leading-relaxed">
                <p>
                  At Brick Health Energy, we believe that every step towards sustainability should be a statement of confidence. Our engineers combine traditional principles with contemporary clean technology to create solutions that don&apos;t just perform exceptionally — they feel extraordinary.
                </p>
                <p>
                  From the careful selection of premium recycled materials to the meticulous attention to detail in every component, we ensure that each product represents the pinnacle of quality and environmental stewardship.
                </p>
              </div>
              <Link href="/about" className="inline-block">
                <Button className="rounded-none px-10 py-7 font-medium mt-6 text-base hover:scale-[1.02] transition-transform">Discover Our Process</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative aspect-[4/5] lg:aspect-auto lg:h-[700px] bg-slate-200 rounded-sm overflow-hidden shadow-2xl"
            >
              <Image src="/images/products/brick-health-3.jpeg" alt="Sustainable Energy" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold mb-6">
              Ready to Make the Switch?
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of households and businesses enjoying clean, smoke-free cooking with Brick Health Energy.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/products">
              <Button size="lg" className="bg-secondary text-white hover:bg-slate-800 border-none rounded-none px-10 py-7 text-base hover:scale-[1.02] transition-transform shadow-lg">
                Shop Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary rounded-none px-10 py-7 text-base">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
