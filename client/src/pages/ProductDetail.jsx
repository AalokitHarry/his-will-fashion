import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getProductById, PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";
import { formatINR } from "../utils/format";
import ProductCarousel from "../components/ProductCarousel";
import ProductCard from "../components/ProductCard";
import VerseMark from "../components/VerseMark";
import useSEO from "../hooks/useSEO";

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem } = useCart();

  const [size, setSize] = useState(product?.sizes?.[0]);
  const [color, setColor] = useState(product?.colors?.[0]?.name);
  const [qty, setQty] = useState(1);

  useSEO(
    product
      ? {
          title: `${product.name} — ${product.verse || product.tagline || "His Will Fashion"}`,
          description: product.description,
          path: `/product/${product.id}`,
          image: `https://his-will-fashion.aalokitharry1995.workers.dev${product.image}`,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images.map((src) => `https://his-will-fashion.aalokitharry1995.workers.dev${src}`),
            sku: product.id,
            brand: { "@type": "Brand", name: "His Will Fashion" },
            offers: {
              "@type": "Offer",
              url: `https://his-will-fashion.aalokitharry1995.workers.dev/product/${product.id}`,
              priceCurrency: "INR",
              price: product.price,
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          },
        }
      : { title: "Product Not Found", noindex: true, path: `/product/${id}` }
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-40 text-center">
        <h1 className="font-display text-3xl mb-4">Product not found</h1>
        <Link to="/shop" className="underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 grid md:grid-cols-2 gap-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:sticky md:top-28 self-start"
        >
          <ProductCarousel images={product.images || [product.image]} alt={product.name} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          {(product.verse || product.tagline) && (
            <VerseMark className="mb-3" trigger="mount">{product.verse || product.tagline}</VerseMark>
          )}
          <h1 className="font-display text-3xl md:text-4xl leading-tight mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl font-medium">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-base text-parchment/40 line-through">{formatINR(product.compareAt)}</span>
            )}
            {product.compareAt && (
              <span className="text-xs font-condensed tracking-wide bg-rust text-parchment px-2 py-1 rounded-md">
                SAVE {Math.round(100 - (product.price / product.compareAt) * 100)}%
              </span>
            )}
          </div>

          <p className="text-parchment/70 leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            <p className="font-condensed tracking-[0.1em] text-xs text-parchment/60 mb-2.5">
              COLOR — <span className="text-parchment">{color}</span>
            </p>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  disabled={product.colors.length === 1}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    color === c.name ? "border-gold scale-110" : "border-transparent hover:border-parchment/30"
                  } ${product.colors.length === 1 ? "cursor-default" : ""}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="font-condensed tracking-[0.1em] text-xs text-parchment/60 mb-2.5">SIZE</p>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[3rem] px-3.5 py-2.5 rounded-lg border font-condensed tracking-wide text-sm transition-colors ${
                    size === s
                      ? "bg-gold text-ink border-gold"
                      : "border-parchment/20 text-parchment/70 hover:border-gold"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-parchment/20 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-gold" aria-label="Decrease quantity">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:text-gold" aria-label="Increase quantity">
                <Plus size={15} />
              </button>
            </div>
            <button
              onClick={() => addItem(product, { size, color, qty })}
              className="flex-1 bg-gold text-ink font-condensed tracking-[0.14em] py-3.5 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200"
            >
              ADD TO BAG — {formatINR(product.price * qty)}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center border-t border-parchment/10 pt-6">
            <div className="flex flex-col items-center gap-2 text-parchment/60">
              <Truck size={18} strokeWidth={1.5} />
              <span className="text-[11px] font-condensed tracking-wide">PAN INDIA SHIPPING</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-parchment/60">
              <RotateCcw size={18} strokeWidth={1.5} />
              <span className="text-[11px] font-condensed tracking-wide">7-DAY EASY RETURNS</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-parchment/60">
              <ShieldCheck size={18} strokeWidth={1.5} />
              <span className="text-[11px] font-condensed tracking-wide">SECURE CHECKOUT</span>
            </div>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 border-t border-parchment/10 mt-10">
          <h2 className="font-editorial text-3xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
