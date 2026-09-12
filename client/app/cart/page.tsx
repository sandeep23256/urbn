"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-electric/10 text-2xl">
          🛒
        </div>
        <p className="text-bone/60">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block font-medium text-coral hover:text-coral/80">
          Browse the drop →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        Your <span className="gradient-text">cart</span>
      </h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.size}`}
            className="flex gap-3 rounded-xl border border-black/10 bg-black/5 p-3 sm:gap-4 sm:p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5 sm:h-24 sm:w-24">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-bone">{item.name}</p>
                  <p className="text-sm text-electric">Size {item.size}</p>
                </div>
                <p className="shrink-0 font-medium text-bone">₹{item.price * item.qty}</p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateQty(item.productId, item.size, Number(e.target.value))}
                  className="w-16 rounded-md border border-black/15 bg-transparent px-2 py-1 text-bone focus:border-electric"
                />
                <button
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-sm text-bone/40 transition-colors hover:text-coral"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-xl border border-black/10 bg-black/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg text-bone">
          Subtotal: <span className="font-semibold text-amber">₹{subtotal()}</span>
        </p>
        <Link
          href="/checkout"
          className="btn-primary rounded-md px-6 py-3 text-center font-medium text-bone shadow-lg shadow-coral/20 transition-transform hover:scale-[1.03]"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
