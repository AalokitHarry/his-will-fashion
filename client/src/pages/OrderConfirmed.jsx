import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, CheckCircle2 } from "lucide-react";
import { formatINR } from "../utils/format";
import useSEO from "../hooks/useSEO";

export default function OrderConfirmed() {
  const { state } = useLocation();

  useSEO({ title: "Order Confirmed", path: "/order-confirmed", noindex: true });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/15 text-gold mb-6"
        >
          <CheckCircle2 size={34} strokeWidth={1.6} />
        </motion.div>
        <h1 className="font-editorial text-4xl mb-3">Order Placed</h1>
        <p className="text-parchment/60 mb-8">
          Thank you for wearing your faith with us. We've received your order and will reach out by phone
          or email to confirm before it ships, Pan India. Pay in cash when it arrives.
        </p>

        {state?.orderId && (
          <div className="bg-charcoal border border-gold/15 text-parchment rounded-lg p-6 mb-8 flex flex-col gap-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-parchment/60">Order Reference</span>
              <span className="font-condensed tracking-wide">{state.orderId}</span>
            </div>
            {state?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">Discount Applied</span>
                <span className="font-condensed tracking-wide text-gold">&minus;{formatINR(state.discount)}</span>
              </div>
            )}
            {state?.total != null && (
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">Amount Due (Cash on Delivery)</span>
                <span className="font-condensed tracking-wide">{formatINR(state.total)}</span>
              </div>
            )}
            <Link
              to={`/track-order?orderId=${encodeURIComponent(state.orderId)}`}
              className="text-xs font-condensed tracking-[0.1em] text-gold hover:underline mt-1"
            >
              TRACK THIS ORDER
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200"
          >
            CONTINUE SHOPPING
          </Link>
          <a
            href="https://www.instagram.com/his_wll_fashion_club"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-parchment/30 rounded-lg font-condensed tracking-[0.14em] px-8 py-4 hover:border-rust hover:text-rust transition-colors duration-300"
          >
            <Camera size={16} /> FOLLOW ALONG
          </a>
        </div>
      </motion.div>
    </div>
  );
}
