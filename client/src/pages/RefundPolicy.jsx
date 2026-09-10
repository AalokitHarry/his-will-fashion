import LegalPage, { LegalSection } from "../components/LegalPage";
import useSEO from "../hooks/useSEO";

export default function RefundPolicy() {
  useSEO({
    title: "Returns & Refund Policy",
    description: "Our 7-day return window, how to start a return, and how refunds work on Cash on Delivery orders.",
    path: "/refund-policy",
  });

  return (
    <LegalPage title="Returns & Refund Policy" updated="10 September 2026">
      <LegalSection title="7-Day Returns">
        <p>We offer 7-day easy returns and exchanges on unworn, unwashed items with the original tags still attached. The 7 days start from the day your order is delivered.</p>
      </LegalSection>

      <LegalSection title="How to Start a Return">
        <p>
          Email <a href="mailto:hello@hiswillfashion.in" className="text-gold hover:underline">hello@hiswillfashion.in</a> with your order reference and the reason for the return. We'll confirm the details and next steps with you directly.
        </p>
      </LegalSection>

      <LegalSection title="What Can't Be Returned">
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>Items that have been worn, washed, or damaged after delivery</li>
          <li>Items returned without their original tags</li>
          <li>Items returned outside the 7-day window</li>
        </ul>
      </LegalSection>

      <LegalSection title="Refunds on Cash on Delivery Orders">
        <p>
          Since all orders are placed Cash on Delivery, a refund only applies once payment has actually been made — i.e. after the order is delivered and paid for. For an approved return, we'll send your refund by bank transfer or UPI once we've received and inspected the returned item; we aim to process this within a reasonable timeframe and will keep you updated by email or phone.
        </p>
        <p>If you'd rather exchange a size than receive a refund, let us know when you start the return — exchanges are subject to stock availability.</p>
      </LegalSection>

      <LegalSection title="Cancelling an Order">
        <p>
          You can cancel an order any time before it ships by emailing{" "}
          <a href="mailto:hello@hiswillfashion.in" className="text-gold hover:underline">hello@hiswillfashion.in</a> with your order reference. Since orders are Cash on Delivery, no payment has been taken yet, so cancelling before shipping needs nothing further from you.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Reach out anytime at{" "}
          <a href="mailto:hello@hiswillfashion.in" className="text-gold hover:underline">hello@hiswillfashion.in</a> — we'll sort it out.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
