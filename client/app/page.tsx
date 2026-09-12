import Link from "next/link";
import dynamic from "next/dynamic";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";

// HeroVisual just uses next/image + a mouse-tilt effect (no WebGL), so it's
// SSR-safe — dynamic import here is only to avoid it blocking the rest of
// the page's data fetch, not to skip server rendering.
const HeroVisual = dynamic(() => import("@/components/HeroVisual"), {
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-electric/10 via-transparent to-coral/10 sm:h-[420px] md:h-[560px]">
      <span className="text-sm text-bone/40">Loading…</span>
    </div>
  ),
});

async function getFeatured() {
  try {
    const res = await api.get("/products?featured=true&limit=4");
    return { products: res.data.products as any[], error: null as string | null };
  } catch (err: any) {
    // Include the actual URL that was requested — a generic "Request failed
    // with status code 404" doesn't say WHERE it looked, which is the one
    // thing you need to debug a wrong NEXT_PUBLIC_API_URL.
    const requestedUrl = (err.config?.baseURL || "") + (err.config?.url || "");
    const detail = `${err.message} (requested: ${requestedUrl || "unknown URL"})`;
    console.error("Could not fetch featured products:", detail);
    return { products: [] as any[], error: detail as string };
  }
}

export default async function HomePage() {
  const { products: featured, error } = await getFeatured();

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="font-display text-4xl font-900 leading-[0.95] text-bone sm:text-5xl md:text-6xl">
            Built <span className="gradient-text">sole</span>
            <br />
            first.
          </h1>
          <p className="mt-6 max-w-sm text-bone/60">
            Every URBN Lab drop is designed sole-first. Explore the full lineup, then spin each
            pair in 3D right on its own product page.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/shop"
              className="btn-primary rounded-md px-6 py-3 font-medium text-bone shadow-lg shadow-coral/20 transition-all hover:scale-[1.03]"
            >
              Shop the drop
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-xl text-bone sm:text-2xl">Current drop</h2>
          <Link href="/shop" className="text-sm text-bone/50 hover:text-bone">
            View all
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {featured.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 text-bone/70">
            <p className="font-medium text-coral">Couldn't reach the backend API.</p>
            <p className="mt-2 text-sm">
              Error: <code className="text-coral">{error}</code>
            </p>
            <p className="mt-2 text-sm text-bone/50">
              Check that the server is running (`npm run dev` inside <code>server/</code>) and that{" "}
              <code>NEXT_PUBLIC_API_URL</code> in <code>client/.env.local</code> points to it —
              default is <code>http://localhost:5000/api</code>.
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-black/10 bg-black/5 p-6 text-bone/40">
            No products yet — run <code className="text-electric">node src/seed.js</code> inside the
            server folder to populate the catalog.
          </p>
        )}
      </section>
    </div>
  );
}
