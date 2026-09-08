import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { pathname } = useLocation();

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;
  // The home hero sits on a light background, so the floating navbar needs
  // dark text there; once it goes solid (scrolled, or any other page) it's
  // back to the usual dark bar with light text.
  const tone = transparent
    ? { text: "text-ink", sub: "text-ink/70 hover:text-rust", active: "text-rust", icon: "text-ink hover:text-rust" }
    : { text: "text-parchment", sub: "text-parchment/85 hover:text-rust-soft", active: "text-rust-soft", icon: "text-parchment hover:text-rust-soft" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        transparent ? "bg-transparent" : "bg-ink/95 backdrop-blur-md border-b border-gold/20"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between h-18 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-full border border-gold flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink transition-colors duration-300">
            <span className="font-display text-xl leading-none translate-y-[-1px]">†</span>
          </span>
          <span className={`font-condensed tracking-[0.15em] text-lg transition-colors duration-500 ${tone.text}`}>
            HIS WILL <span className="text-gold">FASHION</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-condensed tracking-[0.1em] text-sm transition-colors relative py-1 ${
                  isActive ? tone.active : tone.sub
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${tone.icon}`}
          >
            <ShoppingBag size={21} strokeWidth={1.6} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-rust text-parchment text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            className={`md:hidden transition-colors ${tone.text}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-ink border-t border-gold/20"
          >
            <div className="flex flex-col px-5 py-4 gap-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="font-condensed tracking-[0.1em] text-lg text-parchment/90 hover:text-gold"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
