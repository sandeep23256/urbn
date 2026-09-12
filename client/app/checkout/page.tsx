"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCartStore();
  const router = useRouter();
  const [address, setAddress] = useState({
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "India",
  });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const shippingFee = subtotal() > 3000 ? 0 : 149;

  const handleCheckout = async () => {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await api.post("/orders/checkout", {
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
        shippingAddress: address,
      });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      // Show the real error inline (e.g. a Stripe key problem) and offer the
      // demo path instead of a dead end.
      setCheckoutError(err.response?.data?.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCheckout = async () => {
    setDemoLoading(true);
    try {
      const res = await api.post("/orders/demo-checkout", {
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
        shippingAddress: address,
      });
      clear();
      router.push(`/order-success?orderId=${res.data.orderId}&demo=1`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      alert(err.response?.data?.message || "Could not complete demo checkout.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        <span className="gradient-text">Checkout</span>
      </h1>

      <div className="mt-8 space-y-3">
        {["line1", "line2", "city", "state", "postalCode"].map((field) => (
          <input
            key={field}
            placeholder={field}
            value={(address as any)[field]}
            onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
            className="block w-full rounded-md border border-black/15 bg-black/5 px-4 py-2 text-bone placeholder:text-bone/40 focus:border-electric"
          />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-black/5 p-5">
        <div className="spec-row"><span className="text-bone/60">Subtotal</span><span>₹{subtotal()}</span></div>
        <div className="spec-row">
          <span className="text-bone/60">Shipping</span>
          <span className={shippingFee === 0 ? "text-acid" : ""}>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
        </div>
        <div className="spec-row border-b-0 pt-3 text-base font-semibold text-bone">
          <span>Total</span><span className="text-amber">₹{subtotal() + shippingFee}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="btn-primary mt-8 w-full rounded-md px-6 py-3 font-medium shadow-lg shadow-coral/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
      >
        {loading ? "Redirecting to payment…" : "Pay with card"}
      </button>

      {checkoutError && (
        <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-4">
          <p className="text-sm text-coral">Stripe checkout failed: {checkoutError}</p>
          <p className="mt-1 text-xs text-bone/50">
            Likely a Stripe key isn't set up yet on the server — see README for setup steps.
          </p>
          <button
            onClick={handleDemoCheckout}
            disabled={demoLoading}
            className="mt-3 w-full rounded-md border border-electric/40 bg-electric/10 px-6 py-2.5 font-medium text-electric transition-colors hover:bg-electric/20 disabled:opacity-50"
          >
            {demoLoading ? "Placing demo order…" : "Continue with Demo Payment instead"}
          </button>
        </div>
      )}
    </div>
  );
}
