import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { formatINR } from "../utils/format";
import ProductImage from "./ProductImage";

export default function SearchOverlay({ isOpen, onClose }) {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => [p.name, p.tagline, p.verse, p.description, p.category].some((field) => field?.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [products, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[70] bg-parchment text-ink shadow-2xl"
          >
            <div className="mx-auto max-w-2xl px-5 py-6">
              <div className="flex items-center gap-3 border-b-2 border-ink/15 pb-3">
                <Search size={20} className="text-ink/40 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tees, verses, collections…"
                  className="flex-1 min-w-0 bg-transparent text-lg focus:outline-none placeholder:text-ink/35"
                />
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="text-ink/40 hover:text-rust transition-colors shrink-0"
                >
                  <X size={22} />
                </button>
              </div>

              {query.trim() && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto flex flex-col gap-1">
                  {results.length === 0 ? (
                    <p className="text-ink/50 text-sm py-8 text-center">No products match "{query}".</p>
                  ) : (
                    results.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-2.5 rounded-lg hover:bg-ink/5 transition-colors"
                      >
                        <div className="w-12 h-14 rounded-md overflow-hidden shrink-0 bg-charcoal">
                          <ProductImage src={p.image} alt={p.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          {(p.verse || p.tagline) && (
                            <p className="text-xs text-ink/50 truncate">{p.verse || p.tagline}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium shrink-0">{formatINR(p.price)}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
