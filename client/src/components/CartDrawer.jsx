import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatINR } from "../utils/format";
import ProductImage from "./ProductImage";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-ink/60 z-[60]"
          />
          <motion.aside
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 md:right-8 sm:w-[400px] max-h-[75vh] z-[70] flex flex-col rounded-xl border border-gold/15 bg-charcoal shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-parchment/10 shrink-0">
              <h2 className="font-editorial text-xl text-parchment">Your Bag ({items.length})</h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-1 text-parchment/50 hover:text-rust transition-colors">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 text-parchment/50 px-6 py-14 text-center">
                <ShoppingBag size={36} strokeWidth={1.2} />
                <p className="font-body text-sm">Your bag is empty. Let's change that.</p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="font-condensed tracking-[0.1em] text-sm text-parchment border-b border-gold pb-0.5 hover:text-gold transition-colors"
                >
                  BROWSE THE COLLECTION
                </Link>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3.5">
                    <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-ink">
                      <ProductImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-condensed tracking-wide text-sm leading-tight text-parchment truncate">{item.name}</p>
                        <button
                          onClick={() => removeItem(item)}
                          className="text-parchment/40 hover:text-rust transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-parchment/50">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center border border-parchment/15 rounded-lg">
                          <button
                            onClick={() => updateQty(item, item.qty - 1)}
                            className="p-1.5 text-parchment/70 hover:text-gold"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs w-5 text-center text-parchment">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item, item.qty + 1)}
                            className="p-1.5 text-parchment/70 hover:text-gold"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-medium text-sm text-parchment">{formatINR(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-parchment/10 px-5 py-4 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between font-display text-lg text-parchment">
                  <span>Subtotal</span>
                  <span className="text-gold">{formatINR(subtotal)}</span>
                </div>
                <p className="text-xs text-parchment/45 -mt-1.5">Shipping & taxes calculated at checkout.</p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full bg-gold text-ink font-condensed tracking-[0.15em] text-center py-3.5 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200"
                >
                  PROCEED TO CHECKOUT
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
