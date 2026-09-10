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
            className="fixed inset-0 bg-ink/60 z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
            className="fixed top-20 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[560px] max-h-[75vh] z-[70] flex flex-col rounded-xl border border-gold/15 bg-charcoal shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-parchment/10 shrink-0">
              <Search size={18} className="text-parchment/40 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tees, verses, collections…"
                className="flex-1 min-w-0 bg-transparent text-parchment placeholder:text-parchment/35 focus:outline-none"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="text-parchment/40 hover:text-rust transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {query.trim() && (
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-1">
                {results.length === 0 ? (
                  <p className="text-parchment/50 text-sm py-8 text-center">No products match "{query}".</p>
                ) : (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3.5 p-2.5 rounded-lg hover:bg-ink transition-colors"
                    >
                      <div className="w-11 h-14 rounded-md overflow-hidden shrink-0 bg-ink">
                        <ProductImage src={p.image} alt={p.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-parchment truncate text-sm">{p.name}</p>
                        {(p.verse || p.tagline) && (
                          <p className="text-xs text-parchment/50 truncate">{p.verse || p.tagline}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gold shrink-0">{formatINR(p.price)}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
