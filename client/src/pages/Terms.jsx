import { Link } from "react-router-dom";
import LegalPage, { LegalSection } from "../components/LegalPage";
import useSEO from "../hooks/useSEO";

export default function Terms() {
  useSEO({
    title: "Terms & Conditions",
    description: "The terms that apply when you shop with His Will Fashion.",
    path: "/terms",
  });

  return (
    <LegalPage title="Terms & Conditions" updated="10 September 2026">
      <p className="text-parchment/70 leading-relaxed">
        By using this website and placing an order, you agree to the terms below.
      </p>

      <LegalSection title="Products & Pricing">
        <p>All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise. We may update prices, descriptions, or availability at any time without prior notice.</p>
      </LegalSection>

      <LegalSection title="Orders & Payment">
        <p>We currently accept Cash on Delivery (COD) only — you pay in cash when your order arrives. We may contact you by phone or email to confirm an order before it ships, and reserve the right to decline or cancel any order, including for stock or delivery-address issues.</p>
      </LegalSection>

      <LegalSection title="Shipping">
        <p>We ship Pan India. Orders are typically dispatched within 2–3 business days of confirmation; delivery timelines vary by location and courier. Shipping is free on orders over ₹1,999, and a flat ₹99 on smaller orders.</p>
      </LegalSection>

      <LegalSection title="Returns & Refunds">
        <p>
          See our <Link to="/refund-policy" className="text-gold hover:underline">Returns & Refund Policy</Link> for the full details on returns, exchanges, and refunds.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual Property">
        <p>All designs, graphics, logos, and content on this site are the property of His Will Fashion and may not be copied, reproduced, or used without our written permission.</p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>We work to keep product information and this site accurate, but we don't guarantee it's error-free at all times. To the extent permitted by law, His Will Fashion isn't liable for indirect or incidental losses arising from your use of this site or its products.</p>
      </LegalSection>

      <LegalSection title="Governing Law">
        <p>These terms are governed by the laws of India.</p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>We may update these terms from time to time. Continued use of the site after a change means you accept the updated terms.</p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:hello@hiswillfashion.com" className="text-gold hover:underline">hello@hiswillfashion.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
