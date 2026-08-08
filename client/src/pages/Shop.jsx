import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CATEGORIES, PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const [sort, setSort] = useState("featured");

  const setCategory = (cat) => {
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const products = useMemo(() => {
    let list =
      activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [activeCategory, sort]);

  return (
    <div className="bg-parchment">
      <div className="bg-ink text-parchment pt-32 pb-16 grain">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">THE FULL COLLECTION</p>
          <h1 className="font-display text-5xl md:text-6xl">Shop All</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`font-condensed tracking-[0.08em] text-xs px-4 py-2 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-ink text-parchment border-ink"
                    : "border-ink/20 text-ink/70 hover:border-gold hover:text-rust"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="font-condensed tracking-[0.05em] text-sm border border-ink/20 rounded-full px-4 py-2 bg-transparent focus:outline-none focus:border-gold"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {products.length === 0 ? (
          <p className="text-ink/50 py-20 text-center">No products found in this category yet.</p>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
