"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; demo?: string };
}) {
  const clear = useCartStore((s) => s.clear);
  const isDemo = searchParams.demo === "1";

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-acid/20 text-3xl text-acid">
        ✓
      </div>
      <h1 className="font-display text-3xl text-bone">
        Order <span className="gradient-text">placed</span>
      </h1>
      <p className="mt-3 text-bone/60">
        Order #{searchParams.orderId?.slice(-6)} is confirmed. We'll email you once it ships.
      </p>
      {isDemo && (
        <p className="mx-auto mt-4 max-w-sm rounded-lg border border-electric/30 bg-electric/5 px-4 py-2 text-xs text-electric">
          This was a demo payment — no real card was charged.
        </p>
      )}
      <Link href="/shop" className="mt-8 inline-block font-medium text-coral hover:text-coral/80">
        Keep browsing →
      </Link>
    </div>
  );
}
