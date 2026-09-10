import { Link } from "react-router-dom";
import { Camera, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-parchment/80 grain">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12 pb-12 border-b border-parchment/10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-md bg-gold flex items-center justify-center text-ink font-display text-base leading-none">
                H
              </span>
              <span className="font-condensed tracking-[0.15em] text-xl text-parchment">
                HIS WILL <span className="text-gold">FASHION</span>
              </span>
            </div>
            <p className="text-parchment/70 leading-relaxed max-w-xs">
              "Wear your faith. Live His will." Premium Christian streetwear, cut for everyday devotion.
            </p>
          </div>

          <div>
            <h4 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">SHOP</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-gold transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Tees" className="hover:text-gold transition-colors">Tees</Link></li>
              <li><Link to="/product/lion-of-judah-tee" className="hover:text-gold transition-colors">Lion of Judah Tee</Link></li>
              <li><Link to="/product/grace-changed-my-story-tee" className="hover:text-gold transition-colors">Grace Changed My Story Tee</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">COMPANY</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/about" className="hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
              <li><Link to="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link to="/contact#shipping" className="hover:text-gold transition-colors">Shipping (Pan India)</Link></li>
              <li><Link to="/contact#faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-condensed tracking-[0.15em] text-sm text-gold mb-4">STAY CONNECTED</h4>
            <p className="text-sm mb-4 text-parchment/60">Faith drops, new releases, and testimonies from the family.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center border-b border-parchment/25 focus-within:border-gold transition-colors"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                className="bg-transparent py-2 text-sm flex-1 placeholder:text-parchment/40 focus:outline-none"
              />
              <button type="submit" aria-label="Subscribe" className="p-2 text-gold hover:text-parchment transition-colors">
                <Mail size={16} />
              </button>
            </form>
            <a
              href="https://www.instagram.com/his_wll_fashion_club"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm hover:text-gold transition-colors"
            >
              <Camera size={17} /> @his_wll_fashion_club
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-parchment/40">
          <p>&copy; {new Date().getFullYear()} His Will Fashion. All rights reserved. &middot; Made with faith</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-gold transition-colors">Returns & Refunds</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
