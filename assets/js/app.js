/* =====================================================================
   Flowers Everywhere — Core engine (config, store, cart, UI, WhatsApp)
   Loaded on every storefront page (after data.js).
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  CONFIG                                                             */
  /* ------------------------------------------------------------------ */
  const CONFIG = {
    brand: "Flowers Everywhere",
    tagline: "Artificial Flowers & Home Décor",
    waNumber: "94777888870",              // digits only, intl format (0777888870)
    phoneDisplay: "+94 77 788 8870",
    tiktok: "https://www.tiktok.com/@flowercenter.colombo",
    tiktokHandle: "@flowercenter.colombo",
    domain: "flowerseverywhere.lk",
    currency: "Rs.",
    freeShipThreshold: 15000,
    keys: {
      products: "fe_products_v1",
      categories: "fe_categories_v1",
      collections: "fe_collections_v1",
      cart: "fe_cart_v1",
      analytics: "fe_analytics_v1",
      admin: "fe_admin_v1",
      orderSeq: "fe_order_seq_v1",
    },
  };

  /* ------------------------------------------------------------------ */
  /*  UTIL                                                               */
  /* ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => CONFIG.currency + " " + Number(n || 0).toLocaleString("en-LK");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  /* ------------------------------------------------------------------ */
  /*  IMAGE ENGINE — elegant generated SVG placeholders                 */
  /*  (Owner can replace with real photo URLs in Admin.)                */
  /* ------------------------------------------------------------------ */
  const PALETTES = {
    blush:      { bg1: "#F6E7E1", bg2: "#E7CFC6", b1: "#D98C7A", b2: "#EBABA0", leaf: "#A9B7A5", vase: "#EADbCF" },
    cream:      { bg1: "#F5EFE6", bg2: "#E8DFD3", b1: "#D8C09A", b2: "#EAD9BC", leaf: "#A9B7A5", vase: "#DFD3C2" },
    sage:       { bg1: "#E0E7DC", bg2: "#C6D2C0", b1: "#8FA382", b2: "#B7C6AC", leaf: "#6F8467", vase: "#D3DACB" },
    gold:       { bg1: "#F3E9D2", bg2: "#E4D2A8", b1: "#C9A24B", b2: "#E1C888", leaf: "#A9B7A5", vase: "#E5D4AE" },
    lavender:   { bg1: "#EAE3F0", bg2: "#D6CBE4", b1: "#9B84C0", b2: "#BEACD9", leaf: "#A9B7A5", vase: "#DED4E6" },
    terracotta: { bg1: "#F1DECF", bg2: "#E0BBA5", b1: "#C0764F", b2: "#D89C79", leaf: "#8FA382", vase: "#E6C7B2" },
  };
  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return Math.abs(h); }
  function petalGroup(cx, cy, r, c1, c2, petals, rot) {
    let s = "";
    // outer ring of petals
    for (let i = 0; i < petals; i++) {
      const a = rot + (i * 2 * Math.PI) / petals;
      const px = cx + Math.cos(a) * r * 0.52;
      const py = cy + Math.sin(a) * r * 0.52;
      s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r*0.6).toFixed(1)}" ry="${(r*0.33).toFixed(1)}" fill="${c2}" transform="rotate(${(a*180/Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})" opacity="0.9"/>`;
    }
    // inner ring, offset for a layered rose look
    for (let i = 0; i < petals; i++) {
      const a = rot + ((i + 0.5) * 2 * Math.PI) / petals;
      const px = cx + Math.cos(a) * r * 0.26;
      const py = cy + Math.sin(a) * r * 0.26;
      s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r*0.4).toFixed(1)}" ry="${(r*0.24).toFixed(1)}" fill="${c1}" transform="rotate(${(a*180/Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})" opacity="0.97"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${(r*0.22).toFixed(1)}" fill="${c2}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${(r*0.1).toFixed(1)}" fill="rgba(60,40,30,0.12)"/>`;
    return s;
  }
  // Minimalist single-stem flower: light background, one bloom colour, soft
  // green stem — calm and consistent across the whole site.
  function genSVG(product, variant) {
    const pal = PALETTES[product.palette] || PALETTES.blush;
    const v = (variant || 0) % 3;
    const cx = 400, cy = 300 + v * 10, r = 120 - v * 10;
    const petals = 6;
    const rot = 0.3 * v;
    let blm = "";
    for (let i = 0; i < petals; i++) {
      const a = rot + (i * 2 * Math.PI) / petals;
      const px = cx + Math.cos(a) * r * 0.5;
      const py = cy + Math.sin(a) * r * 0.5;
      blm += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r * 0.5).toFixed(1)}" ry="${(r * 0.27).toFixed(1)}" fill="${pal.b1}" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${esc(product.alt || product.name || "Flower")}">
      <rect width="800" height="800" fill="${pal.bg1}"/>
      <line x1="400" y1="${cy + r * 0.35}" x2="400" y2="672" stroke="${pal.leaf}" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="356" cy="500" rx="48" ry="17" fill="${pal.leaf}" transform="rotate(-30 356 500)"/>
      <ellipse cx="444" cy="540" rx="44" ry="16" fill="${pal.leaf}" transform="rotate(30 444 540)"/>
      <g>${blm}</g>
      <circle cx="400" cy="${cy}" r="${(r * 0.26).toFixed(1)}" fill="#FBF7F0"/>
      <circle cx="400" cy="${cy}" r="${(r * 0.12).toFixed(1)}" fill="${pal.b2}"/>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace(/\s{2,}/g, " "));
  }
  function stockImage(keyword, lock, w, h) {
    return "https://loremflickr.com/" + (w || 800) + "/" + (h || 800) + "/" + encodeURIComponent(keyword) + "?lock=" + (lock || 1);
  }
  function stockImgHTML(keyword, opts) {
    opts = opts || {};
    const w = opts.w || 800, h = opts.h || 800;
    const src = stockImage(keyword, opts.lock || 1, w, h);
    const fb = genSVG({ palette: opts.palette || "blush", id: opts.id || keyword, name: opts.name || keyword }, opts.variant || 0);
    const cls = opts.cls ? ' class="' + opts.cls + '"' : "";
    const alt = esc(opts.alt || opts.name || keyword);
    return '<img src="' + src + '"' + cls + ' alt="' + alt + '" loading="lazy" width="' + w + '" height="' + h +
      '" data-fb="' + fb + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">';
  }
  function productImage(product, variant) {
    variant = variant || 0;
    if (product.images && product.images[variant]) return product.images[variant];
    if (product.images && product.images.length) return product.images[Math.min(variant, product.images.length - 1)];
    return genSVG(product, variant);
  }
  function productGallery(product) {
    if (product.images && product.images.length) return product.images.slice();
    const n = product.imageCount || 3;
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(genSVG(product, i));
    return arr;
  }
  // Build a product <img> tag with an automatic fallback to the generated
  // graphic if the real photo fails to load.
  function imgHTML(product, variant, opts) {
    opts = opts || {}; variant = variant || 0;
    const real = productImage(product, variant);
    const fb = genSVG(product, variant);
    const alt = esc(opts.alt != null ? opts.alt : (product.alt || product.name || ""));
    const cls = opts.cls ? ' class="' + opts.cls + '"' : "";
    const dims = (opts.w ? ' width="' + opts.w + '"' : "") + (opts.h ? ' height="' + opts.h + '"' : "");
    const loading = opts.eager ? "" : ' loading="lazy"';
    const fbAttr = real === fb ? "" : ' data-fb="' + fb + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')"';
    return '<img src="' + real + '"' + cls + ' alt="' + alt + '"' + dims + loading + fbAttr + '>';
  }
  // Image tag for a direct photo URL (categories, collections, hero) with a
  // generated-graphic fallback if the photo fails to load.
  function webImgHTML(url, opts) {
    opts = opts || {};
    const w = opts.w || 800, h = opts.h || 800;
    const fb = genSVG({ palette: opts.palette || "blush", id: opts.id || "x", name: opts.name || "" }, opts.variant || 0);
    const cls = opts.cls ? ' class="' + opts.cls + '"' : "";
    const alt = esc(opts.alt || opts.name || "Flowers Everywhere");
    const load = opts.eager ? ' fetchpriority="high"' : ' loading="lazy"';
    return '<img src="' + url + '"' + cls + ' alt="' + alt + '" width="' + w + '" height="' + h + '"' + load +
      ' data-fb="' + fb + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">';
  }

  /* ------------------------------------------------------------------ */
  /*  STORE — products & categories                                     */
  /* ------------------------------------------------------------------ */
  const Store = {
    getAllProducts() {
      const override = load(CONFIG.keys.products, null);
      return (override && Array.isArray(override) && override.length) ? override : (window.FE_DATA ? window.FE_DATA.products : []);
    },
    setAllProducts(list) { save(CONFIG.keys.products, list); document.dispatchEvent(new CustomEvent("fe:data")); },
    getProducts() { return this.getAllProducts().filter(p => !p.archived && p.status !== "draft"); },
    getCategories() {
      const override = load(CONFIG.keys.categories, null);
      return (override && override.length) ? override : (window.FE_DATA ? window.FE_DATA.categories : []);
    },
    setCategories(list) { save(CONFIG.keys.categories, list); },
    getCollections() {
      const override = load(CONFIG.keys.collections, null);
      return (override && override.length) ? override : (window.FE_DATA ? window.FE_DATA.collections : []);
    },
    categoryName(key) { const c = this.getCategories().find(c => c.key === key); return c ? c.name : key; },
    byId(id) { return this.getAllProducts().find(p => p.id === id); },
    bySlug(slug) { return this.getProducts().find(p => p.slug === slug); },
    related(product, n) {
      n = n || 4;
      return this.getProducts().filter(p => p.id !== product.id && p.category === product.category)
        .concat(this.getProducts().filter(p => p.id !== product.id && p.category !== product.category))
        .slice(0, n);
    },
    reset() { localStorage.removeItem(CONFIG.keys.products); localStorage.removeItem(CONFIG.keys.categories); document.dispatchEvent(new CustomEvent("fe:data")); },
  };

  /* ------------------------------------------------------------------ */
  /*  COLOUR SWATCHES                                                    */
  /* ------------------------------------------------------------------ */
  // Best-effort map of common colour names → a swatch hex, so the chips
  // show a little dot. Unknown names fall back to a soft multi-tone dot.
  const COLOR_HEX = {
    red:"#C0392B", crimson:"#B02A37", pink:"#F4A7B9", "hot pink":"#E84B8A", blush:"#E7CFC6",
    white:"#FFFFFF", "off-white":"#F4F1E8", cream:"#F3EADB", ivory:"#F5F0E1",
    yellow:"#F2C94C", mustard:"#D4A017", orange:"#E67E22", peach:"#FFCBA4", apricot:"#F4B26B",
    purple:"#8E44AD", violet:"#7A4FB0", lavender:"#C7B8EA", lilac:"#C8A2C8", mauve:"#B784A7", plum:"#7B4A6B",
    blue:"#3B7DD8", navy:"#2C3E70", "sky blue":"#87BCE8", teal:"#2A9D8F", turquoise:"#40C0C0",
    green:"#4B7B5B", sage:"#A9B7A5", mint:"#B9E4C9", olive:"#7C7A3A", emerald:"#2E8B57",
    burgundy:"#6E1E2B", maroon:"#7B2233", wine:"#722F37", gold:"#C9A24B", champagne:"#E9DCC3", bronze:"#B08D57",
    black:"#2C2723", grey:"#9A9187", gray:"#9A9187", silver:"#C8C8C8", brown:"#8B5E3C", tan:"#D2B48C",
    terracotta:"#B0674B", coral:"#FF7F6B", salmon:"#F09080", rose:"#D98C9A", fuchsia:"#C74B8B", magenta:"#C2185B",
  };
  function colorHex(name) {
    const k = String(name || "").trim().toLowerCase();
    if (COLOR_HEX[k]) return COLOR_HEX[k];
    const parts = k.split(/\s+/);
    for (let i = parts.length - 1; i >= 0; i--) { if (COLOR_HEX[parts[i]]) return COLOR_HEX[parts[i]]; }
    return null;
  }
  function colorDot(name) {
    const hex = colorHex(name);
    const style = hex
      ? "background:" + hex + (hex === "#FFFFFF" ? ";box-shadow:inset 0 0 0 1px var(--line)" : "")
      : "background:conic-gradient(from 0deg,#e7cfc6,#a9b7a5,#c9a24b,#c8a2c8,#e7cfc6)";
    return '<span class="color-dot" style="' + style + '"></span>';
  }

  /* ------------------------------------------------------------------ */
  /*  CART                                                               */
  /* ------------------------------------------------------------------ */
  const Cart = {
    items: load(CONFIG.keys.cart, []),
    _persist() { save(CONFIG.keys.cart, this.items); document.dispatchEvent(new CustomEvent("fe:cart")); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    qtyOf(id) { const l = this.items.find(i => i.id === id); return l ? l.qty : 0; },
    add(id, qty, color) {
      qty = qty || 1;
      const line = this.items.find(i => i.id === id);
      if (line) { line.qty += qty; if (color) line.color = color; }
      else this.items.push({ id, qty, color: color || "" });
      this._persist();
      Analytics.track("add_to_cart", id);
    },
    setQty(id, qty) {
      const line = this.items.find(i => i.id === id);
      if (!line) return;
      line.qty = qty;
      if (line.qty <= 0) this.remove(id); else this._persist();
    },
    // Update the chosen colour for a line already in the cart.
    setColor(id, color) {
      const line = this.items.find(i => i.id === id);
      if (!line) return;
      line.color = color || "";
      this._persist();
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this._persist(); },
    clear() { this.items = []; this._persist(); },
    lines() {
      return this.items.map(i => {
        const p = Store.byId(i.id);
        return p ? { product: p, qty: i.qty, total: p.price * i.qty, color: i.color || "" } : null;
      }).filter(Boolean);
    },
    subtotal() { return this.lines().reduce((s, l) => s + l.total, 0); },
  };

  /* ------------------------------------------------------------------ */
  /*  ANALYTICS (basic, local)                                          */
  /* ------------------------------------------------------------------ */
  const Analytics = {
    track(event, ref) {
      const a = load(CONFIG.keys.analytics, { views: {}, events: [], checkouts: 0 });
      if (event === "view" && ref) a.views[ref] = (a.views[ref] || 0) + 1;
      if (event === "checkout") a.checkouts = (a.checkouts || 0) + 1;
      a.events.push({ event, ref: ref || null, t: Date.now() });
      if (a.events.length > 500) a.events = a.events.slice(-500);
      save(CONFIG.keys.analytics, a);
    },
    get() { return load(CONFIG.keys.analytics, { views: {}, events: [], checkouts: 0 }); },
  };

  /* ------------------------------------------------------------------ */
  /*  WHATSAPP CHECKOUT                                                  */
  /* ------------------------------------------------------------------ */
  const DIV = "━━━━━━━━━━━━━━━━━━";
  const WhatsApp = {
    // Unique, backend-free order reference, e.g. FE-2026-000347
    nextOrderRef() {
      const seq = (load(CONFIG.keys.orderSeq, 0) || 0) + 1;
      save(CONFIG.keys.orderSeq, seq);
      return "FE-" + new Date().getFullYear() + "-" + String(seq).padStart(6, "0");
    },
    orderMessage(ref) {
      const lines = Cart.lines();
      const totalItems = lines.reduce((s, l) => s + l.qty, 0);
      let msg = "🌸 Hello " + CONFIG.brand + "!\n\n";
      msg += "I'd like to place an order.\n\n";
      msg += "Order Reference: " + ref + "\n\n";
      msg += DIV + "\n\n";
      msg += "Order Summary\n";
      lines.forEach((l, i) => {
        msg += "\n" + (i + 1) + ".\n";
        msg += "Product:\n" + l.product.name + "\n\n";
        msg += "Product ID:\n" + l.product.id + "\n\n";
        if (l.color) msg += "Colour:\n" + l.color + "\n\n";
        msg += "Quantity:\n" + l.qty + "\n\n";
        msg += "Unit Price:\n" + money(l.product.price) + "\n\n";
        msg += "Subtotal:\n" + money(l.total) + "\n\n";
        msg += DIV + "\n";
      });
      msg += "\nTotal Items:\n" + totalItems + "\n\n";
      msg += "Grand Total:\n" + money(Cart.subtotal()) + "\n\n";
      msg += "Please let me know whether these items are available and whether delivery or pickup is possible.\n\nThank you!";
      msg += "\n\n" + DIV + "\n\n📄 Printable invoice (tap to open, then Print / Save as PDF to forward):\n" + this.invoiceUrl(ref);
      return msg;
    },
    // Encodes the order into a link to invoice.html (order data rides in the
    // URL hash — no backend/storage). The shop taps it to open a clean,
    // printable invoice they can Save-as-PDF and forward to suppliers.
    invoiceUrl(ref) {
      const lines = Cart.lines();
      const order = {
        ref: ref,
        date: new Date().toISOString(),
        items: lines.map(l => ({ name: l.product.name, id: l.product.id, color: l.color || "", qty: l.qty, unit: l.product.price, total: l.total })),
        totalItems: lines.reduce((s, l) => s + l.qty, 0),
        grandTotal: Cart.subtotal(),
      };
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(order))));
      const origin = (typeof location !== "undefined" && location.origin) ? location.origin : ("https://" + CONFIG.domain);
      return origin + "/invoice.html#" + b64;
    },
    checkout() {
      if (!Cart.count()) { UI.toast("Your cart is empty"); return; }
      const ref = this.nextOrderRef();
      Analytics.track("checkout");
      const url = "https://wa.me/" + CONFIG.waNumber + "?text=" + encodeURIComponent(this.orderMessage(ref));
      window.open(url, "_blank");
    },
    inquiry(product) {
      const msg = "Hello " + CONFIG.brand + ", I'm interested in this product:\n\n" +
        product.name + " (" + product.id + ")\n" + money(product.price) + "\n\nIs it available? Thank you!";
      return "https://wa.me/" + CONFIG.waNumber + "?text=" + encodeURIComponent(msg);
    },
  };

  /* ------------------------------------------------------------------ */
  /*  ICONS                                                              */
  /* ------------------------------------------------------------------ */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.35-9.5-8.5C.5 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5.5 3.5 3.5 7C19 15.65 12 20 12 20z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.26-.1-.45-.15-.64.15s-.74.94-.9 1.13c-.17.2-.33.22-.62.08a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.07c-.17-.3 0-.46.13-.6.13-.14.29-.33.43-.5.14-.17.19-.29.29-.48.1-.2.05-.36-.02-.5-.08-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.2 2 3.05 4.85 4.28.68.29 1.2.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.93-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12 2a10 10 0 0 0-8.6 15.06L2 22l5.05-1.32A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .78.8-2.92-.2-.31A8.2 8.2 0 1 1 12 20.2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.55.45-1 1-1z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.7 3.6 3.6 3.9v2.5c-1.2 0-2.4-.3-3.5-.9v5.8c0 3-2.2 5.4-5.3 5.4A5.1 5.1 0 0 1 6.1 14c0-3 2.5-5.3 5.6-4.9v2.6c-.4-.1-.8-.2-1.2-.2-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5c1.4 0 2.5-1 2.5-2.7V3h3z"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20c8 2 16-4 16-16C10 4 2 10 4 20z"/><path d="M4 20C8 14 12 10 18 7"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l4 4L19 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8 11l8-4M8 13l8 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
    mark: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 4c3 4 3 8 0 12-3-4-3-8 0-12z" fill="#C89B84"/><path d="M16 16c4-3 8-3 12 0-4 3-8 3-12 0z" fill="#A9B7A5"/><path d="M16 16c-4-3-8-3-12 0 4 3 8 3 12 0z" fill="#B08D57"/><path d="M16 16c3 4 3 8 0 12-3-4-3-8 0-12z" fill="#D98C7A"/><circle cx="16" cy="16" r="2.6" fill="#2C2723"/></svg>',
  };

  /* ------------------------------------------------------------------ */
  /*  UI                                                                 */
  /* ------------------------------------------------------------------ */
  const UI = {
    productCard(p) {
      const badges = [];
      if (p.stock === "out") {} // sold out handled by class
      if (p.isNew) badges.push('<span class="badge badge--new">New</span>');
      if (p.isBest) badges.push('<span class="badge badge--best">Best Seller</span>');
      if (p.isTrending) badges.push('<span class="badge badge--trend">Trending</span>');
      // Discount: oldPrice holds the original (pre-discount) price, so the
      // percentage is derived from it. The cart charges p.price (already the
      // discounted amount), so the money flow needs no special handling.
      const offPct = (p.oldPrice && p.oldPrice > p.price)
        ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0;
      if (offPct > 0) badges.push('<span class="badge badge--discount">' + offPct + '% OFF</span>');
      const price = p.oldPrice
        ? `${money(p.price)}<span class="was">${money(p.oldPrice)}</span>`
        : money(p.price);
      const href = "product.html?id=" + encodeURIComponent(p.id);
      const colorPicker = (Array.isArray(p.colors) && p.colors.length)
        ? `<div class="color-picker" data-color-group="${p.id}" aria-label="Choose colour">
            ${p.colors.map((c, i) => `<button type="button" class="color-chip${i === 0 ? " is-selected" : ""}" data-color-pick="${p.id}" data-color="${esc(c)}" title="${esc(c)}" aria-pressed="${i === 0 ? "true" : "false"}">${colorDot(c)}<span>${esc(c)}</span></button>`).join("")}
          </div>`
        : "";
      return `<article class="product-card reveal${p.stock === "out" ? " is-out" : ""}" data-id="${p.id}">
        <a class="product-card__media" href="${href}" aria-label="${esc(p.name)}">
          ${imgHTML(p, 0, { w: 800, h: 800 })}
        </a>
        <div class="product-card__badges">${badges.join("")}</div>
        <button class="product-card__fav" aria-label="Add to wishlist" title="Wishlist">${I.heart}</button>
        <div class="product-card__body">
          <span class="product-card__sku">${esc(p.id)}</span>
          <a href="${href}"><h3 class="product-card__name">${esc(p.name)}</h3></a>
          <div class="product-card__price">${price}</div>
          ${colorPicker}
          <div class="qty-stepper" role="group" aria-label="Quantity">
            <button type="button" class="qty-btn" data-qty-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-val" data-qty-val="${p.id}">${Cart.qtyOf(p.id)}</span>
            <button type="button" class="qty-btn" data-qty-inc="${p.id}" aria-label="Add to cart">+</button>
          </div>
        </div>
      </article>`;
    },
    renderProducts(container, list) {
      if (!container) return;
      if (!list.length) { container.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>'; return; }
      container.innerHTML = list.map(p => this.productCard(p)).join("");
      // Re-arm the scroll-in reveal for the freshly injected cards.
      if (FE.UI && FE.UI.reveal) FE.UI.reveal();
    },

    mountHeader(active) {
      const cats = Store.getCategories();
      const catLinks = cats.slice(0, 6).map(c => `<a href="shop.html?category=${c.key}">${esc(c.name)}</a>`).join("");
      // Announce bar as a slow right-to-left marquee. The message is
      // repeated inside each sequence, and TWO identical sequences let the
      // track loop seamlessly (translateX -50% == one sequence width).
      const promo = "Free island-wide delivery on orders over " + money(CONFIG.freeShipThreshold) + " · Shop the new arrivals →";
      const promoSeq = new Array(4).fill('<span class="announce-msg">' + promo + '</span>').join("");
      const html = `
      <a class="announce" href="shop.html" aria-label="${esc(promo)}">
        <span class="announce-track">
          <span class="announce-seq">${promoSeq}</span>
          <span class="announce-seq" aria-hidden="true">${promoSeq}</span>
        </span>
      </a>`;
      const headerHtml = `
      <div class="site-header" id="siteHeader">
        <div class="container nav">
          <div class="nav-start">
            <button class="icon-btn menu-toggle" id="openMenu" aria-label="Menu">${I.menu}</button>
            <nav class="nav-links" aria-label="Primary">
              <a href="index.html" ${active==="home"?'class="active"':''}>Home</a>
              <a href="shop.html" ${active==="shop"?'class="active"':''}>Shop All</a>
              <a href="shop.html?filter=new">New Arrivals</a>
              <a href="shop.html?filter=best">Best Sellers</a>
              <a href="index.html#collections">Collections</a>
            </nav>
          </div>
          <a class="brand" href="index.html"><span class="mark">${I.mark}</span><span class="brand-txt">Flowers Everywhere<small>${esc(CONFIG.tagline)}</small></span></a>
          <div class="nav-actions">
            <button class="icon-btn" id="openSearch" aria-label="Search">${I.search}</button>
            <button class="icon-btn" id="openCart" aria-label="Cart">${I.bag}<span class="cart-count" id="cartCount">0</span></button>
          </div>
        </div>
      </div>`;
      const mount = $("[data-fe-header]");
      if (mount) mount.innerHTML = html + headerHtml;

      // Mobile nav
      const mnav = document.createElement("div");
      mnav.className = "mobile-nav"; mnav.id = "mobileNav";
      const mLink = (href, label) =>
        `<a class="m-link" href="${href}">${esc(label)}<span class="m-arrow" aria-hidden="true">→</span></a>`;
      mnav.innerHTML = `
        <div class="mobile-nav__scrim" data-close-menu></div>
        <div class="mobile-nav__panel">
          <div class="mobile-nav__head">
            <button class="icon-btn" data-close-menu aria-label="Close">${I.close}</button>
            <span class="brand" style="font-size:1.15rem;flex:1;justify-content:center">${CONFIG.brand}</span>
            <span style="width:42px"></span>
          </div>
          <nav class="m-links" aria-label="Mobile">
            ${mLink("index.html", "Home")}
            ${mLink("shop.html", "Shop All")}
            ${mLink("shop.html?filter=new", "New Arrivals")}
            ${mLink("shop.html?filter=best", "Best Sellers")}
            ${cats.map((c) => mLink("shop.html?category=" + c.key, c.name)).join("")}
          </nav>
          <div class="mobile-nav__foot">
            <a class="m-social" href="${CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt}</a>
            <a class="m-social" href="https://wa.me/${CONFIG.waNumber}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
          </div>
        </div>`;
      document.body.appendChild(mnav);

      // Search overlay
      const so = document.createElement("div");
      so.className = "search-overlay"; so.id = "searchOverlay";
      so.innerHTML = `
        <div class="search-box">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px">
            <span class="eyebrow">Search</span>
            <button class="icon-btn" data-close-search aria-label="Close">${I.close}</button>
          </div>
          <input type="search" id="searchInput" placeholder="Search flowers, vases, gifts…" autocomplete="off">
          <div class="search-hint">Try “roses”, “vase”, “FE1012” or “bouquet”</div>
          <div class="search-results" id="searchResults"></div>
        </div>`;
      document.body.appendChild(so);

      this._wireHeader();
      this.updateCartCount();
    },

    _wireHeader() {
      const header = $("#siteHeader");
      const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

      const mnav = $("#mobileNav");
      $("#openMenu") && $("#openMenu").addEventListener("click", () => mnav.classList.add("open"));
      $$("[data-close-menu]").forEach(b => b.addEventListener("click", () => mnav.classList.remove("open")));

      const so = $("#searchOverlay"), si = $("#searchInput");
      $("#openSearch") && $("#openSearch").addEventListener("click", () => { so.classList.add("open"); setTimeout(() => si.focus(), 60); });
      $$("[data-close-search]").forEach(b => b.addEventListener("click", () => so.classList.remove("open")));
      document.addEventListener("keydown", e => { if (e.key === "Escape") { so.classList.remove("open"); mnav.classList.remove("open"); this.closeCart(); } });
      si && si.addEventListener("input", () => this._runSearch(si.value));

      $("#openCart") && $("#openCart").addEventListener("click", () => this.openCart());

      // event delegation for add-to-cart buttons anywhere
      document.addEventListener("click", (e) => {
        const add = e.target.closest("[data-add]");
        if (add) { e.preventDefault(); Cart.add(add.getAttribute("data-add"), 1); this.toast("Added to cart", true); this.openCart(); }
        // Colour chip on a card — select it, and if the item is already in
        // the cart update its colour immediately.
        const cpick = e.target.closest("[data-color-pick]");
        if (cpick) {
          e.preventDefault();
          const cid = cpick.getAttribute("data-color-pick");
          const color = cpick.getAttribute("data-color");
          const group = cpick.closest("[data-color-group]");
          if (group) group.querySelectorAll(".color-chip").forEach((ch) => {
            const on = ch === cpick;
            ch.classList.toggle("is-selected", on);
            ch.setAttribute("aria-pressed", on ? "true" : "false");
          });
          if (Cart.qtyOf(cid) > 0) Cart.setColor(cid, color);
        }
        // Card quantity stepper (+/-) — adds/updates the cart in place,
        // carrying the card's currently-selected colour (if any).
        const inc = e.target.closest("[data-qty-inc]");
        if (inc) {
          e.preventDefault();
          const id = inc.getAttribute("data-qty-inc");
          const card = inc.closest(".product-card");
          const sel = card && card.querySelector(".color-chip.is-selected");
          Cart.add(id, 1, sel ? sel.getAttribute("data-color") : "");
          this._syncQty(id);
        }
        const dec = e.target.closest("[data-qty-dec]");
        if (dec) {
          e.preventDefault();
          const id = dec.getAttribute("data-qty-dec");
          Cart.setQty(id, Cart.qtyOf(id) - 1);
          this._syncQty(id);
        }
        const fav = e.target.closest(".product-card__fav");
        if (fav) { e.preventDefault(); this.toast("Saved to wishlist ♥"); }
      });
    },

    /// Update every on-screen quantity readout for a product to match the
    /// cart (a product can appear in multiple grids/rows at once).
    _syncQty(id) {
      const v = String(Cart.qtyOf(id));
      $$(`[data-qty-val="${id}"]`).forEach((el) => { el.textContent = v; });
    },
    _syncAllQty() {
      $$("[data-qty-val]").forEach((el) => {
        el.textContent = String(Cart.qtyOf(el.getAttribute("data-qty-val")));
      });
    },

    _runSearch(q) {
      const box = $("#searchResults");
      q = (q || "").trim().toLowerCase();
      if (!q) { box.innerHTML = ""; return; }
      const res = Store.getProducts().filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        Store.categoryName(p.category).toLowerCase().includes(q) ||
        (p.color || "").toLowerCase().includes(q) ||
        String(p.price).includes(q)
      ).slice(0, 8);
      box.innerHTML = res.length ? res.map(p => `
        <a class="search-result" href="product.html?id=${p.id}">
          ${imgHTML(p, 0, { alt: p.name })}
          <div><div class="sr-name">${esc(p.name)}</div><div class="sr-meta">${esc(Store.categoryName(p.category))} · ${p.id}</div></div>
          <div class="sr-price">${money(p.price)}</div>
        </a>`).join("") : '<p class="search-hint">No matches. Try another term.</p>';
    },

    mountFooter() {
      const cats = Store.getCategories();
      const html = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a class="brand" href="index.html"><span class="mark">${I.mark}</span><span class="brand-txt">Flowers Everywhere</span></a>
              <p>Sri Lanka's premium destination for lifelike artificial flowers and decorative pieces — beautifully crafted to last, and easy to order over WhatsApp.</p>
              <div class="social-row">
                <a href="${CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt}</a>
                <a href="https://wa.me/${CONFIG.waNumber}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Shop</h4>
              ${cats.slice(0,6).map(c=>`<a href="shop.html?category=${c.key}">${esc(c.name)}</a>`).join("")}
              <a href="shop.html">View all →</a>
            </div>
            <div class="footer-col">
              <h4>Help</h4>
              <a href="https://wa.me/${CONFIG.waNumber}" target="_blank">WhatsApp Us</a>
              <a href="tel:+${CONFIG.waNumber}">${esc(CONFIG.phoneDisplay)}</a>
              <a href="shop.html">How to Order</a>
              <a href="index.html#why">Why Choose Us</a>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <a href="tel:+${CONFIG.waNumber}">${esc(CONFIG.phoneDisplay)}</a>
              <a href="https://wa.me/${CONFIG.waNumber}" target="_blank">Order via WhatsApp</a>
              <a href="https://${CONFIG.domain}">${CONFIG.domain}</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${CONFIG.brand}. All rights reserved.</span>
            <span class="footer-legal"><a href="terms.html">Terms &amp; Conditions</a> · <a href="privacy.html">Privacy Policy</a></span>
            <span>Handcrafted in Sri Lanka · Ordered on WhatsApp</span>
          </div>
        </div>
      </footer>`;
      const mount = $("[data-fe-footer]");
      if (mount) mount.innerHTML = html;
    },

    mountGlobals() {
      // Cart drawer
      const drawer = document.createElement("div");
      drawer.className = "drawer"; drawer.id = "cartDrawer";
      drawer.innerHTML = `
        <div class="drawer__scrim" data-close-cart></div>
        <div class="drawer__panel">
          <div class="drawer__head"><h3>Your Cart</h3><button class="icon-btn" data-close-cart aria-label="Close">${I.close}</button></div>
          <div class="drawer__body" id="cartBody"></div>
          <div class="drawer__foot" id="cartFoot"></div>
        </div>`;
      document.body.appendChild(drawer);
      $$("[data-close-cart]").forEach(b => b.addEventListener("click", () => this.closeCart()));

      // WhatsApp float
      const wa = document.createElement("div");
      wa.className = "wa-float";
      wa.innerHTML = `<a href="https://wa.me/${CONFIG.waNumber}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${I.wa}</a>`;
      document.body.appendChild(wa);

      // Toast wrap
      const tw = document.createElement("div"); tw.className = "toast-wrap"; tw.id = "toastWrap";
      document.body.appendChild(tw);

      document.addEventListener("fe:cart", () => { this.updateCartCount(); this.renderCart(); this._syncAllQty(); });
      this.renderCart();
    },

    openCart() { $("#cartDrawer").classList.add("open"); this.renderCart(); },
    closeCart() { const d = $("#cartDrawer"); if (d) d.classList.remove("open"); },
    updateCartCount() {
      const el = $("#cartCount"); if (!el) return;
      const n = Cart.count(); el.textContent = n; el.classList.toggle("show", n > 0);
    },
    renderCart() {
      const body = $("#cartBody"), foot = $("#cartFoot");
      if (!body) return;
      const lines = Cart.lines();
      if (!lines.length) {
        body.innerHTML = `<div class="cart-empty">${I.bag}<p>Your cart is empty</p><a class="btn btn--ghost btn--sm" href="shop.html" style="margin-top:14px">Start shopping</a></div>`;
        foot.innerHTML = ""; return;
      }
      body.innerHTML = lines.map(l => `
        <div class="cart-line" data-id="${l.product.id}">
          ${imgHTML(l.product, 0, { alt: l.product.name })}
          <div class="cart-line__info">
            <div class="cart-line__name">${esc(l.product.name)}</div>
            ${l.color ? `<div class="cart-line__variant">${colorDot(l.color)}Colour: ${esc(l.color)}</div>` : ""}
            <div class="cart-line__price">${money(l.product.price)}</div>
            <div class="cart-line__row">
              <div class="qty">
                <button data-dec="${l.product.id}" aria-label="Decrease">−</button>
                <span>${l.qty}</span>
                <button data-inc="${l.product.id}" aria-label="Increase">+</button>
              </div>
              <button class="cart-line__remove" data-remove="${l.product.id}">Remove</button>
            </div>
          </div>
        </div>`).join("");
      const sub = Cart.subtotal();
      foot.innerHTML = `
        <div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(sub)}</span></div>
        <button class="btn btn--wa btn--block" id="waCheckout" style="margin-top:14px">${I.wa} Checkout on WhatsApp</button>
        <a class="btn btn--ghost btn--block" href="shop.html" style="margin-top:10px">Continue Shopping</a>
        <p class="search-hint" style="text-align:center;margin-top:12px">No online payment — you'll confirm your order in a WhatsApp chat.</p>`;
      body.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => { const id=b.getAttribute("data-inc"); const l=Cart.items.find(i=>i.id===id); Cart.setQty(id, l.qty+1); });
      body.querySelectorAll("[data-dec]").forEach(b => b.onclick = () => { const id=b.getAttribute("data-dec"); const l=Cart.items.find(i=>i.id===id); Cart.setQty(id, l.qty-1); });
      body.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => Cart.remove(b.getAttribute("data-remove")));
      foot.querySelector("#waCheckout").onclick = () => WhatsApp.checkout();
    },

    toast(msg, ok) {
      const wrap = $("#toastWrap"); if (!wrap) return;
      const t = document.createElement("div"); t.className = "toast";
      t.innerHTML = (ok ? I.check : "") + "<span>" + esc(msg) + "</span>";
      wrap.appendChild(t);
      requestAnimationFrame(() => t.classList.add("show"));
      setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 500); }, 2600);
    },

    reveal() {
      // Only elements not yet revealed, so repeat calls (after product
      // grids re-render) don't re-observe already-shown ones.
      const els = $$(".reveal:not(.in)");
      if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      els.forEach(e => io.observe(e));
    },

    init(active) {
      this.mountHeader(active);
      this.mountFooter();
      this.mountGlobals();
      this.reveal();
    },
  };

  /* ------------------------------------------------------------------ */
  /*  BOOT — load the live Supabase catalogue into FE_DATA, THEN render. */
  /*  Page scripts call FE.boot(main) instead of listening for           */
  /*  DOMContentLoaded directly. If Supabase isn't wired in or the fetch */
  /*  fails, it falls straight through to the bundled data.js so the      */
  /*  page always renders (never blank).                                  */
  /* ------------------------------------------------------------------ */
  function boot(cb) {
    const start = function () {
      const loader = window.FE_SB_HELPERS && window.FE_SB_HELPERS.loadCatalogue;
      if (loader) { loader().then(function () { cb(); }, function () { cb(); }); }
      else { cb(); }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }

  /* ------------------------------------------------------------------ */
  /*  EXPORT                                                             */
  /* ------------------------------------------------------------------ */
  window.FE = {
    CONFIG, Store, Cart, WhatsApp, Analytics, UI, I, boot,
    money, esc, slugify, $, $$, load, save, colorDot, colorHex,
    productImage, productGallery, imgHTML, webImgHTML, stockImage, stockImgHTML, genSVG, PALETTES,
  };
})();
