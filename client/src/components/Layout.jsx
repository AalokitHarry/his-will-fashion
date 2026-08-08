import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
