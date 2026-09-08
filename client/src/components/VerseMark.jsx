import { motion } from "framer-motion";

// The signature registration-pass reveal: an ink keyline draws first, the
// gold field floods in behind it, and the red rubrication mark (the verse
// itself) lands last on top — like a woodblock print pulling into
// registration, rather than a soft opacity fade.
export default function VerseMark({ children, className = "", trigger = "scroll" }) {
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.16 } } };
  const keyline = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };
  const field = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };
  const mark = {
    hidden: { opacity: 0, y: 3 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const viewportProps =
    trigger === "mount"
      ? { initial: "visible", animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-10%" } };

  return (
    <motion.span
      variants={container}
      {...viewportProps}
      className={`relative inline-flex overflow-hidden rounded-md ${className}`}
    >
      <motion.span variants={keyline} className="absolute inset-0 border border-parchment/30 origin-left" />
      <motion.span variants={field} className="absolute inset-0 bg-gold" />
      <motion.span
        variants={mark}
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1 font-condensed text-xs text-ink"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rust shrink-0" />
        {children}
      </motion.span>
    </motion.span>
  );
}
