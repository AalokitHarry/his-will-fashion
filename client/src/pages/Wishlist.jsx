import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import useSEO from "../hooks/useSEO";

export default function Wishlist() {
  const { products, loading } = useProducts();
  const { ids } = useWishlist();

  const wishlisted = products.filter((p) => ids.includes(p.id));

  useSEO({ title: "Wishlist", path: "/wishlist", noindex: true });

  return (
    <div>
      <div className="bg-gold text-ink pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-condensed tracking-[0.2em] text-ink/60 text-xs mb-3">SAVED FOR LATER</p>
          <h1 className="font-editorial text-5xl md:text-6xl">Your Wishlist</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-12">
        {loading ? (
          <p className="text-parchment/50 py-20 text-center">Loading…</p>
        ) : wishlisted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Heart size={40} strokeWidth={1.2} className="text-parchment/30" />
            <p className="text-parchment/60">Nothing saved yet — tap the heart on any product to add it here.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors mt-2"
            >
              BROWSE THE COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {wishlisted.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
