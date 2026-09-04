# His Will Fashion

A storefront for **His Will Fashion** — premium Christian streetwear, built as a fast, animated
React front end on Cloudflare Pages/Workers, with a Cloudflare Workers API for checkout.

**Live:**
- Site: https://his-will-fashion.aalokitharry1995.workers.dev
- API: https://his-will-fashion-api.aalokitharry1995.workers.dev

Checkout is **Cash on Delivery only** — this project has no payment gateway integration, by
design. The order form validates the cart server-side and logs a real order; the customer pays
in cash when it arrives.

- Instagram: [@his_wll_fashion_club](https://www.instagram.com/his_wll_fashion_club)

## Project structure

```
client/   React + Vite + Tailwind v4 + Framer Motion storefront (deployed as a Cloudflare Worker)
worker/   Hono API on Cloudflare Workers — validates the cart & logs Cash-on-Delivery orders to D1
Tshirts/  Your original product photos (source files — not served directly)
```

The 8 product photos from `Tshirts/` have been copied into
`client/public/products/` with clean filenames and wired into
[client/src/data/products.js](client/src/data/products.js), which is the catalog's single source of truth.

## Running locally

You need Cloudflare Wrangler logged in (`wrangler login`) and two terminals — one for the API,
one for the site.

```bash
cd worker
npm install
npm run db:migrate:local   # creates the local orders table (one-time)
npm run dev                # runs the API on http://localhost:4242
```

```bash
cd client
npm install
npm run dev                # runs the site on http://localhost:5173
```

Open the URL Vite prints (usually `http://localhost:5173`). The client proxies `/api/*`
requests to the worker on port 4242 automatically in dev — no extra config needed.

## How checkout works right now

`POST /api/orders/place` (in [worker/src/index.js](worker/src/index.js)) validates the cart and
customer details, recalculates the order total server-side from
[worker/src/products.js](worker/src/products.js) — it never trusts a price sent from the
browser — generates an order reference, and inserts the order into a Cloudflare D1 database
(`his-will-fashion-orders`). The customer sees an order-confirmed page telling them to pay in
cash on delivery. **Keep the product IDs and prices in `client/src/data/products.js` and
`worker/src/products.js` in sync** whenever you add or reprice a product.

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
add its price to `worker/src/products.js` (`PRODUCTS` map) so checkout can price it correctly.

**All prices are placeholders** — update them to your real pricing before launch.

## Things to personalize before launch

- **Prices** in both `client/src/data/products.js` and `worker/src/products.js`.
- **Contact email** — currently `hello@hiswillfashion.in` in [Contact.jsx](client/src/pages/Contact.jsx) and [Footer.jsx](client/src/components/Footer.jsx).
- **Shipping fee / free-shipping threshold** — currently ₹99 flat / free over ₹1,999, set in
  both [Checkout.jsx](client/src/pages/Checkout.jsx) and [worker/src/products.js](worker/src/products.js).
- **Testimonials** on the home page are placeholder copy — swap in real customer quotes once you have them.
- The favicon, page title, and meta description are in [client/index.html](client/index.html).

## Deploying

Both pieces deploy with Wrangler, from their own directories:

```bash
cd worker && npx wrangler deploy                                    # API
cd client && npm run build && npx wrangler pages deploy dist \
  --project-name=his-will-fashion                                   # site
```

- **worker/wrangler.toml** → `[vars] CLIENT_ORIGIN` is a comma-separated allowlist of origins
  the API accepts requests from (must include both your local dev URL and your deployed site's
  URL, or checkout will fail with a CORS error).
- **client/.env.production** → `VITE_API_BASE` must point at the deployed worker's URL. This
  gets baked into the build, so re-run `npm run build` after changing it.
- If you ever repoint the site at a **different** domain (e.g. a custom domain instead of the
  `workers.dev` one), update both of the above and redeploy the worker.

## Orders

Placed orders live in the `orders` table of the `his-will-fashion-orders` D1 database. Query
them with:

```bash
cd worker
npx wrangler d1 execute his-will-fashion-orders --remote --command "SELECT * FROM orders ORDER BY created_at DESC"
```

For a nicer view as the order volume grows, connect D1 to a dashboard (Cloudflare's D1 UI in
the dashboard works too) or add an authenticated `GET /api/orders` route to the worker.
