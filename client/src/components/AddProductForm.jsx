import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createProduct } from "../api/products";
import { useProducts } from "../context/ProductsContext";
import { formatINR } from "../utils/format";
import PhotoInput, { MAX_PHOTO_BYTES } from "./PhotoInput";

const PHOTO_SLOTS = [
  { key: "photo1", label: "Photo 1 — On model", hint: "Shown first on the site" },
  { key: "photo2", label: "Photo 2", hint: "Compressed automatically" },
  { key: "photo3", label: "Photo 3", hint: "" },
];

export default function AddProductForm() {
  const { addProductLocal } = useProducts();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [verse, setVerse] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState({ photo1: null, photo2: null, photo3: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const setPhoto = (key, file) => setPhotos((p) => ({ ...p, [key]: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);

    if (!name.trim()) return setError("Enter a product name.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");
    if (stock !== "" && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      return setError("Stock must be a whole number (0 or more), or left blank for unlimited.");
    }
    if (!photos.photo1 || !photos.photo2 || !photos.photo3) return setError("All 3 photos are required.");
    const tooBig = Object.values(photos).find((f) => f.size > MAX_PHOTO_BYTES);
    if (tooBig) {
      return setError(`"${tooBig.name}" is ${Math.round(tooBig.size / 1024)}KB — please use a photo under 1MB.`);
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("hwf_admin_token") || "";
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("verse", verse.trim());
      formData.append("description", description.trim());
      formData.append("photo1", photos.photo1);
      formData.append("photo2", photos.photo2);
      formData.append("photo3", photos.photo3);

      const product = await createProduct(token, formData);
      addProductLocal(product);
      setCreated(product);
      setName("");
      setPrice("");
      setStock("");
      setVerse("");
      setDescription("");
      setPhotos({ photo1: null, photo2: null, photo3: null });
    } catch (err) {
      setError(err.message || "Unable to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      {created && (
        <div className="flex items-start gap-2.5 bg-gold/10 border border-gold/30 text-gold rounded-lg px-4 py-3 text-sm mb-6">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>
            Added "{created.name}" at {formatINR(created.price)}.{" "}
            <Link to={`/product/${created.id}`} target="_blank" rel="noreferrer" className="underline hover:text-parchment">
              View it live
            </Link>
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 bg-rust/10 border border-rust/30 text-rust rounded-lg px-4 py-3 text-sm mb-6">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Faithful Servant Tee"
              className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">PRICE (₹)</label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1299"
              className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">
              STOCK <span className="text-parchment/35 normal-case tracking-normal">— optional, blank = unlimited</span>
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 25"
              className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">
              VERSE REFERENCE <span className="text-parchment/35 normal-case tracking-normal">— optional</span>
            </label>
            <input
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="e.g. Revelation 5:5"
              className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
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
            placeholder="Fabric, print details, fit — whatever's worth knowing before buying."
            className="w-full border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PHOTO_SLOTS.map((slot) => (
            <PhotoInput
              key={slot.key}
              label={slot.label}
              hint={slot.hint}
              file={photos[slot.key]}
              onChange={(file) => setPhoto(slot.key, file)}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-gold text-ink font-condensed tracking-[0.14em] py-3.5 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "ADDING PRODUCT…" : "ADD PRODUCT"}
        </button>
        <p className="text-xs text-parchment/40 -mt-2">
          Sizes default to S–XXL and the product tags as "New" — edit those in code later if needed.
        </p>
      </form>
    </div>
  );
}
