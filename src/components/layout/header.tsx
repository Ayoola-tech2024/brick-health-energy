"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function Header() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const rawCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? rawCount : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              B
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-primary">Brick Health</span>
              <span className="text-lg font-bold text-slate-800"> Energy</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <Link href="/products?category=stoves" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Smokeless Stoves
            </Link>
            <Link href="/products?category=fuel" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Eco Biomass Fuel
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleCart} className="relative flex items-center gap-2 rounded-md p-2 hover:bg-accent/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-800">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white animate-pulse">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
