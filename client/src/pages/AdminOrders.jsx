import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, LogOut, Printer, RefreshCw, Search, ShieldOff } from "lucide-react";
import { fetchOrders, updateOrderStatus } from "../api/orders";
import { adminLogin, adminLogout, adminLogoutAll } from "../api/adminAuth";
import { formatINR } from "../utils/format";
import { useProducts } from "../context/ProductsContext";
import useSEO from "../hooks/useSEO";
import AddProductForm from "../components/AddProductForm";
import ProductList from "../components/ProductList";
import NewsletterList from "../components/NewsletterList";
import CouponList from "../components/CouponList";
import ReviewModeration from "../components/ReviewModeration";

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

// Apparel GST slabs per the GST Council's Sep 2025 rate reform: 5% on a
// piece sold at ₹2,500 or under, 18% above that — based on each item's unit
// price, not the order total. Prices on the site are treated as
// GST-inclusive (standard Indian retail convention), so this backs the tax
// portion out of what was already charged — it's a bookkeeping reference,
// not an additional charge, and not a compliance claim (the store isn't
// GST-registered yet).
const GST_PIECE_THRESHOLD = 2500;

function orderGST(items) {
  return items.reduce((sum, item) => {
    const rate = item.price > GST_PIECE_THRESHOLD ? 0.18 : 0.05;
    return sum + (item.lineTotal * rate) / (1 + rate);
  }, 0);
}

