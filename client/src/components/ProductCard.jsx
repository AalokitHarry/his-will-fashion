import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductImage from "./ProductImage";
import { formatINR } from "../utils/format";

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ink">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {product.tag && (
            <span className="absolute top-3 left-3 bg-parchment/95 text-ink text-[10px] font-condensed tracking-[0.12em] px-2.5 py-1 rounded-full">
              {product.tag.toUpperCase()}
            </span>
          )}
          {product.compareAt && (
            <span className="absolute top-3 right-3 bg-rust text-parchment text-[10px] font-condensed tracking-[0.12em] px-2.5 py-1 rounded-full">
              SALE
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 font-condensed tracking-[0.12em] text-xs text-parchment border border-parchment/50 rounded-full px-4 py-1.5">
            VIEW PRODUCT
          </span>
        </div>
        <div className="pt-3.5 px-0.5">
          {(product.verse || product.tagline) && (
            <p className="text-[11px] font-condensed tracking-[0.1em] text-gold/80 mb-1">
              {product.verse || product.tagline}
            </p>
          )}
          <h3 className="font-display text-[15px] leading-snug text-ink group-hover:text-rust transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs text-ink/40 line-through">{formatINR(product.compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
