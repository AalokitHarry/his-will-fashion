import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { fetchSubscribers } from "../api/newsletter";

export default function NewsletterList() {
  const [subscribers, setSubscribers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hwf_admin_token") || "";
    fetchSubscribers(token)
      .then(setSubscribers)
      .catch((err) => setError(err.message || "Unable to load subscribers."));
  }, []);

  if (error) {
    return (
      <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!subscribers) {
    return <p className="text-parchment/50 text-sm">Loading…</p>;
  }

  return (
    <div>
      <p className="text-parchment/50 text-sm mb-6">{subscribers.length} subscribers</p>
      {subscribers.length === 0 ? (
        <p className="text-parchment/50 text-sm">No one's subscribed yet.</p>
      ) : (
        <div className="flex flex-col gap-2 max-w-xl">
          {subscribers.map((s) => (
            <div key={s.email} className="flex items-center justify-between bg-charcoal border border-gold/15 rounded-lg px-4 py-3">
              <span className="text-sm">{s.email}</span>
              <span className="text-xs text-parchment/50">
                {new Date(s.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
