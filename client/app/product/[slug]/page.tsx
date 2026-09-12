"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const ProductViewer3D = dynamic(() => import("@/components/ProductViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-black/5 md:h-[520px]">
      <span className="text-sm text-bone/40">Loading 3D model…</span>
    </div>
  ),
});

interface Variant {
  size: string;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  model3d?: string;
  colorway?: string;
  variants: Variant[];
  rating: number;
  numReviews: number;
}

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get(`/products/${params.slug}`).then((res) => {
      setProduct(res.data);
      api.get(`/reviews/${res.data._id}`).then((r) => setReviews(r.data));
      if (user) {
        api.get("/wishlist").then((w) => {
          const inWishlist = (w.data.products || []).some((p: any) => p._id === res.data._id);
          setSaved(inWishlist);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, user]);

  if (!product) {
    return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 text-bone/50">Loading…</div>;
  }

  const price = product.discountPrice || product.price;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      price,
      size: selectedSize,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const toggleWishlist = async () => {
    if (!user) return alert("Sign in to save items to your wishlist");
    await api.post(`/wishlist/${product._id}`);
    setSaved((prev) => !prev);
  };

  const submitReview = async () => {
    if (!user) return alert("Sign in to leave a review");
    try {
      await api.post(`/reviews/${product._id}`, { rating, comment });
      const r = await api.get(`/reviews/${product._id}`);
      setReviews(r.data);
      setComment("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not submit review");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductViewer3D
          modelUrl={product.model3d}
          fallbackImage={product.images[0]}
          productName={product.name}
        />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-electric">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl text-bone">{product.name}</h1>
          <p className="mt-1 text-bone/50">{product.colorway}</p>

          <div className="mt-4 flex items-baseline gap-3">
            {product.discountPrice && (
              <span className="text-bone/40 line-through">₹{product.price}</span>
            )}
            <span className="text-2xl font-semibold text-bone">₹{price}</span>
            {product.discountPrice && (
              <span className="rounded-full bg-amber px-2 py-0.5 text-xs font-medium text-ink">
                Save ₹{product.price - product.discountPrice}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-bone/50">
            <span className="text-amber">{product.rating.toFixed(1)} ★</span> · {product.numReviews} reviews
          </p>

          <p className="mt-6 max-w-md text-bone/70">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-sm text-bone/60">Select size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedSize(v.size)}
                  className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                    selectedSize === v.size
                      ? "border-electric bg-electric text-white"
                      : "border-black/15 text-bone/70"
                  } ${v.stock === 0 ? "cursor-not-allowed opacity-30" : "hover:border-electric/60"}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="btn-primary rounded-md px-6 py-3 font-medium text-bone shadow-lg shadow-coral/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
            <button
              onClick={toggleWishlist}
              className={`rounded-md border px-6 py-3 transition-colors ${
                saved ? "border-coral bg-coral/10 text-coral" : "border-black/15 text-bone/80 hover:border-coral/50 hover:text-coral"
              }`}
            >
              {saved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-xl text-bone">Reviews</h2>

        <div className="mt-6 space-y-5">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-lg border border-black/10 bg-black/5 p-4">
              <p className="text-sm text-bone">{r.name} · <span className="text-amber">{r.rating} ★</span></p>
              <p className="mt-1 text-sm text-bone/60">{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-bone/40">No reviews yet.</p>}
        </div>

        <div className="mt-8 rounded-lg border border-black/10 bg-black/5 p-5">
          <p className="mb-2 text-sm text-bone/60">Leave a review</p>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mb-3 rounded-md border border-black/15 bg-ink px-3 py-2 text-bone focus:border-electric"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did they fit?"
            className="block w-full rounded-md border border-black/15 bg-transparent p-3 text-bone placeholder:text-bone/40 focus:border-electric"
            rows={3}
          />
          <button
            onClick={submitReview}
            className="mt-3 rounded-md bg-electric px-5 py-2 text-white transition-colors hover:bg-electric/80"
          >
            Submit review
          </button>
        </div>
      </section>
    </div>
  );
}
