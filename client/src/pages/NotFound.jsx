import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <p className="font-display text-gold text-2xl mb-3">Lost your way?</p>
      <h1 className="font-editorial text-7xl mb-6">404</h1>
      <p className="text-parchment/60 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200">
        BACK HOME
      </Link>
    </div>
  );
}
