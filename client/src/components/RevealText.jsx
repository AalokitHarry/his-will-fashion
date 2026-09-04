import { motion } from "framer-motion";

// Word-by-word "wipe up" reveal, staggered on scroll into view.
// Usage: <RevealText as="h1" className="...">Wear Your Faith.</RevealText>
export default function RevealText({ children, as: Tag = "div", className = "", delay = 0, once = true }) {
  const words = String(children).split(" ");

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once, margin: "-10%" }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
