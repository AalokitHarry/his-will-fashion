import { Link } from "react-router-dom";
import LegalPage, { LegalSection } from "../components/LegalPage";
import useSEO from "../hooks/useSEO";

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy",
    description: "How His Will Fashion collects, uses, and protects your personal information.",
    path: "/privacy-policy",
  });

  return (
    <LegalPage title="Privacy Policy" updated="10 September 2026">
      <p className="text-parchment/70 leading-relaxed">
        His Will Fashion ("we", "us", "our") respects your privacy. This policy explains what
        information we collect when you use this website and place an order, and how we use it.
      </p>

      <LegalSection title="Information We Collect">
        <p>When you place an order, we collect the information you provide at checkout: your full name, email address, phone number, and shipping address.</p>
        <p>If you contact us directly (email or Instagram), we receive whatever information you choose to share in that message.</p>
        <p>We do not use tracking cookies, advertising trackers, or third-party analytics on this site. Your cart contents are saved in your browser's local storage so items aren't lost between visits — this stays on your device and is never sent to us until you check out.</p>
      </LegalSection>

      <LegalSection title="How We Use Your Information">
        <p>We use the information you provide to:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>Process and fulfill your order, including confirming it by phone or email before it ships</li>
          <li>Communicate with you about your order status, shipping, and delivery</li>
          <li>Respond to questions, returns, or support requests you send us</li>
        </ul>
        <p>We do not sell, rent, or trade your personal information to any third party.</p>
      </LegalSection>

      <LegalSection title="Sharing Your Information">
        <p>We share your shipping details only with the delivery/logistics providers we use to get your order to you. We do not share your information with anyone else, except where required by law.</p>
      </LegalSection>

      <LegalSection title="Data Storage & Security">
        <p>Order and contact information is stored on secure cloud infrastructure. We take reasonable steps to protect your data, but no method of storage or transmission over the internet is 100% secure.</p>
      </LegalSection>

      <LegalSection title="Your Rights">
        <p>You can ask us to access, correct, or delete the personal information we hold about you at any time by emailing{" "}
          <a href="mailto:hello@hiswillfashion.com" className="text-gold hover:underline">hello@hiswillfashion.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Policy">
        <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:hello@hiswillfashion.com" className="text-gold hover:underline">hello@hiswillfashion.com</a> or see our{" "}
          <Link to="/contact" className="text-gold hover:underline">Contact page</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
