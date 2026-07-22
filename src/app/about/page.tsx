"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Leaf, Target, Users, AlertTriangle, BarChart3, TrendingDown, Wind } from "lucide-react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Brick Health Energy";
  }, []);
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
            src="/images/products/brick-health-2.jpeg"
            alt="The Brick Health Energy team"
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
            className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
          >
            Brick Health Energy Solutions is a cleantech company transforming agricultural waste into 
            sustainable green briquettes, pellets, and smart cookstoves for households and businesses. 
            Our innovative stoves integrate proprietary TEG technology to generate electricity while 
            cooking, with IoT-enabled monitoring for impact tracking and carbon credits.
          </motion.p>
        </div>
      </section>

      {/* The Problem Section — from PDF content */}
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
              <motion.span variants={fadeInUp} className="text-xs font-semibold tracking-widest text-primary uppercase">
                The Challenge
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-semibold text-secondary">
                The Problem We&apos;re Solving
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground font-light text-lg leading-relaxed">
                Millions of households and small businesses across Africa still rely on firewood and 
                charcoal for cooking because cleaner alternatives remain unaffordable or inaccessible. 
                This dependence exposes families to harmful indoor air pollution, increases respiratory 
                illnesses, accelerates deforestation, and contributes significantly to greenhouse gas emissions.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground font-light text-lg leading-relaxed">
                Vast amounts of agricultural waste are burned or discarded instead of being converted 
                into clean, renewable energy. Rising fuel prices further strain low-income households 
                and food vendors, forcing them to spend a significant portion of their income on cooking fuel.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground font-light text-lg leading-relaxed">
                The result is a cycle of energy poverty, poor health, environmental degradation, and 
                economic hardship that disproportionately affects women, children, and rural communities.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Wind, stat: "80%", label: "Indoor smoke reduction" },
                  { icon: TrendingDown, stat: "60%", label: "Less fuel consumption" },
                  { icon: AlertTriangle, stat: "4M+", label: "Respiratory cases/year" },
                  { icon: BarChart3, stat: "40%", label: "Income spent on fuel" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.6 }}
                    className="bg-slate-50 p-6 rounded-sm border border-border/50 text-center"
                  >
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-secondary">{item.stat}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="relative aspect-video bg-slate-100 rounded-sm overflow-hidden shadow-lg">
                <Image
                  src="/images/products/brick-health-3.jpeg"
                  alt="Traditional cooking methods"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="py-24 bg-slate-50 border-y border-border">
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
                The Journey of Brick Health Excellence
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
                src="/images/products/brick-health-1.jpeg"
                alt="Eco-friendly briquette production"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Potential — from PDF content */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-12 transform origin-top-right" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold tracking-widest text-primary uppercase"
            >
              Our Impact Potential
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-semibold"
            >
              Driving the Transition to <span className="text-primary">Clean Energy</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                number: "60%",
                title: "Less Deforestation",
                desc: "Reducing dependence on firewood and charcoal through sustainable biomass alternatives."
              },
              {
                number: "40%",
                title: "Lower Fuel Costs",
                desc: "Affordable clean cooking solutions that save families and small businesses money."
              },
              {
                number: "100%",
                title: "Agricultural Waste",
                desc: "Converting discarded ag waste into valuable clean energy — a circular economy in action."
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="bg-white/5 border border-white/10 p-8 rounded-sm text-center backdrop-blur-sm"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-3">{item.number}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <p className="text-gray-300 text-lg leading-relaxed">
              Brick Health Energy is driving the transition to clean, affordable energy across Africa. 
              Our solution improves household health through cleaner cooking, lowers fuel costs for 
              families and small businesses, converts agricultural waste into valuable clean energy, 
              reduces carbon emissions and deforestation, and expands energy access through our 
              TEG-powered smart cookstoves.
            </p>
            <p className="text-gray-400 leading-relaxed">
              By creating green jobs and enabling carbon credit generation through IoT-enabled impact 
              tracking, we are building a more sustainable, inclusive, and climate-resilient future.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link href="/products">
              <Button className="rounded-none px-10 py-6 text-base hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                Join the Movement <span className="ml-2">→</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
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

      {/* Product Gallery */}
      <section className="py-24 bg-slate-50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">Our Product Range</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-secondary">Clean Energy Solutions</h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto">
              From high-efficiency smokeless stoves to premium eco-friendly biomass fuels — engineered for performance and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { src: "/images/products/brick-health-1.jpeg", name: "Rocket Cookstove", role: "High-efficiency smokeless design for everyday cooking" },
              { src: "/images/products/brick-health-2.jpeg", name: "TEG Smart Stove", role: "Generates electricity while cooking — USB charging included" },
              { src: "/images/products/brick-health-3.jpeg", name: "Portable Travel Stove", role: "Compact, foldable, perfect for camping and outdoor use" },
              { src: "/images/products/brick-health-4.jpeg", name: "Commercial TEG Stove", role: "Heavy-duty industrial-grade for restaurants & institutions" },
              { src: "/images/products/brick-health-5.jpeg", name: "Biomass Briquettes", role: "Smokeless, long-burning fuel from recycled agricultural waste" },
              { src: "/images/products/brick-health-6.jpeg", name: "Wood Pellets", role: "High-density premium pellets for maximum heat output" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="group bg-white border border-border/60 rounded-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-200">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5 text-center space-y-1">
                  <h3 className="font-semibold text-secondary">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-light">{item.role}</p>
                </div>
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
