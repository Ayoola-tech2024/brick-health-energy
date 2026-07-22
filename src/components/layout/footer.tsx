import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-secondary text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image src="/images/logo-square.jpeg" alt="Brick Health Energy" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-lg font-bold text-white">Brick Health <span className="text-primary">Energy</span></span>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              Premium biomass stoves and high-efficiency eco-fuels — engineered for healthy cooking and a sustainable future.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=stoves" className="hover:text-primary transition-colors">Smokeless Stoves</Link></li>
              <li><Link href="/products?category=fuel" className="hover:text-primary transition-colors">Eco Biomass Fuel</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>info@brickhealthenergy.org</li>
              <li>+234 703 568 9394</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Brick Health Energy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
