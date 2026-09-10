// Downscales and re-encodes a photo in the browser before upload — phone
// photos routinely arrive at 3000px+ and 4-8MB, but the site only ever
// displays them at a few hundred px wide, so shrinking to a sane web size
// at high JPEG quality is visually lossless while cutting file size by
// 90%+. Runs entirely client-side; the server's 1MB cap stays as a backstop.

const MAX_DIMENSION = 1600;
const TARGET_BYTES = 900_000;
const MIN_QUALITY = 0.5;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file) {
  if (!file || !file.type.startsWith("image/")) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // Unsupported/corrupt source — let server-side validation catch it.
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // PNGs are re-encoded losslessly (quality doesn't apply), so only step
  // quality down for photographic JPEG/WebP sources.
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  let quality = 0.9;
  let blob = await canvasToBlob(canvas, outputType, quality);
  if (!blob) return file;

  while (blob.size > TARGET_BYTES && quality > MIN_QUALITY && outputType === "image/jpeg") {
    quality -= 0.1;
    const next = await canvasToBlob(canvas, outputType, quality);
    if (!next) break;
    blob = next;
  }

  if (blob.size >= file.size) return file; // Compression didn't help — keep the original.

  const ext = outputType === "image/png" ? "png" : "jpg";
  const name = file.name.replace(/\.\w+$/, "") + `.${ext}`;
  return new File([blob], name, { type: outputType });
}
