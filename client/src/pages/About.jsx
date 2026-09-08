import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cross, Heart, Sparkles, Users } from "lucide-react";
import ProductImage from "../components/ProductImage";
import RevealImage from "../components/RevealImage";
import RevealText from "../components/RevealText";
import Magnetic from "../components/Magnetic";
import IlluminatedCapital from "../components/IlluminatedCapital";

const VALUES = [
  { icon: Cross, title: "Faith First", body: "Every design begins with scripture. We build clothing around conviction, not the other way around." },
  { icon: Sparkles, title: "Uncompromising Craft", body: "Heavyweight fabric, premium print techniques, and finishing that holds up to daily wear and daily worship." },
  { icon: Users, title: "Community", body: "We're building a family of believers who wear their faith boldly — this brand grows through you, not around you." },
  { icon: Heart, title: "Purpose Over Profit", body: "A portion of every drop supports ministry work and community outreach across India." },
];

function Eyebrow({ n, children, center }) {
  return (
    <p
      className={`flex items-center gap-2.5 font-condensed tracking-[0.2em] text-gold text-xs mb-4 ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="text-parchment/30">({n})</span> {children}
    </p>
  );
}

export default function About() {
  return (
    <div>
      <section className="bg-ink text-parchment pt-32 pb-24 relative overflow-hidden">
        <IlluminatedCapital letter="H" className="hidden md:block absolute left-[-6%] top-[4%] opacity-40 z-0" />
        <div className="relative mx-auto max-w-4xl px-5 md:px-8 text-center">
          <Eyebrow n="01" center>OUR STORY</Eyebrow>
          <h1 className="font-editorial leading-[1.05] text-4xl md:text-6xl mb-6">
            <RevealText trigger="mount">Clothing Built on</RevealText>
            <RevealText className="block text-gold" delay={0.1} trigger="mount">
              Conviction.
            </RevealText>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-parchment/70 text-lg leading-relaxed"
          >
            His Will Fashion started with a simple frustration: nowhere to find streetwear that felt as bold
            as our faith. So we built it ourselves — one verse, one drop, one testimony at a time.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 grid md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <Eyebrow n="02">THE BEGINNING</Eyebrow>
          <h2 className="font-editorial text-3xl md:text-4xl mb-6 leading-[1.05]">
            From a Prayer to a Movement
          </h2>
          <p className="text-parchment/70 leading-relaxed mb-5">
            What began as a small idea between friends who wanted their wardrobe to reflect their walk with
            Christ has grown into a community stretching across India. Every piece carries a verse, a
            reminder, a quiet witness worn into the everyday.
          </p>
          <p className="text-parchment/70 leading-relaxed">
            We design in small batches, print with intention, and ship every order like it's going to
            family — because it is.
          </p>
        </motion.div>
        <RevealImage className="aspect-[4/5] rounded-lg overflow-hidden">
          <ProductImage src="/products/kingdom-mindset-tee-1.jpg" alt="Kingdom Mindset Tee" />
        </RevealImage>
      </section>

      <section className="bg-charcoal text-parchment py-24 grain">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center mb-14">
            <Eyebrow n="03" center>WHAT WE STAND FOR</Eyebrow>
            <h2 className="font-editorial text-4xl md:text-5xl">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-ink/40 border border-gold/15 rounded-lg p-6 hover:border-gold/40 transition-colors"
              >
                <v.icon className="text-gold mb-4" size={26} strokeWidth={1.5} />
                <h3 className="font-editorial text-lg mb-2">{v.title}</h3>
                <p className="text-parchment/60 text-sm leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <Eyebrow n="04" center>JOIN US</Eyebrow>
        <h2 className="font-editorial text-3xl md:text-4xl mb-6">
          Ready to Wear Your Faith?
        </h2>
        <p className="text-parchment/60 mb-8">Join the growing family of believers repping His Will Fashion across the country.</p>
        <Magnetic>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-lg border border-gold hover:bg-rust hover:border-rust hover:text-parchment transition-colors duration-200"
          >
            SHOP THE COLLECTION <ArrowRight size={16} />
          </Link>
        </Magnetic>
      </section>
    </div>
  );
}
