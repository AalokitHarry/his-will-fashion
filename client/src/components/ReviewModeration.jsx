import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { deleteReview, fetchAllReviews, setReviewApproved } from "../api/reviews";

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={13} fill={i < rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function ReviewModeration() {
  const token = localStorage.getItem("hwf_admin_token") || "";

  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchAllReviews(token)
      .then(setReviews)
      .catch((err) => setError(err.message || "Unable to load reviews."));
  }, []);

  const toggleApproved = async (review) => {
    setBusyId(review.id);
    const prev = reviews;
    setReviews((rs) => rs.map((r) => (r.id === review.id ? { ...r, approved: !r.approved } : r)));
    try {
      await setReviewApproved(token, review.id, !review.approved);
    } catch (err) {
      setReviews(prev);
      setError(err.message || "Unable to update review.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    setBusyId(review.id);
    const prev = reviews;
    setReviews((rs) => rs.filter((r) => r.id !== review.id));
    try {
      await deleteReview(token, review.id);
    } catch (err) {
      setReviews(prev);
      setError(err.message || "Unable to delete review.");
    } finally {
      setBusyId(null);
    }
  };

  if (error && !reviews) {
    return (
      <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!reviews) {
    return <p className="text-parchment/50 text-sm">Loading…</p>;
  }

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      {error && (
        <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-6">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-parchment/50 text-sm mb-6">
        {pending.length} awaiting approval &middot; {approved.length} live on the site
      </p>

      {reviews.length === 0 ? (
        <p className="text-parchment/50 text-sm">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {[...pending, ...approved].map((r) => (
            <div key={r.id} className="bg-charcoal border border-gold/15 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-condensed tracking-wide text-sm text-gold">{r.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={r.rating} />
                    <span className="text-sm font-medium">{r.customerName}</span>
                    {r.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-[10px] font-condensed tracking-wide bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded-md">
                        <ShieldCheck size={10} /> VERIFIED PURCHASE
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-condensed tracking-wide px-2 py-1 rounded-md shrink-0 ${
                    r.approved ? "bg-gold/15 text-gold" : "bg-parchment/10 text-parchment/50"
                  }`}
                >
                  {r.approved ? "LIVE" : "PENDING"}
                </span>
              </div>
              <p className="text-sm text-parchment/70 leading-relaxed mb-3">{r.comment}</p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleApproved(r)}
                  disabled={busyId === r.id}
                  className={`flex items-center gap-1.5 text-xs font-condensed tracking-wide px-3 py-1.5 rounded-md transition-colors disabled:opacity-60 ${
                    r.approved
                      ? "border border-parchment/30 hover:border-rust hover:text-rust"
                      : "bg-gold text-ink hover:bg-gold-soft"
                  }`}
                >
                  {r.approved ? (
                    <>
                      <X size={13} /> UNPUBLISH
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} /> APPROVE
                    </>
                  )}
                </button>
                <button
                  onClick={() => remove(r)}
                  disabled={busyId === r.id}
                  aria-label={`Delete review from ${r.customerName}`}
                  className="p-1.5 text-parchment/40 hover:text-rust transition-colors disabled:opacity-60"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
