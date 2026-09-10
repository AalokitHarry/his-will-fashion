import { useEffect, useState } from "react";
import { AlertCircle, LogOut, RefreshCw } from "lucide-react";
import { fetchOrders, updateOrderStatus } from "../api/orders";
import { formatINR } from "../utils/format";
import useSEO from "../hooks/useSEO";
import AddProductForm from "../components/AddProductForm";
import ProductList from "../components/ProductList";
import NewsletterList from "../components/NewsletterList";
import CouponList from "../components/CouponList";

const TOKEN_KEY = "hwf_admin_token";

const ORDER_STATUSES = ["pending_confirmation", "confirmed", "shipped", "delivered", "cancelled"];
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

export default function AdminOrders() {
  useSEO({ title: "Admin", path: "/admin", noindex: true });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [tab, setTab] = useState("orders");

  const load = async (t) => {
    setLoading(true);
    setError("");
    try {
      const { orders } = await fetchOrders(t);
      setOrders(orders);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } catch {
      setError("Incorrect password.");
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    load(passwordInput);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const prevOrders = orders;
    setUpdatingId(orderId);
    setStatusError("");
    setOrders((os) => os.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o)));
    try {
      await updateOrderStatus(token, orderId, newStatus);
    } catch (err) {
      setOrders(prevOrders);
      setStatusError(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const logOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrders(null);
    setPasswordInput("");
  };

  if (!token || !orders) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="font-editorial text-2xl mb-2">Order Dashboard</h1>
          <input
            type="password"
            autoFocus
            placeholder="Admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
          />
          {error && (
            <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-ink font-condensed tracking-[0.14em] py-3.5 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors disabled:opacity-60"
          >
            {loading ? "CHECKING..." : "VIEW ORDERS"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-editorial text-3xl md:text-4xl">Admin</h1>
            <p className="text-parchment/50 text-sm mt-1">{orders.length} orders</p>
          </div>
          <div className="flex items-center gap-3">
            {tab === "orders" && (
              <button
                onClick={() => load(token)}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-gold transition-colors"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            )}
            <button
              onClick={logOut}
              className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-rust hover:text-rust transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 mb-10 pb-8 border-b border-parchment/10">
          {[
            { key: "orders", label: "Orders" },
            { key: "products", label: "Add Product" },
            { key: "coupons", label: "Coupons" },
            { key: "subscribers", label: "Subscribers" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-condensed tracking-[0.1em] text-xs px-5 py-2.5 rounded-lg border transition-colors ${
                tab === t.key
                  ? "bg-gold text-ink border-gold"
                  : "border-parchment/20 text-parchment/60 hover:border-gold hover:text-parchment"
              }`}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "products" ? (
          <>
            <AddProductForm />
            <ProductList />
          </>
        ) : tab === "coupons" ? (
          <CouponList />
        ) : tab === "subscribers" ? (
          <NewsletterList />
        ) : (
          <>
            {statusError && (
              <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-6">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            {orders.length === 0 ? (
              <p className="text-parchment/50 text-center py-20">No orders yet.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {orders.map((order) => (
                  <div key={order.orderId} className="bg-charcoal border border-gold/15 rounded-lg p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-5 border-b border-parchment/10">
                      <div>
                        <p className="font-condensed tracking-wide text-sm text-gold">{order.orderId}</p>
                        <p className="text-xs text-parchment/50 mt-1">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <select
                        value={order.status}
                        disabled={updatingId === order.orderId}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className={`text-xs font-condensed tracking-wide px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-wait ${
                          STATUS_STYLES[order.status] || STATUS_STYLES.pending_confirmation
                        }`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-ink text-parchment">
                            {STATUS_LABELS[s].toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 mb-5">
                      <div>
                        <p className="font-condensed tracking-[0.1em] text-xs text-parchment/50 mb-2">CUSTOMER</p>
                        <p className="font-medium">{order.customer.fullName}</p>
                        <p className="text-sm text-parchment/70">{order.customer.phone}</p>
                        <p className="text-sm text-parchment/70">{order.customer.email}</p>
                      </div>
                      <div>
                        <p className="font-condensed tracking-[0.1em] text-xs text-parchment/50 mb-2">SHIP TO</p>
                        <p className="text-sm text-parchment/70">
                          {order.customer.addressLine1}
                          {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}
                        </p>
                        <p className="text-sm text-parchment/70">
                          {order.customer.city}, {order.customer.state} {order.customer.pincode}
                        </p>
                        {order.customer.notes && (
                          <p className="text-sm text-parchment/50 italic mt-1">Note: {order.customer.notes}</p>
                        )}
                      </div>
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

                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-gold mb-2 pt-3 border-t border-parchment/10">
                        <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                        <span>&minus;{formatINR(order.discount)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between font-display text-lg ${order.discount > 0 ? "" : "pt-3 border-t border-parchment/10"}`}>
                      <span>Total ({order.paymentMethod.toUpperCase()})</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
