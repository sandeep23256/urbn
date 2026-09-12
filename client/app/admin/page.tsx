"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.role === "admin") api.get("/admin/stats").then((res) => setStats(res.data));
  }, [user]);

  if (user?.role !== "admin") {
    return <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20 text-bone/50">Admin access only.</div>;
  }

  // Each stat card gets its own accent so the dashboard doesn't read as a
  // flat grid of identical grey boxes.
  const cards = stats
    ? [
        { label: "Orders", value: stats.totalOrders, color: "text-electric", ring: "hover:ring-electric/40" },
        { label: "Products", value: stats.totalProducts, color: "text-coral", ring: "hover:ring-coral/40" },
        { label: "Customers", value: stats.totalUsers, color: "text-acid", ring: "hover:ring-acid/40" },
        { label: "Revenue", value: `₹${stats.revenue}`, color: "text-amber", ring: "hover:ring-amber/40" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        <span className="gradient-text">Admin</span> dashboard
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border border-black/10 bg-black/5 p-4 ring-1 ring-transparent transition-all ${c.ring}`}
          >
            <p className="text-xs uppercase tracking-wide text-bone/50">{c.label}</p>
            <p className={`mt-1 font-display text-2xl ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/products"
          className="rounded-md bg-electric px-5 py-2.5 font-medium text-white transition-colors hover:bg-electric/80"
        >
          Manage products →
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-md bg-coral px-5 py-2.5 font-medium text-white transition-colors hover:bg-coral/80"
        >
          Manage orders →
        </Link>
      </div>
    </div>
  );
}
