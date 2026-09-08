import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage";

export default function ProductCarousel({ images, alt, className = "" }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (next) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const prev = () => go((index - 1 + images.length) % images.length);
  const next = () => go((index + 1) % images.length);

  return (
    <div className={className}>
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal border border-gold/15 group">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <ProductImage src={images[index]} alt={`${alt} — photo ${index + 1}`} />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-parchment text-ink opacity-0 group-hover:opacity-100 md:transition-opacity duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-parchment text-ink opacity-0 group-hover:opacity-100 md:transition-opacity duration-200"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`h-1.5 transition-all duration-200 ${
                    i === index ? "w-6 bg-parchment" : "w-1.5 bg-parchment/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 mt-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => go(i)}
              className={`w-16 aspect-[3/4] overflow-hidden border transition-colors ${
                i === index ? "border-gold" : "border-parchment/15 hover:border-parchment/40"
              }`}
            >
              <ProductImage src={src} alt={`${alt} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
