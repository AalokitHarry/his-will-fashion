import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import SearchOverlay from "./SearchOverlay";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur-md border-b border-gold/20">
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between h-18 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-md bg-gold flex items-center justify-center text-ink font-display text-lg leading-none group-hover:bg-rust group-hover:text-parchment transition-colors duration-300">
            H
          </span>
          <span className="font-condensed tracking-[0.15em] text-lg text-parchment">
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
                  isActive ? "text-gold" : "text-parchment/80 hover:text-gold"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-parchment hover:text-gold transition-colors"
          >
            <Search size={20} strokeWidth={1.6} />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-parchment hover:text-gold transition-colors"
          >
            <Heart size={20} strokeWidth={1.6} />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-rust text-parchment text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
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
                  className="absolute -top-0.5 -right-0.5 bg-rust text-parchment text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            className="md:hidden text-parchment transition-colors"
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
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 font-condensed tracking-[0.1em] text-lg text-parchment/90 hover:text-gold text-left"
              >
                <Search size={18} strokeWidth={1.6} /> Search
              </button>
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
    <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
