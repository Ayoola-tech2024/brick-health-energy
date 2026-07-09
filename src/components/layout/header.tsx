"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Menu, X, ShoppingBag } from "lucide-react";
import { createBrowserClient } from "@insforge/sdk/ssr";
import { signOutAction } from "@/app/auth-actions";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const rawCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const insforge = createBrowserClient();
    insforge.auth.getCurrentUser()
      .then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching current user:", err));
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    setUser(null);
    setIsMenuOpen(false);
    router.refresh();
  };

  const count = mounted ? rawCount : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              B
            </div>
            <div>
              <span className="text-lg font-bold text-primary">Brick Health</span>
              <span className="text-lg font-bold text-slate-800"> Energy</span>
            </div>
          </Link>

          {/* Desktop Nav */}
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
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            {mounted && (
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-light text-slate-600">
                      Hi, {user.name?.split(" ")[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-slate-800 hover:text-primary transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-800 hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button onClick={toggleCart} className="relative flex items-center gap-2 rounded-md p-2 hover:bg-accent/10 transition-colors">
              <ShoppingBag className="h-5 w-5 text-slate-800" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white animate-pulse">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center p-2 text-slate-800 hover:bg-accent/10 rounded-md md:hidden transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-white px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            href="/products"
            onClick={() => setIsMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-primary transition-colors"
          >
            All Products
          </Link>
          <Link
            href="/products?category=stoves"
            onClick={() => setIsMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-primary transition-colors"
          >
            Smokeless Stoves
          </Link>
          <Link
            href="/products?category=fuel"
            onClick={() => setIsMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-primary transition-colors"
          >
            Eco Biomass Fuel
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="block text-base font-medium text-slate-800 hover:text-primary transition-colors"
          >
            About Us
          </Link>
          
          {mounted && (
            <div className="border-t pt-4 space-y-3">
              {user ? (
                <>
                  <span className="block text-sm font-light text-slate-500">
                    Logged in as {user.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="block text-base font-medium text-slate-800 hover:text-primary transition-colors w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-medium text-slate-800 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
