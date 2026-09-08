import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductImage from "./ProductImage";
import VerseMark from "./VerseMark";
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
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-charcoal border border-gold/15">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.tag && (
            <span className="absolute top-3 left-3 bg-gold text-ink text-[10px] font-condensed tracking-[0.12em] px-2.5 py-1 rounded-md">
              {product.tag.toUpperCase()}
            </span>
          )}
          {product.compareAt && (
            <span className="absolute top-3 right-3 bg-rust text-parchment text-[10px] font-condensed tracking-[0.12em] px-2.5 py-1 rounded-md">
              SALE
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 font-condensed tracking-[0.12em] text-xs text-parchment border border-parchment/50 rounded-md px-4 py-1.5">
            VIEW PRODUCT
          </span>
        </div>
        <div className="pt-4 px-0.5">
          {(product.verse || product.tagline) && (
            <VerseMark className="mb-1.5">{product.verse || product.tagline}</VerseMark>
          )}
          <h3 className="font-display text-lg leading-snug text-parchment group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-parchment/90">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs text-parchment/40 line-through">{formatINR(product.compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
