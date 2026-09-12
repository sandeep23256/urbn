import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";

async function getProducts(searchParams: { [key: string]: string | undefined }) {
  const params = new URLSearchParams();
  if (searchParams.keyword) params.set("keyword", searchParams.keyword);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.category) params.set("category", searchParams.category);

  try {
    const res = await api.get(`/products?${params.toString()}`);
    return { products: res.data.products as any[], error: null as string | null };
  } catch (err: any) {
    const requestedUrl = (err.config?.baseURL || "") + (err.config?.url || "");
    const detail = `${err.message} (requested: ${requestedUrl || "unknown URL"})`;
    console.error("Could not fetch products:", detail);
    return { products: [] as any[], error: detail as string };
  }
}

const categories = [
  { value: "", label: "All", color: "bg-electric" },
  { value: "sneakers", label: "Sneakers", color: "bg-electric" },
  { value: "apparel", label: "Apparel", color: "bg-coral" },
  { value: "accessories", label: "Accessories", color: "bg-acid text-ink" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { products, error } = await getProducts(searchParams);
  const activeCategory = searchParams.category || "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-bone">
        All <span className="gradient-text">sneakers</span>
      </h1>
      <p className="mt-2 text-bone/50">{products.length} pieces in the current catalog.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a
            key={c.value}
            href={`/shop${c.value ? `?category=${c.value}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-transform hover:scale-105 ${
              activeCategory === c.value ? `${c.color} text-bone` : "bg-black/5 text-bone/60"
            }`}
          >
            {c.label}
          </a>
        ))}
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="category" value={activeCategory} />
        <input
          type="text"
          name="keyword"
          defaultValue={searchParams.keyword}
          placeholder="Search by name or brand"
          className="w-full max-w-xs rounded-md border border-black/15 bg-black/5 px-4 py-2 text-bone placeholder:text-bone/40 focus:border-electric"
        />
        <select
          name="sort"
          defaultValue={searchParams.sort}
          className="rounded-md border border-black/15 bg-ink px-4 py-2 text-bone focus:border-electric"
        >
          <option value="">Newest</option>
          <option value="priceAsc">Price: Low to high</option>
          <option value="priceDesc">Price: High to low</option>
          <option value="rating">Top rated</option>
        </select>
        <button className="btn-primary rounded-md px-5 py-2 text-bone">Filter</button>
      </form>

      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {error ? (
        <div className="mt-10 rounded-xl border border-coral/30 bg-coral/5 p-6 text-bone/70">
          <p className="font-medium text-coral">Couldn't reach the backend API.</p>
          <p className="mt-2 text-sm">
            Error: <code className="text-coral">{error}</code>
          </p>
          <p className="mt-2 text-sm text-bone/50">
            Check that the server is running and <code>NEXT_PUBLIC_API_URL</code> is set correctly.
          </p>
        </div>
      ) : (
        products.length === 0 && (
          <p className="mt-10 rounded-xl border border-black/10 bg-black/5 p-6 text-center text-bone/50">
            No products match yet — run <code className="text-coral">node src/seed.js</code> in the
            server folder to populate the catalog.
          </p>
        )
      )}
    </div>
  );
}
