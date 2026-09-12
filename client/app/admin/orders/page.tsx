"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => api.get("/admin/orders").then((res) => setOrders(res.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        <span className="gradient-text">Orders</span>
      </h1>
      <div className="mt-8 space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border border-black/10 bg-black/5 p-4 text-sm text-bone/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                #{o._id.slice(-6)} · {o.user?.name} · <span className="text-amber">₹{o.total}</span>
              </span>
              <select
                value={o.status}
                onChange={(e) => updateStatus(o._id, e.target.value)}
                className="rounded-md border border-black/15 bg-ink px-2 py-1 text-bone focus:border-electric"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="mt-2 text-bone/40">
              <span className={o.isPaid ? "text-acid" : "text-coral"}>{o.isPaid ? "Paid" : "Unpaid"}</span>
              {" · "}{new Date(o.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="rounded-lg border border-black/10 bg-black/5 p-4 text-bone/40">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
