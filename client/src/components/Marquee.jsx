export default function Marquee({ items, className = "", separator = "✦", separatorClassName = "text-gold/60" }) {
  const content = (
    <div className="flex items-center shrink-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 whitespace-nowrap">{item}</span>
          <span className={`${separatorClassName} text-xs`}>{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee">
        {content}
        {content}
      </div>
    </div>
  );
}
