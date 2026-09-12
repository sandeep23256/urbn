"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) api.get("/orders/mine").then((res) => setOrders(res.data));
  }, [user]);

  if (!user) {
    return <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20 text-bone/50">Sign in to view your account.</div>;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber/20 text-amber",
    processing: "bg-electric/20 text-electric",
    shipped: "bg-electric/20 text-electric",
    delivered: "bg-acid/20 text-acid",
    cancelled: "bg-coral/20 text-coral",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-bone">
          Hi, <span className="gradient-text">{user.name.split(" ")[0]}</span>
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-black/15 px-4 py-2 text-sm text-bone/70 transition-colors hover:border-coral hover:text-coral"
        >
          Log out
        </button>
      </div>
      <p className="mt-1 text-sm text-bone/40">{user.email}</p>

      <h2 className="mt-10 font-display text-xl text-bone">Order history</h2>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border border-black/10 bg-black/5 p-4 text-sm text-bone/70">
            <div className="flex items-center justify-between">
              <span>Order #{o._id.slice(-6)}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] || "bg-black/10 text-bone/60"}`}>
                {o.status}
              </span>
            </div>
            <p className="mt-1 text-bone/40">₹{o.total} · {new Date(o.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-bone/40">No orders yet.</p>}
      </div>
    </div>
  );
}
