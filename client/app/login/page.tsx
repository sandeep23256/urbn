"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
      router.push("/");
    } catch (err: any) {
      if (err.response) {
        // Backend responded with an error (wrong password, etc.) — its
        // message is accurate, show it as-is.
        setError(err.response.data?.message || "Login failed");
      } else {
        // No response at all usually means the browser blocked the request
        // (CORS) or the backend is unreachable — very different from a
        // wrong password, so say so explicitly instead of a generic message.
        setError(
          "Couldn't reach the server — this is usually a CORS issue (backend's CLIENT_URL doesn't match this site's URL) or the backend is down."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4 sm:px-6">
      <div className="w-full rounded-2xl border border-black/10 bg-black/5 p-8">
        <h1 className="font-display text-3xl text-bone">
          Sign <span className="gradient-text">in</span>
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-4 py-2 text-bone placeholder:text-bone/40 focus:border-electric"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-4 py-2 text-bone placeholder:text-bone/40 focus:border-electric"
            required
          />
          {error && <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>}
          <button
            disabled={loading}
            className="btn-primary w-full rounded-md px-6 py-3 font-medium text-bone shadow-lg shadow-coral/20 transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs uppercase tracking-wide text-bone/40">or</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <GoogleSignInButton />

        <p className="mt-4 text-sm text-bone/50">
          No account? <Link href="/register" className="text-electric hover:text-electric/80">Create one</Link>
        </p>
      </div>
    </div>
  );
}
