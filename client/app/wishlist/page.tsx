"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/wishlist").then((res) => setProducts(res.data.products || []));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    // same toggle endpoint the product page uses — calling it again on an
    // item that's already saved removes it
    await api.post(`/wishlist/${productId}`);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        <span className="gradient-text">Wishlist</span>
      </h1>

      {loading && <p className="mt-8 text-bone/40">Loading…</p>}

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p) => (
          <div key={p._id} className="group relative">
            <button
              onClick={() => remove(p._id)}
              className="absolute right-2 top-2 z-10 rounded-full bg-ink/80 px-2 py-1 text-xs text-bone/80 transition-colors hover:bg-coral hover:text-white"
              aria-label={`Remove ${p.name} from wishlist`}
            >
              Remove
            </button>
            <Link href={`/product/${p.slug}`}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/5 transition-shadow group-hover:ring-coral/40">
                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
              </div>
              <p className="mt-3 font-display text-base text-bone">{p.name}</p>
              <p className="text-sm text-amber">₹{p.discountPrice || p.price}</p>
            </Link>
          </div>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p className="mt-6 text-bone/40">
          Nothing saved yet. <Link href="/shop" className="text-electric hover:text-electric/80">Browse the drop →</Link>
        </p>
      )}
    </div>
  );
}
