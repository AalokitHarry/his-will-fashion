// A giant flat gold letterform with a radial gold-linework field behind it —
// the recurring graphic device of this design: scripture treated like an
// illuminated manuscript capital, not a delicate quote. Purely decorative.
export default function IlluminatedCapital({ letter = "H", className = "" }) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="gold-radiance absolute inset-0" />
      <span
        className="font-display block leading-[0.8] text-gold"
        style={{ fontSize: "clamp(12rem, 34vw, 32rem)" }}
      >
        {letter}
      </span>
      <span className="absolute top-[8%] left-[4%] w-3 h-3 md:w-4 md:h-4 rounded-full bg-rust" />
    </div>
  );
}