function csvCell(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadOrdersCSV(orders) {
  const headers = [
    "Order ID", "Date", "Status", "Customer Name", "Phone", "Email",
    "Address Line 1", "Address Line 2", "City", "State", "Pincode",
    "Items", "Subtotal", "GST (included)", "Discount", "Coupon Code", "Shipping", "Total", "Payment Method",
  ];
  const rows = orders.map((o) => [
    o.orderId,
    new Date(o.createdAt).toLocaleString("en-IN"),
    STATUS_LABELS[o.status] || o.status,
    o.customer.fullName,
    o.customer.phone,
    o.customer.email,
    o.customer.addressLine1,
    o.customer.addressLine2 || "",
    o.customer.city,
    o.customer.state,
    o.customer.pincode,
    o.items.map((i) => `${i.qty}x ${i.name}${i.size || i.color ? ` (${[i.color, i.size].filter(Boolean).join("/")})` : ""}`).join("; "),
    o.subtotal,
    Math.round(orderGST(o.items)),
    o.discount,
    o.couponCode || "",
    o.shipping,
    o.total,
    o.paymentMethod.toUpperCase(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `his-will-fashion-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [printOrder, setPrintOrder] = useState(null);
  const { products } = useProducts();

  // Loads orders using an existing session token — used on page load (with
  // whatever's saved in localStorage) and after a fresh login.
  const loadOrders = async (sessionToken) => {
    setLoading(true);
    setError("");
    try {
      const { orders } = await fetchOrders(sessionToken);
      setOrders(orders);
      localStorage.setItem(TOKEN_KEY, sessionToken);
      setToken(sessionToken);
    } catch {
      setError("Your session has expired — please log in again.");
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exchanges the typed password for a session token — the password itself
  // is never stored or sent again after this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const sessionToken = await adminLogin(passwordInput);
      await loadOrders(sessionToken);
    } catch (err) {
      setError(err.message || "Incorrect password.");
      setLoading(false);
    }
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

  const logOut = async () => {
    await adminLogout(token);
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrders(null);
    setPasswordInput("");
  };

  const logOutEverywhere = async () => {
    if (!window.confirm("Log out every device signed into this admin account?")) return;
    try {
      await adminLogoutAll(token);
    } catch (err) {
      setStatusError(err.message || "Unable to log out all devices.");
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrders(null);
    setPasswordInput("");
  };

  useEffect(() => {
    if (!printOrder) return;
    const t = setTimeout(() => window.print(), 50);
    return () => clearTimeout(t);
  }, [printOrder]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customer.fullName?.toLowerCase().includes(q) ||
          o.customer.phone?.includes(q) ||
          o.customer.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const stats = useMemo(() => {
    if (!orders) return null;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    let monthRevenue = 0;
    let monthOrders = 0;
    let pending = 0;
    const unitsSold = {};

    for (const order of orders) {
      if (order.status === "pending_confirmation") pending += 1;
      if (order.status === "cancelled") continue;

      if (new Date(order.createdAt) >= monthStart) {
        monthRevenue += order.total;
        monthOrders += 1;
      }
      for (const item of order.items) {
        unitsSold[item.name] = (unitsSold[item.name] || 0) + item.qty;
      }
    }

    const [bestSellerName, bestSellerUnits] =
      Object.entries(unitsSold).sort((a, b) => b[1] - a[1])[0] || [null, 0];

    const lowStock = products.filter((p) => p.stock !== null && p.stock !== undefined && p.stock <= 5).length;

    return { monthRevenue, monthOrders, pending, bestSellerName, bestSellerUnits, lowStock };
  }, [orders, products]);

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
    <>
    <div className="pt-28 pb-24 min-h-screen print:hidden">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-editorial text-3xl md:text-4xl">Admin</h1>
            <p className="text-parchment/50 text-sm mt-1">{orders.length} orders</p>
          </div>
          <div className="flex items-center gap-3">
            {tab === "orders" && (
              <>
                <button
                  onClick={() => downloadOrdersCSV(filteredOrders)}
                  disabled={filteredOrders.length === 0}
                  className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => loadOrders(token)}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-gold transition-colors"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
              </>
            )}
            <button
              onClick={logOutEverywhere}
              title="Log out every device signed into this admin account"
              className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-rust hover:text-rust transition-colors"
            >
              <ShieldOff size={14} /> Log out everywhere
            </button>
            <button
              onClick={logOut}
              className="flex items-center gap-1.5 text-sm border border-parchment/30 px-4 py-2 hover:border-rust hover:text-rust transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>

        {tab === "orders" && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            <div className="bg-charcoal border border-gold/15 rounded-lg p-4">
              <p className="font-condensed tracking-[0.08em] text-[10px] text-parchment/50 mb-1.5">REVENUE THIS MONTH</p>
              <p className="font-display text-xl text-gold">{formatINR(stats.monthRevenue)}</p>
            </div>
            <div className="bg-charcoal border border-gold/15 rounded-lg p-4">
              <p className="font-condensed tracking-[0.08em] text-[10px] text-parchment/50 mb-1.5">ORDERS THIS MONTH</p>
              <p className="font-display text-xl">{stats.monthOrders}</p>
            </div>
            <button
              onClick={() => setStatusFilter("pending_confirmation")}
              className="bg-charcoal border border-gold/15 rounded-lg p-4 text-left hover:border-gold/40 transition-colors"
            >
              <p className="font-condensed tracking-[0.08em] text-[10px] text-parchment/50 mb-1.5">NEEDS CONFIRMATION</p>
              <p className={`font-display text-xl ${stats.pending > 0 ? "text-rust" : ""}`}>{stats.pending}</p>
            </button>
            <button
              onClick={() => setTab("products")}
              className="bg-charcoal border border-gold/15 rounded-lg p-4 text-left hover:border-gold/40 transition-colors"
            >
              <p className="font-condensed tracking-[0.08em] text-[10px] text-parchment/50 mb-1.5">LOW / OUT OF STOCK</p>
              <p className={`font-display text-xl ${stats.lowStock > 0 ? "text-rust" : ""}`}>{stats.lowStock}</p>
            </button>
            <div className="bg-charcoal border border-gold/15 rounded-lg p-4">
              <p className="font-condensed tracking-[0.08em] text-[10px] text-parchment/50 mb-1.5">BEST SELLER</p>
              {stats.bestSellerName ? (
                <p className="font-display text-base leading-tight truncate" title={stats.bestSellerName}>
                  {stats.bestSellerName} <span className="text-parchment/50 text-sm">&times;{stats.bestSellerUnits}</span>
                </p>
              ) : (
                <p className="text-parchment/40 text-sm">—</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2.5 mb-10 pb-8 border-b border-parchment/10">
          {[
            { key: "orders", label: "Orders" },
            { key: "products", label: "Add Product" },
            { key: "coupons", label: "Coupons" },
            { key: "reviews", label: "Reviews" },
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
        ) : tab === "reviews" ? (
          <ReviewModeration />
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
              <>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search order ID, name, phone, email…"
                      className="w-full border border-parchment/20 rounded-lg pl-9 pr-3.5 py-2.5 text-sm bg-parchment text-ink focus:outline-none focus:border-gold"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border border-parchment/20 rounded-lg px-3.5 py-2.5 bg-parchment text-ink focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  {(search || statusFilter !== "all") && (
                    <span className="text-xs text-parchment/50">
                      Showing {filteredOrders.length} of {orders.length}
                    </span>
                  )}
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-parchment/50 text-center py-20">No orders match your search.</p>
                ) : (
              <div className="flex flex-col gap-5">
                {filteredOrders.map((order) => (
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPrintOrder(order)}
                          aria-label={`Print packing slip for ${order.orderId}`}
                          className="p-1.5 text-parchment/50 hover:text-gold transition-colors"
                        >
                          <Printer size={16} />
                        </button>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
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

                    <div className="flex justify-between text-xs text-parchment/45 mb-2 pt-3 border-t border-parchment/10">
                      <span>GST (5%/18% slabs, included in price)</span>
                      <span>{formatINR(orderGST(order.items))}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-gold mb-2">
                        <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                        <span>&minus;{formatINR(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-display text-lg">
                      <span>Total ({order.paymentMethod.toUpperCase()})</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>

    {printOrder && (
      <div className="hidden print:block relative p-10 text-black bg-white font-sans" style={{ minHeight: "250mm" }}>
        <span
          aria-hidden="true"
          className="absolute font-display font-bold text-gold pointer-events-none select-none"
          style={{
            fontSize: "300px",
            lineHeight: 0.8,
            opacity: 0.07,
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "60px",
            zIndex: 0,
          }}
        >
          H
        </span>

        <div className="relative z-10">
        <div className="flex items-center justify-between pb-5 mb-7 border-b-2 border-gold">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded bg-ink text-parchment flex items-center justify-center font-bold text-lg shrink-0">H</span>
            <div>
              <p className="text-lg font-bold leading-tight">His Will Fashion</p>
              <p className="text-xs text-gray-500 leading-tight">hiswillfashion.com</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.15em] text-gray-500 font-semibold">PACKING SLIP</p>
            <p className="text-sm font-semibold mt-1">{printOrder.orderId}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8 text-sm gap-8">
          <div>
            <p className="text-xs tracking-[0.15em] text-gray-500 font-semibold mb-2">SHIP TO</p>
            <p className="font-semibold">{printOrder.customer.fullName}</p>
            <p>
              {printOrder.customer.addressLine1}
              {printOrder.customer.addressLine2 ? `, ${printOrder.customer.addressLine2}` : ""}
            </p>
            <p>
              {printOrder.customer.city}, {printOrder.customer.state} {printOrder.customer.pincode}
            </p>
            <p className="mt-1">{printOrder.customer.phone}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs tracking-[0.15em] text-gray-500 font-semibold mb-2">ORDER DETAILS</p>
            <p><span className="text-gray-500">Date</span>&nbsp;&nbsp;{new Date(printOrder.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
            <p><span className="text-gray-500">Payment</span>&nbsp;&nbsp;{printOrder.paymentMethod === "cod" ? "Cash on Delivery" : printOrder.paymentMethod.toUpperCase()}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {printOrder.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2.5">
                  {item.name}
                  {item.size || item.color ? (
                    <span className="text-gray-500"> ({[item.color, item.size].filter(Boolean).join(" / ")})</span>
                  ) : (
                    ""
                  )}
                </td>
                <td className="text-center py-2.5">{item.qty}</td>
                <td className="text-right py-2.5">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <div className="w-64 text-sm flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatINR(printOrder.subtotal)}</span>
            </div>
            {printOrder.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount{printOrder.couponCode ? ` (${printOrder.couponCode})` : ""}</span>
                <span>&minus;{formatINR(printOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{printOrder.shipping === 0 ? "Free" : formatINR(printOrder.shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 mt-1 font-bold text-base border-t-2 border-ink">
              <span>Total ({printOrder.paymentMethod.toUpperCase()})</span>
              <span>{formatINR(printOrder.total)}</span>
            </div>
          </div>
        </div>

        {printOrder.customer.notes && (
          <p className="mt-6 text-sm">
            <span className="text-gray-500">Note:</span> {printOrder.customer.notes}
          </p>
        )}

        <div className="mt-10 pt-4 border-t border-gold/30 text-xs text-gray-500">
          <div className="flex justify-between items-center gap-4">
            <span>Thank you for wearing your faith with us.</span>
            <span className="shrink-0">hello@hiswillfashion.com &middot; @his_wll_fashion_club</span>
          </div>
          <p className="mt-4 text-center italic text-gray-400 tracking-wide">"Wear your faith. Live His will."</p>
        </div>
        </div>
      </div>
    )}
    </>
  );
}
