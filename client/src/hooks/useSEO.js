import { useEffect } from "react";

const SITE_URL = "https://his-will-fashion.aalokitharry1995.workers.dev";
const SITE_NAME = "His Will Fashion";
const DEFAULT_IMAGE = `${SITE_URL}/products/lion-of-judah-tee-1.jpg`;

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (data == null) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// Sets per-page title, meta description, canonical URL, Open Graph / Twitter
// tags, and optional JSON-LD structured data. Runs client-side, so it helps
// search engines that execute JS (Google does) and keeps the browser tab
// title correct; it does NOT help crawlers that read raw HTML without
// executing JS (notably Facebook/WhatsApp link-preview bots), which will
// only ever see index.html's static defaults. True per-page social preview
// images would need prerendering or SSR.
export default function useSEO({ title, description, path = "/", image, noindex = false, jsonLd = null }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Wear Your Faith. Live His Will.`;
    const url = `${SITE_URL}${path}`;
    const ogImage = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    if (description) upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    if (description) upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:type", path.startsWith("/product/") ? "product" : "website");

    upsertMeta("name", "twitter:title", fullTitle);
    if (description) upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    upsertJsonLd("page-jsonld", jsonLd);

    return () => upsertJsonLd("page-jsonld", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, noindex, JSON.stringify(jsonLd)]);
}
