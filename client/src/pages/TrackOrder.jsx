import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, PackageSearch } from "lucide-react";
import { trackOrder } from "../api/orders";
import { formatINR } from "../utils/format";
import useSEO from "../hooks/useSEO";

const STATUS_LABELS = {
  pending_confirmation: "Pending Confirmation",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_STYLES = {
  pending_confirmation: "bg-parchment/10 text-parchment",
  confirmed: "bg-gold/15 text-gold border border-gold/30",
  shipped: "bg-gold/25 text-gold border border-gold/40",
  delivered: "bg-gold text-ink",
  cancelled: "bg-rust/15 text-rust border border-rust/30",
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useSEO({
    title: "Track Your Order",
    description: "Check the status of your His Will Fashion order.",
    path: "/track-order",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!orderId.trim() || !phone.trim()) {
      return setError("Enter both your order reference and phone number.");
    }
    setLoading(true);
    try {
      setOrder(await trackOrder(orderId.trim(), phone.trim()));
    } catch (err) {
      setError(err.message || "Unable to find that order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="flex items-center gap-3 mb-3">
          <PackageSearch className="text-gold" size={26} strokeWidth={1.5} />
          <h1 className="font-editorial text-3xl md:text-4xl">Track Your Order</h1>
        </div>
        <p className="text-parchment/60 mb-10">Enter your order reference and the phone number you checked out with.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-8">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order reference (e.g. HWF-XXXXX-XXXX)"
            className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-ink font-condensed tracking-[0.14em] px-6 py-3 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors disabled:opacity-60"
          >
            {loading ? "SEARCHING…" : "TRACK"}
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-8">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="bg-charcoal border border-gold/15 rounded-lg p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-5 border-b border-parchment/10">
              <div>
                <p className="font-condensed tracking-wide text-sm text-gold">{order.orderId}</p>
                <p className="text-xs text-parchment/50 mt-1">
                  {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <span className={`text-xs font-condensed tracking-wide px-3 py-1.5 rounded-lg ${STATUS_STYLES[order.status] || STATUS_STYLES.pending_confirmation}`}>
                {(STATUS_LABELS[order.status] || order.status).toUpperCase()}
              </span>
            </div>

            <div className="mb-5">
              <p className="font-condensed tracking-[0.1em] text-xs text-parchment/50 mb-2">SHIPPING TO</p>
              <p className="text-sm text-parchment/70">
                {order.customer.addressLine1}
                {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}
              </p>
              <p className="text-sm text-parchment/70">
                {order.customer.city}, {order.customer.state} {order.customer.pincode}
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.qty} &times; {item.name}
                    {(item.size || item.color) && (
                      <span className="text-parchment/50"> ({[item.color, item.size].filter(Boolean).join(" / ")})</span>
                    )}
                  </span>
                  <span className="text-parchment/60">{formatINR(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-display text-lg pt-3 border-t border-parchment/10">
              <span>Total ({order.paymentMethod.toUpperCase()})</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
