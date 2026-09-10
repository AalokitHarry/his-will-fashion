import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, updateProduct } from "../api/products";
import { useProducts } from "../context/ProductsContext";
import { formatINR } from "../utils/format";
import PhotoInput, { MAX_PHOTO_BYTES } from "./PhotoInput";

const PHOTO_SLOTS = ["photo1", "photo2", "photo3"];

function EditRow({ product, onDone, onCancel }) {
  const { updateProductLocal } = useProducts();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description || "");
  const [replacingPhotos, setReplacingPhotos] = useState(false);
  const [photos, setPhotos] = useState({ photo1: null, photo2: null, photo3: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setPhoto = (key, file) => setPhotos((p) => ({ ...p, [key]: file }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter a product name.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");
    if (replacingPhotos) {
      if (!photos.photo1 || !photos.photo2 || !photos.photo3) {
        return setError("Upload all 3 photos, or turn off photo replacement to keep the existing ones.");
      }
      const tooBig = Object.values(photos).find((f) => f.size > MAX_PHOTO_BYTES);
      if (tooBig) {
        return setError(`"${tooBig.name}" is ${Math.round(tooBig.size / 1024)}KB — please use a photo under 1MB.`);
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("hwf_admin_token") || "";
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      formData.append("description", description.trim());
      if (replacingPhotos) {
        formData.append("photo1", photos.photo1);
        formData.append("photo2", photos.photo2);
        formData.append("photo3", photos.photo3);
      }
      const updated = await updateProduct(token, product.id, formData);
      updateProductLocal(updated);
      onDone();
    } catch (err) {
      setError(err.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 mt-3 pt-3 border-t border-parchment/10">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">NAME</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-parchment/20 rounded-md px-3 py-2 text-sm bg-parchment text-ink focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">PRICE (₹)</label>
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-parchment/20 rounded-md px-3 py-2 text-sm bg-parchment text-ink focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">
          DESCRIPTION <span className="text-parchment/35 normal-case tracking-normal">— optional</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-parchment/20 rounded-md px-3 py-2 text-sm bg-parchment text-ink focus:outline-none focus:border-gold resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-parchment/60 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={replacingPhotos}
          onChange={(e) => setReplacingPhotos(e.target.checked)}
          className="accent-gold"
        />
        Replace all 3 photos
      </label>

      {replacingPhotos && (
        <div className="grid grid-cols-3 gap-4 max-w-md">
          {PHOTO_SLOTS.map((key, i) => (
            <PhotoInput
              key={key}
              label={`Photo ${i + 1}`}
              file={photos[key]}
              onChange={(file) => setPhoto(key, file)}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rust text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          disabled={saving}
          className="text-xs font-condensed tracking-wide bg-gold text-ink px-4 py-2 rounded-md hover:bg-rust hover:text-parchment disabled:opacity-60"
        >
          {saving ? "SAVING…" : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-condensed tracking-wide border border-parchment/30 px-4 py-2 rounded-md hover:border-parchment"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

export default function ProductList() {
  const { products, loading, removeProductLocal } = useProducts();
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [password, setPassword] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);

  const startEdit = (id) => {
    setEditId(id);
    setConfirmId(null);
    setSavedId(null);
  };

  const startConfirm = (id) => {
    setConfirmId(id);
    setEditId(null);
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

                {savedId === p.id && (
                  <span className="flex items-center gap-1.5 text-gold text-xs shrink-0">
                    <CheckCircle2 size={15} /> Saved
                  </span>
                )}

                {editId !== p.id && confirmId !== p.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(p.id)}
                      aria-label={`Edit ${p.name}`}
                      className="p-2 text-parchment/40 hover:text-gold transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => startConfirm(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="p-2 text-parchment/40 hover:text-rust transition-colors"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>

              {editId === p.id && (
                <EditRow
                  product={p}
                  onCancel={() => setEditId(null)}
                  onDone={() => {
                    setEditId(null);
                    setSavedId(p.id);
                    setTimeout(() => setSavedId((id) => (id === p.id ? null : id)), 3000);
                  }}
                />
              )}

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
