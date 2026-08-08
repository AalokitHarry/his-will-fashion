// Live catalog for His Will Fashion, built from real product photography
// in /public/products. Update prices/stock here as the collection grows —
// this is the single source of truth the storefront reads from.
// NOTE: prices are placeholders — set your real prices before launch, and
// keep server/data/products.js in sync (the server never trusts client prices).

export const CATEGORIES = ["All", "Tees"];

export const PRODUCTS = [
  {
    id: "lion-of-judah-tee",
    name: "Lion of Judah Tee",
    category: "Tees",
    price: 1299,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#151210" }],
    verse: "Revelation 5:5",
    tag: "New",
    description:
      "Oversized heavyweight tee with a bold 'Lion of Judah' back print — a crowned lion over a dusk skyline, with the full verse lettered beside it. Drop-shoulder fit in 240 GSM cotton fleece.",
    image: "/products/lion-of-judah-tee.jpg",
  },
  {
    id: "heavenly-influencer-tee",
    name: "Heavenly Influencer Tee",
    category: "Tees",
    price: 1299,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Royal Blue", hex: "#2c3ea3" }],
    verse: "Matthew 5:16",
    tag: "New",
    description:
      "Bold varsity-style 'Heavenly Influencer' print with 'Let your light shine before others' lettered beneath. Oversized fit, heavyweight cotton fleece.",
    image: "/products/heavenly-influencer-tee.jpg",
  },
  {
    id: "kingdom-mindset-tee",
    name: "Kingdom Mindset Tee",
    category: "Tees",
    price: 1299,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Red", hex: "#a3242c" }],
    tagline: "Kingdom Mindset",
    tag: "New",
    description:
      "A crest-style badge graphic with a crown and laurel wreath, screen-printed front and center on an oversized, heavyweight tee.",
    image: "/products/kingdom-mindset-tee.jpg",
  },
  {
    id: "grace-changed-my-story-tee",
    name: "Grace Changed My Story Tee",
    category: "Tees",
    price: 1299,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Royal Blue", hex: "#2c3ea3" }],
    tagline: "Grace Changed My Story",
    tag: "New",
    description:
      "Hand-lettered sticker-style back graphic with a small cross accent — a quiet testimony worn loud. Oversized heavyweight fit.",
    image: "/products/grace-changed-my-story-tee.jpg",
  },
  {
    id: "jesus-little-princess-tee",
    name: "Jesus' Little Princess Tee",
    category: "Tees",
    price: 1199,
    compareAt: null,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Cream", hex: "#f3ecd8" }],
    verse: "Psalm 139:14",
    tag: "New",
    description:
      "A soft illustrated graphic with sunflowers on a cream tee, paired with 'I am fearfully and wonderfully made.' Oversized, heavyweight cotton.",
    image: "/products/jesus-little-princess-tee.jpg",
  },
  {
    id: "philippians-4-7-tee",
    name: "Philippians 4:7 Tee",
    category: "Tees",
    price: 1199,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Cream", hex: "#f3ecd8" }],
    verse: "Philippians 4:7",
    tag: "New",
    description:
      "The full verse lettered vertically down the back in clean serif type — 'And the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.'",
    image: "/products/philippians-4-7-tee.jpg",
  },
  {
    id: "i-ace-my-race-tee",
    name: "I Ace My Race Tee",
    category: "Tees",
    price: 1299,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#151210" }],
    tagline: "I Ace My Race By God's Grace",
    tag: "New",
    description:
      "Hand-painted lettering in pink and gold with a crown accent on jet black. Oversized, heavyweight fit for everyday wear.",
    image: "/products/i-ace-my-race-tee.jpg",
  },
  {
    id: "plain-eggplant-tee",
    name: "The Essentials Tee — Eggplant",
    category: "Tees",
    price: 899,
    compareAt: null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Eggplant", hex: "#3c1f30" }],
    tagline: "No print. Just presence.",
    tag: "New",
    description:
      "The blank canvas of the collection — same oversized, heavyweight 240 GSM cotton fleece as every printed piece, in a deep eggplant tone. Understated, versatile, built to layer.",
    image: "/products/plain-eggplant-tee.jpg",
  },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);
