import { motion } from "framer-motion";

// Word-by-word "wipe up" reveal.
// trigger="scroll" (default) reveals when scrolled into view — use for anything
// below the fold. trigger="mount" reveals immediately, for above-the-fold text
// (e.g. a hero headline) where whileInView won't reliably fire since the
// element is already in the viewport on load.
// Usage: <RevealText as="h1" className="...">Wear Your Faith.</RevealText>
export default function RevealText({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  once = true,
  trigger = "scroll",
}) {
  const words = String(children).split(" ");
  const triggerProps =
    trigger === "mount"
      ? { initial: { y: "110%" }, animate: { y: "0%" } }
      : { initial: { y: "110%" }, whileInView: { y: "0%" }, viewport: { once, margin: "-10%" } };

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block">
          <span className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
            <motion.span
              className="inline-block"
              {...triggerProps}
              transition={{
                duration: 0.7,
                delay: delay + i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
