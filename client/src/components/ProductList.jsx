import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Trash2 } from "lucide-react";
import { deleteProduct } from "../api/products";
import { useProducts } from "../context/ProductsContext";
import { formatINR } from "../utils/format";

export default function ProductList() {
  const { products, loading, removeProductLocal } = useProducts();
  const [confirmId, setConfirmId] = useState(null);
  const [password, setPassword] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const startConfirm = (id) => {
    setConfirmId(id);
    setPassword("");
    setError("");
  };

  const cancelConfirm = () => {
    setConfirmId(null);
    setPassword("");
    setError("");
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!password) return setError("Enter the admin password to confirm.");

    setDeletingId(id);
    setError("");
    try {
      // Re-verified against the real password server-side (the delete
      // endpoint rejects anything that isn't the actual ADMIN_TOKEN) —
      // this is a real re-auth, not just a client-side check.
      await deleteProduct(password, id);
      removeProductLocal(id);
      setConfirmId(null);
      setPassword("");
    } catch (err) {
      setError(err.message === "Unauthorized" ? "Incorrect password." : err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-parchment/50 text-sm">Loading products…</p>;
  }

  return (
    <div className="mt-12 pt-10 border-t border-parchment/10">
      <h2 className="font-editorial text-2xl mb-1">Your Products</h2>
      <p className="text-parchment/50 text-sm mb-6">{products.length} total</p>

      {products.length === 0 ? (
        <p className="text-parchment/50 text-sm">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-charcoal border border-gold/15 rounded-lg p-3">
              <div className="flex items-center gap-4">
                <img src={p.image} alt={p.name} className="w-14 h-16 object-cover rounded-md shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p.id}`} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors truncate block">
                    {p.name}
                  </Link>
                  <p className="text-sm text-parchment/60">{formatINR(p.price)}</p>
                </div>

                {confirmId !== p.id && (
                  <button
                    onClick={() => startConfirm(p.id)}
                    aria-label={`Delete ${p.name}`}
                    className="shrink-0 p-2 text-parchment/40 hover:text-rust transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>

              {confirmId === p.id && (
                <form onSubmit={(e) => handleDelete(e, p.id)} className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-parchment/10">
                  <span className="text-xs text-parchment/60 shrink-0">Delete "{p.name}" — confirm with the admin password:</span>
                  <input
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                    className="border border-parchment/20 rounded-md px-2.5 py-1.5 text-sm bg-parchment text-ink focus:outline-none focus:border-rust w-40"
                  />
                  <button
                    type="submit"
                    disabled={deletingId === p.id}
                    className="text-xs font-condensed tracking-wide bg-rust text-parchment px-3 py-1.5 rounded-md hover:bg-rust-soft disabled:opacity-60"
                  >
                    {deletingId === p.id ? "DELETING…" : "CONFIRM DELETE"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelConfirm}
                    className="text-xs font-condensed tracking-wide border border-parchment/30 px-3 py-1.5 rounded-md hover:border-parchment"
                  >
                    CANCEL
                  </button>
                  {error && (
                    <div className="flex items-center gap-1.5 text-rust text-xs w-full">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
