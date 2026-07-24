# Flowers Everywhere — Premium Artificial Flowers & Home Décor

A fast, elegant, fully static storefront with a no-code admin panel and
**WhatsApp checkout** (no online payments). Built to feel like a premium
home-décor brand — Apple × Zara Home × Mason Home — and to run anywhere
with zero backend and zero monthly cost.

---

## 1. What's included

```
flowers-everywhere/
├─ index.html          Home (hero, categories, new/best/trending, collections, why, IG, reviews, newsletter)
├─ shop.html           Full catalogue with live search, filters (category/colour/price/availability) & sorting
├─ product.html        Product detail — gallery, zoom, qty, add-to-cart, share, related, schema
├─ cart.html           Full cart page (drawer cart is available site-wide too)
├─ admin.html          Password-protected owner dashboard (no code required)
├─ 404.html
├─ robots.txt · sitemap.xml · site.webmanifest · netlify.toml
└─ assets/
   ├─ css/style.css    Design system (tokens, components, responsive, animations)
   └─ js/
      ├─ data.js       ★ Your product catalogue (edit or replace this to change products)
      ├─ app.js        Engine: store, cart, WhatsApp checkout, UI, image system
      ├─ home.js · shop.js · product.js · cart.js · admin.js
```

Everything is plain HTML/CSS/vanilla JS — no build step, no framework, no database.

---

## 2. Run it locally

Just open `index.html` in a browser. (Everything, including product images,
works offline — images are elegant generated placeholders until you add real photos.)

For the cleanest experience you can run a tiny local server, but it is optional.

---

## 3. Deploy to Netlify (recommended, free)

**Easiest — drag & drop:**
1. Go to <https://app.netlify.com/drop>
2. Drag the whole `flowers-everywhere` folder onto the page.
3. Done — you get a live URL in seconds.

**Custom domain (`flowerseverywhere.lk`):**
1. In Netlify → *Site settings → Domain management → Add a domain*.
2. Enter `flowerseverywhere.lk` and follow the DNS steps with your registrar.

**Vercel** or any static host / cPanel works too — just upload the folder's contents.

---

## 4. WhatsApp checkout

There is **no online payment, no order database, no account, and no confirmation
page**. When a customer clicks *Checkout on WhatsApp*, the site builds a fully
formatted order (URL-encoded automatically) and opens WhatsApp to
**+94 77 788 8870** via the official click-to-chat API. The customer just presses
**Send**. The generated message looks like:

```
🌸 Hello Flowers Everywhere!

I'd like to place an order.

Order Reference: FE-2026-000347

━━━━━━━━━━━━━━━━━━

Order Summary

1.
Product:
White Artificial Rose
Product ID:
FE1001
Quantity:
3
Unit Price:
Rs. 1,250
Subtotal:
Rs. 3,750
━━━━━━━━━━━━━━━━━━

Total Items:
5
Grand Total:
Rs. 8,750

Please let me know whether these items are available and whether delivery or pickup is possible.

Thank you!
```

**Order reference:** every checkout auto-generates a unique reference
(`FE-YYYY-######`) so you can track a chat with one code — "Regarding order
FE-2026-000347, delivery is tomorrow." No backend needed; the counter lives in
the browser.

To change the number, edit `waNumber` in `assets/js/app.js` (digits only, e.g. `94777888870`).

---

## 5. Managing products (Admin)

1. Open **`admin.html`** (link it from a bookmark — it is hidden from search engines).
2. Password: **`flowers2026`** — change it at the top of `assets/js/admin.js`.

You can:
- **Add / edit / delete / archive / duplicate** products
- Upload **multiple images** (drag & drop, auto-optimised) or paste image URLs
- Set price, old price, category, colour, stock status, short & long descriptions, SEO alt text
- Toggle **Featured / New / Best Seller / Trending**
- Save products as **Drafts** and publish later
- Manage **categories**
- See basic **analytics** (most-viewed products, checkout count)

### Making your changes public
Admin edits are saved in **your browser** (so you can work freely and preview).
To publish them to the live site:
1. In Admin → **Data & Settings → Export data.js**.
2. Replace `assets/js/data.js` in the project folder with the downloaded file.
3. Re-deploy (drag the folder to Netlify again).

> This keeps the site 100% static and free. When you're ready for instant,
> multi-device publishing, the code is structured to drop in a backend
> (e.g. Supabase) later without a redesign — see section 7.

Use **Export products.json** for backups, and **Import** to restore or bulk-upload.

---

## 6. Customising

| Want to change… | Edit |
|---|---|
| Colours, fonts, spacing | `:root` tokens at the top of `assets/css/style.css` |
| Brand name, phone, socials, free-ship threshold | `CONFIG` in `assets/js/app.js` |
| Products & categories | `assets/js/data.js` (or use Admin) |
| Admin password | `ADMIN_PASSWORD` in `assets/js/admin.js` |

**Real product photos:** add them per-product in Admin, or set the `images: []`
array for a product in `data.js`. Until then, each product shows a tasteful
generated placeholder so the site never has broken images.

---

## 7. Built to grow (future-ready)

The data layer (`Store`), cart, and checkout are isolated behind a small API,
so you can later add — without a redesign:
- Online payments (swap the WhatsApp checkout call)
- A hosted database / real-time admin (e.g. Supabase) behind `Store`
- Customer accounts, wishlists, reviews, discount codes, inventory & order tracking

---

## 8. Performance & SEO built in
- Semantic HTML, lazy-loaded images, minimal JS, system-cached assets
- Open Graph + Twitter cards, Organization + Product + Breadcrumb-ready schema
- `robots.txt`, `sitemap.xml`, canonical URLs, descriptive alt text
- Sticky nav, sticky/drawer cart, floating WhatsApp button, smooth reveal animations

---

Made for **flowerseverywhere.lk** · Order line **+94 77 788 8870**
TikTok [@flowercenter.colombo](https://www.tiktok.com/@flowercenter.colombo)
