import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

export const MAX_PHOTO_BYTES = 1_000_000;

export default function PhotoInput({ label, hint, file, onChange, existingSrc }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || existingSrc;

  return (
    <label className="flex flex-col gap-2 cursor-pointer">
      <span className="font-condensed tracking-[0.08em] text-xs text-parchment/60">
        {label.toUpperCase()}
        {hint && <span className="text-parchment/35 normal-case tracking-normal"> — {hint}</span>}
      </span>
      <div className="relative aspect-[4/5] rounded-lg border border-dashed border-parchment/25 bg-charcoal overflow-hidden flex items-center justify-center hover:border-gold transition-colors">
        {shown ? (
          <img src={shown} alt="" className="w-full h-full object-cover" />
        ) : (
          <Upload size={22} className="text-parchment/30" />
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}
