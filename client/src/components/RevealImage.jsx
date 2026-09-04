import { motion } from "framer-motion";

// Clip-path wipe reveal for images/photo blocks.
// trigger="scroll" (default) reveals when scrolled into view — use for anything
// below the fold. trigger="mount" reveals immediately, staggered like the rest
// of an above-the-fold layout (e.g. a hero) — scroll-linked triggers are
// unreliable for content that's already at/near the top of the page.
export default function RevealImage({ children, className = "", delay = 0, trigger = "scroll" }) {
  const visible = { clipPath: "inset(0 0 0% 0)" };
  const hidden = { clipPath: "inset(0 0 100% 0)" };
  const outerAnim =
    trigger === "mount"
      ? { initial: hidden, animate: visible }
      : { initial: hidden, whileInView: visible, viewport: { once: true, amount: 0.15 } };
  const innerAnim =
    trigger === "mount"
      ? { initial: { scale: 1.15 }, animate: { scale: 1 } }
      : { initial: { scale: 1.15 }, whileInView: { scale: 1 }, viewport: { once: true, amount: 0.15 } };

  return (
    <motion.div {...outerAnim} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      <motion.div {...innerAnim} transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }} className="w-full h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}
