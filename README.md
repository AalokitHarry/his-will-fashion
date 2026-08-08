# His Will Fashion

A storefront for **His Will Fashion** — premium Christian streetwear, built as a fast, animated
React front end with a small Express backend for checkout.

Checkout is currently **Cash on Delivery only** — no payment gateway is wired up. The order
form still validates the cart server-side and logs a real order; a customer just pays in cash
when it arrives instead of paying online. See [Adding online payments back](#adding-online-payments-back)
for how to reintroduce one later.

- Instagram: [@his_wll_fashion_club](https://www.instagram.com/his_wll_fashion_club)

## Project structure

```
client/   React + Vite + Tailwind v4 + Framer Motion storefront
server/   Express API that validates the cart & logs Cash-on-Delivery orders
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
cp .env.example .env
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The client proxies `/api/*`
requests to the server on port 4242 automatically in dev — no extra config needed.

## How checkout works right now

`POST /api/orders/place` (in [server/routes/orders.js](server/routes/orders.js)) validates the
cart and customer details, recalculates the order total server-side from
[server/data/products.js](server/data/products.js) — it never trusts a price sent from the
browser — generates an order reference, and appends the order to `server/data/orders.json`.
The customer sees an order-confirmed page telling them to pay in cash on delivery. **Keep the
product IDs and prices in `client/src/data/products.js` and `server/data/products.js` in sync**
whenever you add or reprice a product.

## Adding online payments back

The old Razorpay integration was removed but the pattern is easy to re-introduce: add a
payment-gateway route in `server/routes/orders.js` (create order → redirect/open checkout →
verify payment server-side → `saveOrder`), call it from `client/src/pages/Checkout.jsx` instead
of (or alongside) `placeOrder`, and put the gateway's secret keys in `server/.env`. Razorpay,
PhonePe, and Stripe all follow roughly this same create → verify shape.

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
- **Server**: any Node host (Render, Railway, Fly.io, a VPS). Set `CLIENT_ORIGIN` (your deployed
  site's URL, for CORS) as an environment variable there — don't rely on the `.env` file in
  production.

## Orders

Placed orders are appended to `server/data/orders.json` (gitignored — contains customer PII) as
a simple local log you can open directly. For anything beyond a few orders a week, swap
`server/utils/orderStore.js` for a real database.
