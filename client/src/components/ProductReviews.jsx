import { useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { submitReview } from "../api/reviews";

function StarRow({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="text-gold"
          >
            <Star size={22} fill={n <= value ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId, reviews }) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!name.trim()) return setSubmitError("Enter your name.");
    if (!rating) return setSubmitError("Pick a star rating.");
    if (comment.trim().length < 10) return setSubmitError("Say a bit more — at least 10 characters.");

    setSubmitting(true);
    try {
      await submitReview(productId, { customerName: name.trim(), email: email.trim(), rating, comment: comment.trim() });
      setSubmitted(true);
      setFormOpen(false);
      setName("");
      setEmail("");
      setRating(0);
      setComment("");
    } catch (err) {
      setSubmitError(err.message || "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const average = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 border-t border-parchment/10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-editorial text-3xl mb-2">Reviews</h2>
          {reviews?.length > 0 ? (
            <div className="flex items-center gap-2.5">
              <StarRow rating={average} size={16} />
              <span className="text-sm text-parchment/60">
                {average.toFixed(1)} out of 5 &middot; {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-parchment/50">No reviews yet — be the first.</p>
          )}
        </div>
        {!formOpen && !submitted && (
          <button
            onClick={() => setFormOpen(true)}
            className="font-condensed tracking-[0.12em] text-xs border border-parchment/30 px-5 py-2.5 rounded-lg hover:border-gold hover:text-gold transition-colors"
          >
            WRITE A REVIEW
          </button>
        )}
      </div>

      {submitted && (
        <div className="flex items-start gap-2.5 bg-gold/10 border border-gold/30 text-gold rounded-lg px-4 py-3 text-sm mb-8 max-w-xl">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>Thanks! Your review is in — it'll appear here once we've had a look.</span>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-charcoal border border-gold/15 rounded-lg p-6 mb-10 max-w-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">YOUR RATING</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">NAME</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">
                EMAIL <span className="text-parchment/35 normal-case tracking-normal">— optional</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For a verified purchase badge"
                className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">YOUR REVIEW</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Fit, fabric, print quality — what should other people know?"
              className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold resize-none"
            />
          </div>
          {submitError && (
            <p className="flex items-center gap-1.5 text-rust text-xs">
              <AlertCircle size={13} className="shrink-0" /> {submitError}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gold text-ink font-condensed tracking-[0.14em] px-6 py-3 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors disabled:opacity-60"
            >
              {submitting ? "SUBMITTING…" : "SUBMIT REVIEW"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="font-condensed tracking-wide text-xs border border-parchment/30 px-5 py-3 rounded-lg hover:border-parchment"
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {reviews?.length > 0 && (
        <div className="flex flex-col gap-6 max-w-3xl">
          {reviews.map((r) => (
            <div key={r.id} className="pb-6 border-b border-parchment/10 last:border-0">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <StarRow rating={r.rating} />
                <span className="text-sm font-medium">{r.customerName}</span>
                {r.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-[10px] font-condensed tracking-wide bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded-md">
                    <ShieldCheck size={10} /> VERIFIED PURCHASE
                  </span>
                )}
              </div>
              <p className="text-sm text-parchment/70 leading-relaxed">{r.comment}</p>
              <p className="text-xs text-parchment/40 mt-1.5">
                {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
