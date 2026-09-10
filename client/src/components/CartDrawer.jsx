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
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-parchment text-ink z-[70] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
              <h2 className="font-editorial text-2xl">Your Bag ({items.length})</h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-1 hover:text-rust transition-colors">
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-ink/50 px-6 text-center">
                <ShoppingBag size={40} strokeWidth={1.2} />
                <p className="font-body">Your bag is empty. Let's change that.</p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="font-condensed tracking-[0.1em] text-sm text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
                >
                  BROWSE THE COLLECTION
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                    <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0">
                      <ProductImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between gap-2">
                        <p className="font-condensed tracking-wide text-sm leading-tight">{item.name}</p>
                        <button
                          onClick={() => removeItem(item)}
                          className="text-ink/40 hover:text-rust transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-ink/50">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center border border-ink/15 rounded-lg">
                          <button
                            onClick={() => updateQty(item, item.qty - 1)}
                            className="p-1.5 hover:text-gold"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item, item.qty + 1)}
                            className="p-1.5 hover:text-gold"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-medium text-sm">{formatINR(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between font-display text-lg">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <p className="text-xs text-ink/50 -mt-2">Shipping & taxes calculated at checkout.</p>
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
