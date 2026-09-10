import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Trash2 } from "lucide-react";
import { deleteProduct } from "../api/products";
import { useProducts } from "../context/ProductsContext";
import { formatINR } from "../utils/format";

export default function ProductList() {
  const { products, loading, removeProductLocal } = useProducts();
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      const token = localStorage.getItem("hwf_admin_token") || "";
      await deleteProduct(token, id);
      removeProductLocal(id);
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (loading) {
    return <p className="text-parchment/50 text-sm">Loading products…</p>;
  }

  return (
    <div className="mt-12 pt-10 border-t border-parchment/10">
      <h2 className="font-editorial text-2xl mb-1">Your Products</h2>
      <p className="text-parchment/50 text-sm mb-6">{products.length} total</p>

      {error && (
        <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-5">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-parchment/50 text-sm">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 bg-charcoal border border-gold/15 rounded-lg p-3"
            >
              <img src={p.image} alt={p.name} className="w-14 h-16 object-cover rounded-md shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${p.id}`} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors truncate block">
                  {p.name}
                </Link>
                <p className="text-sm text-parchment/60">{formatINR(p.price)}</p>
              </div>

              {confirmId === p.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-parchment/60">Delete "{p.name}"?</span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-xs font-condensed tracking-wide bg-rust text-parchment px-3 py-1.5 rounded-md hover:bg-rust-soft disabled:opacity-60"
                  >
                    {deletingId === p.id ? "DELETING…" : "YES, DELETE"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs font-condensed tracking-wide border border-parchment/30 px-3 py-1.5 rounded-md hover:border-parchment"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="shrink-0 p-2 text-parchment/40 hover:text-rust transition-colors"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
