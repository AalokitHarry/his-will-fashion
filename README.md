# His Will Fashion

A storefront for **His Will Fashion** — premium Christian streetwear, built as a fast, animated
React front end with a small Express + Razorpay backend for real checkout.

- Instagram: [@his_wll_fashion_club](https://www.instagram.com/his_wll_fashion_club)

## Project structure

```
client/   React + Vite + Tailwind v4 + Framer Motion storefront
server/   Express API that creates & verifies Razorpay orders
Tshirts/  Your original product photos (source files — not served directly)
```

The 8 product photos from `Tshirts/` have been copied into
`client/public/products/` with clean filenames and wired into
[client/src/data/products.js](client/src/data/products.js), which is the catalog's single source of truth.

## Running locally

You need two terminals — one for the API, one for the site.

```bash
cd server
npm install
cp .env.example .env   # then fill in your Razorpay keys (see below)
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The client proxies `/api/*`
requests to the server on port 4242 automatically in dev — no extra config needed.

## Setting up real payments (Razorpay)

1. Create a [Razorpay account](https://dashboard.razorpay.com/signup) if you don't have one.
2. Go to **Settings → API Keys** and generate a **Test Mode** key pair first.
3. Copy `server/.env.example` to `server/.env` and paste in:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
4. Restart the server. Checkout will now open the real Razorpay payment modal.
5. Test with [Razorpay's test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/).
6. When you're ready to accept real money, complete Razorpay's KYC/activation, switch to your
   **Live Mode** keys, and update `.env` (don't commit this file — it's gitignored).

The server is the only place that ever sees your Razorpay secret, and it independently
recalculates the order total from `server/data/products.js` — it never trusts a price sent
from the browser. **Keep the product IDs and prices in `client/src/data/products.js` and
`server/data/products.js` in sync** whenever you add or reprice a product.

## Editing the catalog

Everything about a product lives in one object in `client/src/data/products.js`:

```js
{
  id: "lion-of-judah-tee",       // must be unique, used in the URL
  name: "Lion of Judah Tee",
  category: "Tees",
  price: 1299,                    // ← placeholder, set your real price
  sizes: ["S", "M", "L", "XL", "XXL"],
  colors: [{ name: "Black", hex: "#151210" }],
  verse: "Revelation 5:5",        // shown if the design has a printed verse
  tagline: "...",                 // used instead of `verse` if there isn't one
  description: "...",
  image: "/products/lion-of-judah-tee.jpg",
}
```

To add a new product: drop the photo into `client/public/products/`, add an entry here, **and**
add its price to `server/data/products.js` (`PRODUCTS` map) so checkout can price it correctly.

**All prices are placeholders** — update them to your real pricing before launch.

## Things to personalize before launch

- **Prices** in both `client/src/data/products.js` and `server/data/products.js`.
- **Contact email** — currently `hello@hiswillfashion.in` in [Contact.jsx](client/src/pages/Contact.jsx) and [Footer.jsx](client/src/components/Footer.jsx).
- **Shipping fee / free-shipping threshold** — currently ₹99 flat / free over ₹1,999, set in
  both [Checkout.jsx](client/src/pages/Checkout.jsx) and [server/data/products.js](server/data/products.js).
- **Testimonials** on the home page are placeholder copy — swap in real customer quotes once you have them.
- The favicon, page title, and meta description are in [client/index.html](client/index.html).

## Deploying

- **Client**: any static host (Vercel, Netlify, Cloudflare Pages). Build with `npm run build`
  in `client/`, deploy the `dist/` folder. Set `VITE_API_BASE` to your deployed API's URL.
- **Server**: any Node host (Render, Railway, Fly.io, a VPS). Set `RAZORPAY_KEY_ID`,
  `RAZORPAY_KEY_SECRET`, and `CLIENT_ORIGIN` (your deployed site's URL, for CORS) as environment
  variables there — don't rely on the `.env` file in production.

## Orders

Paid orders are appended to `server/data/orders.json` (gitignored — contains customer PII) as a
simple local log you can open directly. For anything beyond a few orders a week, swap
`server/utils/orderStore.js` for a real database.
