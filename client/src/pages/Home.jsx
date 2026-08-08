import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Camera } from "lucide-react";
import { getProductById, PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import Marquee from "../components/Marquee";

const TICKER = [
  "PAN INDIA SHIPPING",
  "FAITH OVER FEAR",
  "NEW DROP WEEKLY",
  "WEAR YOUR FAITH",
  "LIVE HIS WILL",
];

const SPOTLIGHT_IDS = ["lion-of-judah-tee", "jesus-little-princess-tee", "grace-changed-my-story-tee"];

const TESTIMONIALS = [
  {
    quote: "The quality is incredible and every time I wear it someone asks about the verse. It's become a way to open conversations about my faith.",
    name: "Priya S.",
    city: "Bengaluru",
  },
  {
    quote: "Finally, streetwear that doesn't compromise on style OR conviction. The Lion of Judah tee is on repeat.",
    name: "Daniel M.",
    city: "Kochi",
  },
  {
    quote: "Ordered for my whole cell group. Shipping was fast even to a smaller town, and the packaging felt like a gift.",
    name: "Ruth A.",
    city: "Pune",
  },
];

export default function Home() {
  const featured = PRODUCTS.slice(0, 4);
  const spotlight = SPOTLIGHT_IDS.map(getProductById).filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center bg-ink text-parchment overflow-hidden grain">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 20%, rgba(201,162,77,0.16) 0%, rgba(18,16,9,0) 70%), radial-gradient(50% 40% at 85% 80%, rgba(138,51,36,0.18) 0%, rgba(18,16,9,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl w-full px-5 md:px-8 pt-28 pb-20 flex flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-condensed tracking-[0.3em] text-gold text-xs md:text-sm mb-6"
          >
            PREMIUM CHRISTIAN STREETWEAR &middot; EST. FOR THE KINGDOM
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[15vw] leading-[0.95] md:text-[7.5rem] md:leading-[0.92]"
          >
            Wear Your Faith.
            <br />
            <span className="italic text-gold">Live His Will.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-7 max-w-xl text-parchment/70 text-base md:text-lg"
          >
            Faith-inspired apparel crafted for those who carry the Word wherever they go. Bold design,
            heavyweight fabric, scripture in every stitch.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gold text-ink font-condensed tracking-[0.14em] px-8 py-4 rounded-full hover:bg-parchment transition-colors duration-300"
            >
              SHOP THE COLLECTION <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 border border-parchment/30 text-parchment font-condensed tracking-[0.14em] px-8 py-4 rounded-full hover:border-gold hover:text-gold transition-colors duration-300"
            >
              OUR STORY
            </Link>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative pb-8 flex justify-center text-parchment/40"
        >
          <ArrowDown size={20} />
        </motion.div>
      </section>

      {/* TICKER */}
      <div className="bg-gold text-ink py-3 font-condensed tracking-[0.15em] text-sm">
        <Marquee items={TICKER} />
      </div>

      {/* FEATURED COLLECTION */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">THE BESTSELLERS</p>
            <h2 className="font-display text-4xl md:text-5xl">Worn by the Movement</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 font-condensed tracking-[0.1em] text-sm border-b border-ink/20 pb-1 hover:border-gold hover:text-rust transition-colors w-fit"
          >
            VIEW ALL PRODUCTS <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* VERSE SPOTLIGHT */}
      <section className="bg-ink text-parchment py-28 md:py-36 grain relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
          <span className="font-display text-[40vw] leading-none">†</span>
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="text-gold text-4xl font-display">&ldquo;</span>
          <p className="font-display italic text-2xl md:text-4xl leading-snug md:leading-snug">
            Not by might, nor by power, but by my Spirit, says the LORD of hosts.
          </p>
          <p className="mt-6 font-condensed tracking-[0.2em] text-gold text-sm">ZECHARIAH 4:6</p>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden order-2 md:order-1"
        >
          <ProductImage src="/products/lion-of-judah-tee.jpg" alt="Lion of Judah Tee" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-1 md:order-2"
        >
          <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">WHY WE EXIST</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">More Than a Brand. A Declaration.</h2>
          <p className="text-ink/70 text-base md:text-lg leading-relaxed mb-5">
            His Will Fashion was built for believers who want their wardrobe to reflect their walk. Every
            piece is designed to start conversations, carry conviction, and be worn without apology — from
            Sunday service to the streets.
          </p>
          <p className="text-ink/70 text-base md:text-lg leading-relaxed mb-8">
            We source heavyweight fabric, print with care, and ship across India so the message travels
            further than we ever could alone.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-condensed tracking-[0.12em] text-sm border-b border-ink pb-1 hover:text-rust hover:border-rust transition-colors"
          >
            READ OUR STORY <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-24 md:pb-32">
        <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3">FAN FAVORITES</p>
        <h2 className="font-display text-4xl md:text-5xl mb-10">Wear It Loud</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {spotlight.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={`/product/${product.id}`} className="group relative block aspect-[3/4] rounded-2xl overflow-hidden">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                  <h3 className="font-display text-xl text-parchment">{product.name}</h3>
                  <span className="w-9 h-9 rounded-full border border-parchment/50 flex items-center justify-center text-parchment shrink-0 ml-3 group-hover:bg-gold group-hover:border-gold group-hover:text-ink transition-colors">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink text-parchment py-24 md:py-32 grain">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-condensed tracking-[0.2em] text-gold text-xs mb-3 text-center">TESTIMONIES</p>
          <h2 className="font-display text-4xl md:text-5xl text-center mb-14">The Family Speaks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-parchment/[0.04] border border-parchment/10 rounded-2xl p-7 flex flex-col gap-5"
              >
                <span className="text-gold font-display text-3xl leading-none">&ldquo;</span>
                <p className="text-parchment/80 leading-relaxed">{t.quote}</p>
                <p className="font-condensed tracking-[0.1em] text-sm text-gold mt-auto">
                  {t.name.toUpperCase()} &middot; {t.city}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 text-center">
        <Camera className="mx-auto text-gold mb-5" size={30} strokeWidth={1.4} />
        <h2 className="font-display text-4xl md:text-5xl mb-4">Join the Movement</h2>
        <p className="text-ink/60 max-w-lg mx-auto mb-8">
          Follow along for new drops, behind-the-scenes, and a community wearing their faith out loud.
        </p>
        <a
          href="https://www.instagram.com/his_wll_fashion_club"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-ink text-parchment font-condensed tracking-[0.14em] px-8 py-4 rounded-full hover:bg-rust transition-colors duration-300"
        >
          @his_wll_fashion_club <ArrowRight size={16} />
        </a>
      </section>
    </div>
  );
}
