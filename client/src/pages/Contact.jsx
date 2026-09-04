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
    <div className="bg-parchment">
      <section className="bg-ink text-parchment pt-32 pb-20 grain">
        <div className="mx-auto max-w-4xl px-5 md:px-8 text-center">
          <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-4">GET IN TOUCH</p>
          <h1 className="font-display text-4xl md:text-6xl">We'd Love to Hear From You</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-20 grid md:grid-cols-[1fr_1.2fr] gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-full bg-ink text-gold flex items-center justify-center shrink-0">
              <Mail size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">EMAIL US</h3>
              <a href="mailto:hello@hiswillfashion.in" className="text-ink/70 hover:text-rust transition-colors">
                hello@hiswillfashion.in
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-full bg-ink text-gold flex items-center justify-center shrink-0">
              <Camera size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">DM US</h3>
              <a
                href="https://www.instagram.com/his_wll_fashion_club"
                target="_blank"
                rel="noreferrer"
                className="text-ink/70 hover:text-rust transition-colors"
              >
                @his_wll_fashion_club
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-11 h-11 rounded-full bg-ink text-gold flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </span>
            <div>
              <h3 className="font-condensed tracking-[0.1em] text-sm mb-1">SHIP FROM</h3>
              <p className="text-ink/70">India — shipping Pan India</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 bg-ink text-parchment rounded-2xl p-10 h-full">
              <CheckCircle2 className="text-gold" size={32} />
              <p className="font-display text-xl">Your email app should be opening now.</p>
              <p className="text-parchment/60 text-sm">If it didn't, write to us directly at hello@hiswillfashion.in</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-ink/60">NAME</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="border border-ink/20 rounded-lg px-3.5 py-3 bg-parchment focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-ink/60">EMAIL</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="border border-ink/20 rounded-lg px-3.5 py-3 bg-parchment focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-condensed tracking-[0.08em] text-xs text-ink/60">MESSAGE</label>
                <textarea
                  required
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  className="border border-ink/20 rounded-lg px-3.5 py-3 bg-parchment focus:outline-none focus:border-gold resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-ink text-parchment font-condensed tracking-[0.14em] py-3.5 rounded-full hover:bg-rust transition-colors duration-300"
              >
                SEND MESSAGE
              </button>
            </>
          )}
        </form>
      </section>

      <section id="shipping" className="mx-auto max-w-4xl px-5 md:px-8 py-16 scroll-mt-28">
        <h2 className="font-display text-3xl mb-6">Shipping</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div className="border border-ink/10 rounded-xl p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">COVERAGE</p>
            <p className="text-ink/70">We ship to every pincode across India.</p>
          </div>
          <div className="border border-ink/10 rounded-xl p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">DISPATCH</p>
            <p className="text-ink/70">Orders are dispatched within 2–3 business days of confirmation.</p>
          </div>
          <div className="border border-ink/10 rounded-xl p-5">
            <p className="font-condensed tracking-[0.1em] text-gold mb-2">SHIPPING FEE</p>
            <p className="text-ink/70">Free on orders over ₹1,999. Flat ₹99 on smaller orders.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 md:px-8 pb-24 scroll-mt-28">
        <h2 className="font-display text-3xl mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none font-condensed tracking-[0.05em] text-base">
                {f.q}
                <span className="text-gold transition-transform group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <p className="text-ink/60 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
