import { motion } from "framer-motion";

// Fade + settle reveal for images/photo blocks.
// trigger="scroll" (default) reveals when scrolled into view — use for anything
// below the fold. trigger="mount" reveals immediately, staggered like the rest
// of an above-the-fold layout (e.g. a hero).
export default function RevealImage({ children, className = "", delay = 0, trigger = "scroll" }) {
  const hidden = { opacity: 0, scale: 1.06, y: 20 };
  const visible = { opacity: 1, scale: 1, y: 0 };
  const triggerProps =
    trigger === "mount"
      ? { initial: hidden, animate: visible }
      : { initial: hidden, whileInView: visible, viewport: { once: true, amount: 0.1 } };

  return (
    <motion.div
      {...triggerProps}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
