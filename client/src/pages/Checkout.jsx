import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, PackageCheck, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatINR } from "../utils/format";
import { INDIAN_STATES } from "../data/indianStates";
import { placeOrder, validateCoupon } from "../api/orders";
import ProductImage from "../components/ProductImage";
import useSEO from "../hooks/useSEO";

const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_FEE = 99;
const STATE_SET = new Set(INDIAN_STATES);

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Karnataka",
  pincode: "",
  notes: "",
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [pincodeStatus, setPincodeStatus] = useState("idle"); // idle | loading | found | notfound
  const lastLookedUpPincode = useRef("");

  useSEO({ title: "Checkout", path: "/checkout", noindex: true });

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const discount = coupon?.discount || 0;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    const pincode = form.pincode.trim();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus("idle");
      return;
    }
    if (pincode === lastLookedUpPincode.current) return;

    let cancelled = false;
    setPincodeStatus("loading");

    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        lastLookedUpPincode.current = pincode;
        const office = data?.[0]?.Status === "Success" ? data[0].PostOffice?.[0] : null;
        if (office) {
          setForm((f) => ({
            ...f,
            city: office.District || f.city,
            state: STATE_SET.has(office.State) ? office.State : f.state,
          }));
          setPincodeStatus("found");
        } else {
          setPincodeStatus("notfound");
        }
      })
      .catch(() => {
        if (!cancelled) setPincodeStatus("notfound");
      });

    return () => {
      cancelled = true;
    };
  }, [form.pincode]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError("");
    try {
      const result = await validateCoupon(couponInput.trim(), subtotal);
      setCoupon({ code: result.code, discount: result.discount });
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message || "Invalid or expired coupon code.");
    } finally {
      setCouponChecking(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { orderId, total: confirmedTotal, discount: confirmedDiscount } = await placeOrder({
        items: items.map((i) => ({ id: i.id, size: i.size, color: i.color, qty: i.qty })),
        customer: form,
        couponCode: coupon?.code,
      });
      clearCart();
      navigate("/order-confirmed", { state: { orderId, total: confirmedTotal, discount: confirmedDiscount } });
    } catch (err) {
      setError(
        err.message ||
          "Unable to place your order right now. Please make sure the store server is running and try again."
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-32 text-center px-5">
        <ShoppingBag className="mx-auto text-parchment/30 mb-5" size={40} strokeWidth={1.2} />
        <h1 className="font-editorial text-3xl mb-4">Your bag is empty</h1>
        <p className="text-parchment/60 mb-8">Add something to your bag before checking out.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors">
          BROWSE THE COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h1 className="font-editorial text-3xl md:text-4xl mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12">
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-10">
            <section>
              <h2 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">CONTACT</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="fullName" value={form.fullName} onChange={onChange} required />
                <Field label="Phone" name="phone" value={form.phone} onChange={onChange} type="tel" pattern="[0-9]{10}" title="10-digit mobile number" required />
                <Field label="Email" name="email" value={form.email} onChange={onChange} type="email" required className="sm:col-span-2" />
              </div>
            </section>

            <section>
              <h2 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">SHIPPING ADDRESS</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={onChange} required className="sm:col-span-2" />
                <Field label="Address Line 2 (optional)" name="addressLine2" value={form.addressLine2} onChange={onChange} className="sm:col-span-2" />
                <Field label="City" name="city" value={form.city} onChange={onChange} required />
                <div className="flex flex-col gap-1.5">
                  <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">STATE</label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <Field label="Pincode" name="pincode" value={form.pincode} onChange={onChange} pattern="[0-9]{6}" title="6-digit pincode" required>
                  {pincodeStatus === "loading" && (
                    <span className="flex items-center gap-1.5 text-xs text-parchment/50 mt-1.5">
                      <Loader2 size={12} className="animate-spin" /> Detecting city &amp; state…
                    </span>
                  )}
                  {pincodeStatus === "found" && (
                    <span className="flex items-center gap-1.5 text-xs text-gold mt-1.5">
                      <CheckCircle2 size={12} /> City &amp; state filled in — edit if needed
                    </span>
                  )}
                  {pincodeStatus === "notfound" && (
                    <span className="text-xs text-parchment/50 mt-1.5">Couldn't detect location — enter city &amp; state manually.</span>
                  )}
                </Field>
                <Field label="Country" name="country" value="India" onChange={() => {}} disabled />
              </div>
            </section>

            <section>
              <h2 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">ORDER NOTES (OPTIONAL)</h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                placeholder="Delivery instructions, gift note, etc."
                className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold resize-none"
              />
            </section>

            {error && (
              <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-ink font-condensed tracking-[0.15em] py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <PackageCheck size={15} />
              {loading ? "PLACING ORDER..." : `PLACE ORDER — ${formatINR(total)} (CASH ON DELIVERY)`}
            </button>
            <p className="text-xs text-parchment/45 -mt-6 text-center">
              Pay in cash when your order arrives. We'll reach out to confirm before it ships.
            </p>
          </form>

          <aside className="bg-charcoal border border-gold/15 text-parchment rounded-lg p-7 h-fit lg:sticky lg:top-28">
            <h2 className="font-editorial text-xl mb-6">Order Summary</h2>
            <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                  <div className="relative w-14 h-16 rounded-md overflow-hidden shrink-0">
                    <ProductImage src={item.image} alt={item.name} />
                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-parchment/50">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                  </div>
                  <span className="text-sm">{formatINR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mb-5">
              {coupon ? (
                <div className="flex items-center justify-between bg-gold/10 border border-gold/30 rounded-lg px-3.5 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-gold">
                    <CheckCircle2 size={15} /> "{coupon.code}" applied
                  </span>
                  <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="text-parchment/50 hover:text-rust transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 min-w-0 border border-parchment/20 rounded-lg px-3.5 py-2.5 text-sm bg-parchment text-ink focus:outline-none focus:border-gold uppercase placeholder:normal-case"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponChecking || !couponInput.trim()}
                      className="shrink-0 text-xs font-condensed tracking-wide border border-parchment/30 px-4 rounded-lg hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                    >
                      {couponChecking ? "CHECKING…" : "APPLY"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="flex items-center gap-1.5 text-rust text-xs mt-2">
                      <AlertCircle size={13} className="shrink-0" /> {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 text-sm border-t border-parchment/15 pt-5">
              <div className="flex justify-between text-parchment/70">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount</span>
                  <span>&minus;{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-parchment/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gold">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
              <div className="flex justify-between font-display text-lg pt-2 border-t border-parchment/15">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, className = "", children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">{label.toUpperCase()}</label>
      <input
        {...props}
        className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold disabled:opacity-50"
      />
      {children}
    </div>
  );
}
