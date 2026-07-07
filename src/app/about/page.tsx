"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Leaf, Target, Users } from "lucide-react";

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-white overflow-hidden border-b">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1748615734058-1831b2af4a44?w=1920&q=80&auto=format&fit=crop"
            alt="About Brick Health Energy"
            fill
            className="object-cover opacity-10 object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-6">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-xs font-semibold tracking-widest text-primary uppercase"
          >
            Our Mission & Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-secondary leading-tight"
          >
            Innovating Clean Energy for <span className="text-primary italic">Every Home</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
          >
            Brick Health Energy is dedicated to engineering clean cooking and sustainable energy solutions that elevate quality of life and preserve our environment.
          </motion.p>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-semibold text-secondary">
                The Journey of Cleantech Excellence
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground font-light text-lg leading-relaxed">
                Founded with a vision to replace harmful, inefficient cooking methods with sophisticated, clean technologies, Brick Health Energy designs state-of-the-art biomass stoves and highly efficient eco-fuels.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground font-light text-lg leading-relaxed">
                By focusing on thermodynamic efficiency, user-friendly designs, and clean emissions, our products enable families and enterprises to transition to sustainable energy effortlessly and affordably.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative aspect-video lg:aspect-auto lg:h-[450px] bg-slate-100 rounded-sm overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format&fit=crop"
                alt="Eco-friendly briquette production"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold text-secondary">What Guides Us</h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto">
              Our principles define how we build products, interact with our community, and push the boundaries of clean energy technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Premium Quality",
                desc: "Every stove is crafted with highly durable, non-corrosive metals and strict quality standards."
              },
              {
                icon: Leaf,
                title: "Eco-Responsibility",
                desc: "We promote carbon neutrality by sourcing clean agricultural waste for our eco-fuels."
              },
              {
                icon: Target,
                title: "Efficiency First",
                desc: "Advanced airflow systems optimize combustion, providing maximum heat with minimum smoke."
              },
              {
                icon: Users,
                title: "Community Focus",
                desc: "Improving home health and reduction of respiratory diseases by offering clean-cooking alternatives."
              }
            ].map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white p-8 border border-border/60 rounded-sm space-y-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <val.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-secondary">{val.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-secondary">Join Us in Building a Healthier Future</h2>
          <p className="text-muted-foreground font-light text-lg max-w-2xl mx-auto leading-relaxed">
            Browse our curated collections of premium smokeless stoves and eco biomass fuels today, and make a conscious choice for your health and the environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 rounded-none text-base">
                Shop Our Collection
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-none text-base border-secondary text-secondary">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
