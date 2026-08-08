export default function ProductImage({ src, alt, className = "", ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover object-bottom ${className}`}
      {...props}
    />
  );
}
