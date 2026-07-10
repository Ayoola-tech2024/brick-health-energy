"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Menu, X, ShoppingBag, ChevronDown, LogOut, Settings, History } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { signOutAction } from "@/app/auth-actions";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const rawCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const { user, loading, refreshUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
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
            {!loading && (
              <div className="hidden md:block relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 rounded-full py-1.5 px-3 hover:bg-slate-50 border border-slate-100 transition-all active:scale-95"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-8 w-8 rounded-full object-cover border border-primary/20"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {initials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                        {displayName.split(" ")[0]}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <>
                        {/* Overlay to close on click outside */}
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        
                        <div className="absolute right-0 mt-2 w-64 rounded-none border border-slate-100 bg-white p-4 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="flex items-center gap-3 pb-3 border-b">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
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
                            <Link
                              href="/checkout"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <History className="h-4 w-4 text-slate-400" />
                              Order History
                            </Link>
                            <Link
                              href="/products"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Settings className="h-4 w-4 text-slate-400" />
                              Products Catalog
                            </Link>
                          </div>

                          <div className="pt-2 border-t">
                            <button
                              onClick={handleSignOut}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-800 hover:text-primary transition-colors border border-slate-200 px-4 py-2 hover:border-slate-800 transition-colors"
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
          
          {!loading && (
            <div className="border-t pt-4 space-y-3">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-10 w-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
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
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-none transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center text-base font-medium text-slate-800 hover:text-primary border border-slate-200 py-3 transition-colors"
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
