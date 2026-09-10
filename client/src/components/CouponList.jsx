import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { createCoupon, deleteCoupon, fetchCoupons, setCouponActive } from "../api/coupons";
import { formatINR } from "../utils/format";

export default function CouponList() {
  const token = localStorage.getItem("hwf_admin_token") || "";

  const [coupons, setCoupons] = useState(null);
  const [listError, setListError] = useState("");

  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    fetchCoupons(token)
      .then(setCoupons)
      .catch((err) => setListError(err.message || "Unable to load coupons."));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!code.trim()) return setFormError("Enter a coupon code.");
    if (!value || Number(value) <= 0) return setFormError("Enter a value greater than 0.");
    if (type === "percent" && Number(value) > 100) return setFormError("Percent can't be more than 100.");

    setCreating(true);
    try {
      const coupon = await createCoupon(token, { code: code.trim(), type, value: Number(value) });
      setCoupons((prev) => [coupon, ...(prev || [])]);
      setCode("");
      setValue("");
    } catch (err) {
      setFormError(err.message || "Unable to create coupon.");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (c) => {
    setCoupons((prev) => prev.map((x) => (x.code === c.code ? { ...x, active: !x.active } : x)));
    try {
      await setCouponActive(token, c.code, !c.active);
    } catch {
      setCoupons((prev) => prev.map((x) => (x.code === c.code ? { ...x, active: c.active } : x)));
    }
  };

  const remove = async (c) => {
    const prev = coupons;
    setCoupons((cs) => cs.filter((x) => x.code !== c.code));
    try {
      await deleteCoupon(token, c.code);
    } catch {
      setCoupons(prev);
    }
  };

  return (
    <div>
      <div className="max-w-xl mb-10">
        {formError && (
          <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">CODE</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="FAITH20"
              className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold uppercase placeholder:normal-case w-36"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">TYPE</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
            >
              <option value="percent">% off</option>
              <option value="flat">₹ off</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">VALUE</label>
            <input
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "20" : "200"}
              className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold w-28"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-gold text-ink font-condensed tracking-[0.14em] px-6 py-3 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors disabled:opacity-60"
          >
            {creating ? "ADDING…" : "ADD CODE"}
          </button>
        </form>
      </div>

      {listError && (
        <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{listError}</span>
        </div>
      )}

      {!coupons ? (
        <p className="text-parchment/50 text-sm">Loading…</p>
      ) : coupons.length === 0 ? (
        <p className="text-parchment/50 text-sm">No coupon codes yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5 max-w-xl">
          {coupons.map((c) => (
            <div key={c.code} className="flex flex-col gap-1 bg-charcoal border border-gold/15 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-condensed tracking-wide text-sm text-gold">{c.code}</span>
                  <span className="text-sm text-parchment/60">
                    {c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}
                  </span>
                  {!c.active && (
                    <span className="text-[10px] font-condensed tracking-wide bg-parchment/10 text-parchment/50 px-2 py-0.5 rounded-md">
                      INACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`flex items-center gap-1.5 text-xs font-condensed tracking-wide ${
                      c.active ? "text-gold hover:text-parchment" : "text-parchment/50 hover:text-gold"
                    } transition-colors`}
                  >
                    <CheckCircle2 size={14} /> {c.active ? "ACTIVE" : "ACTIVATE"}
                  </button>
                  <button
                    onClick={() => remove(c)}
                    aria-label={`Delete ${c.code}`}
                    className="p-1.5 text-parchment/40 hover:text-rust transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-parchment/40">
                {c.uses > 0
                  ? `Used ${c.uses} time${c.uses === 1 ? "" : "s"} · ${formatINR(c.totalDiscount)} given away`
                  : "Not used yet"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
