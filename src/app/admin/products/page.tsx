"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { products as seedProducts } from "@/lib/seed-data";
import { Package, Plus, Edit2, X, Check, Search } from "lucide-react";

interface Product {
  id: string; name: string; category: string; price: number; original_price?: number;
  in_stock: boolean; stock_count: number; featured: boolean; image?: string;
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", stock_count: "", in_stock: true, featured: false });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ id: "", name: "", category: "stoves", price: "", stock_count: "", in_stock: true, featured: false });
  const [addLoading, setAddLoading] = useState(false);

  const isAdmin = user ? isAdminEmail(user.email) : false;

  useEffect(() => { document.title = "Manage Products | Brick Health Energy"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { setLoading(false); return; }
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
        else if (process.env.NODE_ENV === "development") {
          console.warn("[admin/products] No products from DB, using seed data (development only).");
          setProducts(seedProducts);
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === "development") setProducts(seedProducts);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleAddProduct() {
    setAddLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addForm.id,
          name: addForm.name,
          category: addForm.category,
          price: parseInt(addForm.price),
          stock_count: parseInt(addForm.stock_count),
          in_stock: addForm.in_stock,
          featured: addForm.featured,
        }),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts((prev) => [...prev, newProduct]);
        setShowAdd(false);
        setAddForm({ id: "", name: "", category: "stoves", price: "", stock_count: "", in_stock: true, featured: false });
      }
    } catch (e) { console.error(e); }
    finally { setAddLoading(false); }
  }

  async function saveProduct(id: string) {
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editForm.name, price: parseInt(editForm.price), stock_count: parseInt(editForm.stock_count), in_stock: editForm.in_stock, featured: editForm.featured }),
      });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, name: editForm.name, price: parseInt(editForm.price), stock_count: parseInt(editForm.stock_count), in_stock: editForm.in_stock, featured: editForm.featured } : p));
      setEditingId(null);
    } catch (e) { console.error(e); }
  }

  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-12 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <Package className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-6 text-3xl font-semibold font-serif text-secondary">Access Denied</h1>
        <p className="mt-3 text-muted-foreground font-light">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold font-serif text-secondary flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Products
          </h1>
          <p className="mt-1 text-muted-foreground font-light">{products.length} products total</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {showAdd && (
        <div className="mb-6 rounded-lg border bg-slate-50 p-6 space-y-4">
          <h3 className="font-semibold text-secondary">Add New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input placeholder="Product ID (e.g. new-stove-1)" value={addForm.id} onChange={(e) => setAddForm({ ...addForm, id: e.target.value })} className="rounded-none" />
            <Input placeholder="Product Name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="rounded-none" />
            <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className="rounded-none border border-input bg-background px-3 h-12 text-sm">
              <option value="stoves">Stoves</option>
              <option value="fuel">Fuel</option>
            </select>
            <Input type="number" placeholder="Price (₦)" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} className="rounded-none" />
            <Input type="number" placeholder="Stock Count" value={addForm.stock_count} onChange={(e) => setAddForm({ ...addForm, stock_count: e.target.value })} className="rounded-none" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addForm.in_stock} onChange={(e) => setAddForm({ ...addForm, in_stock: e.target.checked })} /> In Stock</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addForm.featured} onChange={(e) => setAddForm({ ...addForm, featured: e.target.checked })} /> Featured</label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" disabled={!addForm.id || !addForm.name || !addForm.price || addLoading} onClick={handleAddProduct}>{addLoading ? "Saving..." : "Save Product"}</Button>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/50">
              <th className="text-left px-4 py-3 font-semibold text-secondary">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-secondary hidden sm:table-cell">Category</th>
              <th className="text-right px-4 py-3 font-semibold text-secondary">Price</th>
              <th className="text-center px-4 py-3 font-semibold text-secondary hidden md:table-cell">Stock</th>
              <th className="text-center px-4 py-3 font-semibold text-secondary hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                {editingId === product.id ? (
                  <>
                    <td className="px-4 py-3"><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-sm rounded-none" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="secondary">{product.category}</Badge></td>
                    <td className="px-4 py-3 text-right"><Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-8 w-24 text-sm rounded-none ml-auto" /></td>
                    <td className="px-4 py-3 text-center hidden md:table-cell"><Input type="number" value={editForm.stock_count} onChange={(e) => setEditForm({ ...editForm, stock_count: e.target.value })} className="h-8 w-16 text-sm rounded-none mx-auto" /></td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <label className="flex items-center justify-center gap-2 text-sm"><input type="checkbox" checked={editForm.in_stock} onChange={(e) => setEditForm({ ...editForm, in_stock: e.target.checked })} /> Active</label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => saveProduct(product.id)}><Check className="h-4 w-4 text-green-600" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 text-red-600" /></Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-secondary">{product.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="secondary">{product.category}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatNaira(product.price)}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">{product.stock_count}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {product.in_stock ? <Badge className="bg-green-100 text-green-800 border-none">In Stock</Badge> : <Badge className="bg-red-100 text-red-800 border-none">Out</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(product.id); setEditForm({ name: product.name, price: String(product.price), stock_count: String(product.stock_count), in_stock: product.in_stock, featured: product.featured }); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
