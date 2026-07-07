import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                <span className="text-lg font-bold">B</span>
              </div>
              <span className="text-lg font-bold text-white">Brick Health Energy Solutions</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              Premium cleantech energy solutions for homes and businesses. Solar panels, inverters, batteries, and more — powering a sustainable future.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=solar-panels" className="hover:text-white">Solar Panels</Link></li>
              <li><Link href="/products?category=inverters" className="hover:text-white">Inverters</Link></li>
              <li><Link href="/products?category=batteries" className="hover:text-white">Batteries</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-white">Accessories</Link></li>
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
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Brick Health Energy Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
