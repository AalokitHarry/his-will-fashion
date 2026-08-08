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
        transparent ? "bg-transparent" : "bg-ink/95 backdrop-blur-md border-b border-gold/10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between h-18 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink transition-colors duration-300">
            <span className="font-display text-lg leading-none translate-y-[-1px]">†</span>
          </span>
          <span className="font-condensed tracking-[0.15em] text-xl text-parchment">
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
                  isActive ? "text-gold" : "text-parchment/85 hover:text-gold"
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
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-parchment hover:text-gold transition-colors"
          >
            <ShoppingBag size={21} strokeWidth={1.6} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-gold text-ink text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            className="md:hidden text-parchment"
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
            className="md:hidden overflow-hidden bg-ink border-t border-gold/10"
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
