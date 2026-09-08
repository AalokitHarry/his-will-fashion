import { useState } from "react";
import { Camera, CheckCircle2, Mail, MapPin } from "lucide-react";

const FAQS = [
  {
    q: "What sizes do you offer?",
    a: "Most tees and hoodies run true-to-size in an oversized/relaxed fit from S to XXL. Check the size chart on each product page — when in doubt, size down for a slimmer fit.",
  },
  {
    q: "What's your return & exchange policy?",
    a: "We offer 7-day easy returns and exchanges on unworn items with tags attached. Reach out to us with your order reference and we'll sort you out.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Cash on Delivery only — pay in cash when your order arrives at your doorstep.",
  },
  {
    q: "How can I track my order?",
    a: "You'll receive a tracking link by email and SMS once your order ships. For any issues, contact us with your order reference.",
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:hello@hiswillfashion.in?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div>
      <section className="bg-gold text-ink pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8 text-center">
          <p className="font-condensed tracking-[0.2em] text-ink/60 text-xs mb-4">(01) GET IN TOUCH</p>
          <h1 className="font-editorial text-4xl md:text-6xl leading-[1.05]">
            We'd Love to Hear From You
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-20 grid md:grid-cols-[1fr_1.2fr] gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-lg bg-gold text-ink flex items-center justify-center shrink-0">
              <Mail size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">EMAIL US</h3>
              <a href="mailto:hello@hiswillfashion.in" className="text-parchment/70 hover:text-gold transition-colors">
                hello@hiswillfashion.in
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-lg bg-gold text-ink flex items-center justify-center shrink-0">
              <Camera size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">DM US</h3>
              <a
                href="https://www.instagram.com/his_wll_fashion_club"
                target="_blank"
                rel="noreferrer"
                className="text-parchment/70 hover:text-gold transition-colors"
              >
                @his_wll_fashion_club
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-lg bg-gold text-ink flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">SHIP FROM</h3>
              <p className="text-parchment/70">India — shipping Pan India</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 bg-charcoal border border-gold/15 text-parchment rounded-lg p-10 h-full">
              <CheckCircle2 className="text-gold" size={32} />
              <p className="font-editorial text-xl">Your email app should be opening now.</p>
              <p className="text-parchment/60 text-sm">If it didn't, write to us directly at hello@hiswillfashion.in</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">NAME</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">EMAIL</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-parchment/60">MESSAGE</label>
                <textarea
                  required
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  className="border border-parchment/20 rounded-lg px-3.5 py-3 bg-parchment text-ink focus:outline-none focus:border-gold resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gold text-ink font-condensed tracking-[0.14em] py-3.5 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200"
              >
                SEND MESSAGE
              </button>
            </>
          )}
        </form>
      </section>

      <section id="shipping" className="mx-auto max-w-4xl px-5 md:px-8 py-16 scroll-mt-28">
        <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">(02) LOGISTICS</p>
        <h2 className="font-editorial text-3xl mb-6">Shipping</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div className="border border-gold/15 rounded-lg p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">COVERAGE</p>
            <p className="text-parchment/70">We ship to every pincode across India.</p>
          </div>
          <div className="border border-gold/15 rounded-lg p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">DISPATCH</p>
            <p className="text-parchment/70">Orders are dispatched within 2–3 business days of confirmation.</p>
          </div>
          <div className="border border-gold/15 rounded-lg p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">SHIPPING FEE</p>
            <p className="text-parchment/70">Free on orders over ₹1,999. Flat ₹99 on smaller orders.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 md:px-8 pb-24 scroll-mt-28">
        <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">(03) QUESTIONS</p>
        <h2 className="font-editorial text-3xl mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col divide-y divide-parchment/10 border-t border-b border-parchment/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none font-condensed tracking-[0.05em] text-base">
                {f.q}
                <span className="text-gold transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="text-parchment/60 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
