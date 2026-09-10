import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X } from "lucide-react";

// A methodology guide, not a measurement table — we don't have confirmed
// per-size garment measurements to publish, so this teaches customers to
// self-measure against a tee they already own rather than showing invented
// numbers for this product.
export default function SizeGuideModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-5"
          >
            <div className="bg-charcoal border border-gold/20 rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Ruler className="text-gold" size={20} strokeWidth={1.5} />
                  <h2 className="font-editorial text-xl">Size Guide</h2>
                </div>
                <button onClick={onClose} aria-label="Close" className="p-1 text-parchment/50 hover:text-gold transition-colors">
                  <X size={20} />
                </button>
              </div>

              <p className="text-parchment/70 text-sm leading-relaxed mb-5">
                Our tees are cut in an oversized, relaxed fit from S to XXL. Order true-to-size for the
                intended oversized look, or size down for something closer-fitting.
              </p>

              <h3 className="font-condensed tracking-[0.1em] text-xs text-gold mb-2.5">HOW TO FIND YOUR SIZE</h3>
              <ol className="text-parchment/70 text-sm leading-relaxed flex flex-col gap-2.5 list-decimal pl-5 mb-5">
                <li>Grab a tee you already own and love the fit of.</li>
                <li>Lay it flat and measure straight across from armpit to armpit — that's your chest width.</li>
                <li>Measure from the collar seam straight down to the bottom hem — that's the length.</li>
                <li>
                  Compare those two numbers to our product photos and description — since this is an oversized
                  fit, expect it to run a size or so roomier than a fitted tee at the same label size.
                </li>
              </ol>

              <p className="text-parchment/60 text-sm leading-relaxed">
                Between sizes or still not sure? Message us on WhatsApp or Instagram and we'll help you pick.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
