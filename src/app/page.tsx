"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { products } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden">
        <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0 z-0"
        >
           <Image src="/images/stove.jpg" alt="Luxury Clean Energy Stove" fill className="object-cover opacity-20 object-center" priority />
           <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,166,103,0.05),transparent_70%)] z-0" />
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-8"
        >
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-secondary leading-tight">
            Crafted for Impact.<br />
            <span className="text-primary italic">Designed for Life.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Premium clean energy solutions for the modern individual who values sustainability, quality, and performance.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
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
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Collections */}
      <section className="py-32 bg-background relative z-10">
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
            {featuredProducts.map((p, i) => {
              const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
              const imgUrl = p.category === "fuel" ? "/images/briquettes.jpg" : "/images/stove.jpg";
              return (
                <motion.div 
                  variants={fadeInUp}
                  key={p.id} 
                  className="group flex flex-col bg-white rounded-sm overflow-hidden border border-border/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <Link href={`/products/${p.id}`} className="relative aspect-[4/5] bg-slate-50 overflow-hidden block">
                    <Image src={imgUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
                  At Brick Health Energy, we believe that every step towards sustainability should be a statement of confidence. Our engineers combine traditional principles with contemporary clean technology to create solutions that don't just perform exceptionally—they feel extraordinary.
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
               <Image src="/images/stove.jpg" alt="Brand Story" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}