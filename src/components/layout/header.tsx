"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Menu, X, ShoppingBag, ChevronDown, LogOut, Settings, History, Shield, User, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const rawCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const { user, loading, refreshUser, clearSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    clearSession();
    await refreshUser();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    router.refresh();
  };

  const count = mounted ? rawCount : 0;

  const displayName = user ? (user.name || user.email?.split("@")[0] || "User") : "";
  const avatarUrl = user?.avatarUrl ?? null;
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/60 py-0"
        : "bg-transparent py-0"
    }`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled ? "h-16" : "h-20"
      } flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <Image src="/images/logo-square.jpeg" alt="Brick Health Energy" width={36} height={36} className={`rounded-lg object-cover transition-all duration-300 ${scrolled ? "h-9 w-9" : "h-10 w-10"}`} />
          <div>
            <span className={`font-bold transition-colors duration-300 ${scrolled ? "text-lg text-primary" : "text-lg text-white"}`}>Brick Health</span>
            <span className={`font-bold transition-colors duration-300 ${scrolled ? "text-lg text-slate-800" : "text-lg text-white/80"}`}> Energy</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "/products", label: "All Products" },
            { href: "/products?category=stoves", label: "Smokeless Stoves" },
            { href: "/products?category=fuel", label: "Eco Biomass Fuel" },
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium relative group transition-colors ${
                scrolled
                  ? "text-muted-foreground hover:text-primary"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                scrolled ? "bg-primary" : "bg-white"
              }`} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <div className="hidden md:block relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 rounded-full py-1.5 px-3 transition-all active:scale-95 ${
                      scrolled
                        ? "hover:bg-slate-50 border border-slate-100"
                        : "hover:bg-white/10 border border-white/20"
                    }`}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover border border-primary/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                        {initials}
                      </div>
                    )}
                    <span className={`text-sm font-medium max-w-[120px] truncate ${scrolled ? "text-slate-700" : "text-white/80"}`}>
                      {displayName.split(" ")[0]}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${scrolled ? "text-slate-400" : "text-white/60"} ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 rounded-none border border-slate-100 bg-white p-4 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center gap-3 pb-3 border-b">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base">
                              {initials}
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className="py-2 space-y-1">
                          <Link href="/account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <User className="h-4 w-4 text-slate-400" /> My Account
                          </Link>
                          <Link href="/account/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <History className="h-4 w-4 text-slate-400" /> Order History
                          </Link>
                          <Link href="/account/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <Heart className="h-4 w-4 text-slate-400" /> Wishlist
                          </Link>
                          <Link href="/account/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <Settings className="h-4 w-4 text-slate-400" /> Profile Settings
                          </Link>
                          {user && isAdminEmail(user.email) && (
                            <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
                              <Shield className="h-4 w-4 text-amber-500" /> Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="pt-2 border-t">
                          <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm font-medium border px-4 py-2 transition-colors ${
                    scrolled
                      ? "text-slate-800 hover:text-primary border-slate-200 hover:border-slate-800"
                      : "text-white border-white/30 hover:border-white"
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>
          )}

          <button onClick={toggleCart} className={`relative flex items-center gap-2 rounded-md p-2 transition-colors ${scrolled ? "hover:bg-accent/10" : "hover:bg-white/10"}`}>
            <ShoppingBag className={`h-5 w-5 ${scrolled ? "text-slate-800" : "text-white"}`} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white animate-pulse">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center justify-center p-2 rounded-md md:hidden transition-colors ${scrolled ? "text-slate-800 hover:bg-accent/10" : "text-white hover:bg-white/10"}`}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-b bg-white px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200 shadow-lg">
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-800 hover:text-primary transition-colors">
            All Products
          </Link>
          <Link href="/products?category=stoves" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-800 hover:text-primary transition-colors">
            Smokeless Stoves
          </Link>
          <Link href="/products?category=fuel" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-800 hover:text-primary transition-colors">
            Eco Biomass Fuel
          </Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-800 hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-800 hover:text-primary transition-colors">
            Contact
          </Link>

          {!loading && (
            <div className="border-t pt-4 space-y-3">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{displayName}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/account" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-slate-700 hover:text-primary border border-slate-200 py-2">
                      My Account
                    </Link>
                    <Link href="/account/wishlist" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-slate-700 hover:text-primary border border-slate-200 py-2">
                      Wishlist
                    </Link>
                  </div>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-none transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-center text-base font-medium text-slate-800 hover:text-primary border border-slate-200 py-3 transition-colors">
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
