"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const emptyForm = {
  name: "", slug: "", brand: "", description: "", category: "sneakers",
  price: 0, discountPrice: "", images: "", colorway: "", featured: false,
  variantsRaw: "7:10,8:10,9:10", // size:stock, comma separated
};

// Converts a stored product back into the flat form shape above,
// so clicking "Edit" pre-fills every field instead of starting blank.
function productToForm(p: any) {
  return {
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    description: p.description,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice ? String(p.discountPrice) : "",
    images: (p.images || []).join(", "),
    colorway: p.colorway || "",
    featured: !!p.featured,
    variantsRaw: (p.variants || []).map((v: any) => `${v.size}:${v.stock}`).join(","),
  };
}

const categoryDot: Record<string, string> = {
  sneakers: "bg-electric",
  apparel: "bg-coral",
  accessories: "bg-acid",
};

const inputClass =
  "rounded-md border border-black/15 bg-transparent px-3 py-2 text-bone focus:border-electric";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/products?limit=100").then((res) => setProducts(res.data.products));

  useEffect(() => { load(); }, []);

  const buildPayload = () => {
    const variants = form.variantsRaw.split(",").map((pair) => {
      const [size, stock] = pair.split(":");
      return { size: size.trim(), stock: Number(stock) };
    });

    return {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      brand: form.brand,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      colorway: form.colorway,
      featured: form.featured,
      variants,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, buildPayload());
      } else {
        await api.post("/admin/products", buildPayload());
      }
      cancelEdit();
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p._id);
    setForm(productToForm(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await api.delete(`/admin/products/${id}`);
    if (editingId === id) cancelEdit();
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        Manage <span className="gradient-text">products</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className={`mt-8 grid grid-cols-1 gap-3 rounded-2xl border p-4 transition-colors sm:grid-cols-2 sm:p-6 ${
          editingId ? "border-electric/40 bg-electric/5" : "border-black/10 bg-black/5"
        }`}
      >
        {editingId && (
          <p className="col-span-2 text-sm text-electric">Editing an existing product</p>
        )}
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} required />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} required />
        <input placeholder="Discount price (optional)" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className={inputClass} />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={`${inputClass} bg-ink`}
        >
          <option value="sneakers">Sneakers</option>
          <option value="apparel">Apparel</option>
          <option value="accessories">Accessories</option>
        </select>
        <input placeholder="Colorway" value={form.colorway} onChange={(e) => setForm({ ...form, colorway: e.target.value })} className={inputClass} />
        <input placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className={`col-span-2 ${inputClass}`} required />
        <input placeholder="Variants e.g. 7:10,8:5,9:0" value={form.variantsRaw} onChange={(e) => setForm({ ...form, variantsRaw: e.target.value })} className={`col-span-2 ${inputClass}`} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`col-span-2 ${inputClass}`} required />
        <label className="col-span-2 flex items-center gap-2 text-sm text-bone/70">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Feature on homepage
        </label>

        <div className="col-span-2 flex gap-3">
          <button disabled={saving} className="btn-primary rounded-md px-5 py-2 text-bone shadow-lg shadow-coral/20 disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Save changes" : "Create product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-black/15 px-5 py-2 text-bone/70 hover:border-bone/40"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-10 space-y-2">
        {products.map((p) => (
          <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 bg-black/5 px-4 py-3 text-sm text-bone/80">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${categoryDot[p.category] || "bg-bone/40"}`} />
              {p.name} — <span className="text-amber">₹{p.price}</span>
              {p.featured && <span className="ml-1 rounded-full bg-electric/20 px-2 py-0.5 text-xs text-electric">featured</span>}
            </span>
            <div className="flex gap-4">
              <button onClick={() => startEdit(p)} className="text-electric hover:text-electric/80">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="text-coral hover:text-coral/80">Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="rounded-lg border border-black/10 bg-black/5 p-4 text-bone/40">
            No products yet — create one above, or run <code className="text-coral">node src/seed.js</code> in the server folder.
          </p>
        )}
      </div>
    </div>
  );
}
