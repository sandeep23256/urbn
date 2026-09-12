import Image from "next/image";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPrice?: number;
  images: string[];
  colorway?: string;
  category?: string;
}

// Each category gets its own accent color so the grid reads as lively
// rather than a single monochrome wall of cards.
const categoryColors: Record<string, string> = {
  sneakers: "bg-electric",
  apparel: "bg-coral",
  accessories: "bg-acid",
};

export default function ProductCard({ product }: { product: Product }) {
  const price = product.discountPrice || product.price;
  const badgeColor = categoryColors[product.category || "sneakers"] || "bg-electric";

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/5 transition-shadow group-hover:ring-coral/40">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.category && (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white ${badgeColor}`}>
            {product.category}
          </span>
        )}
        {product.discountPrice && (
          <span className="absolute right-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="font-display text-base text-bone">{product.name}</p>
          <p className="text-sm text-bone/50">{product.colorway || product.brand}</p>
        </div>
        <div className="text-right">
          {product.discountPrice && (
            <p className="text-xs text-bone/40 line-through">₹{product.price}</p>
          )}
          <p className="font-medium text-bone">₹{price}</p>
        </div>
      </div>
    </Link>
  );
}
