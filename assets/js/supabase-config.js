/* =====================================================================
   Flowers Everywhere — Supabase client + shared helpers.
   Loaded AFTER the supabase-js CDN bundle (which exposes window.supabase)
   and BEFORE admin.js / the storefront data loader.

   The publishable key is SAFE to expose in client code by design — every
   write is gated by row-level security + an authenticated admin session
   (see supabase/schema.sql). It can only READ public data on its own.
   ===================================================================== */
(function () {
  "use strict";

  var SUPABASE_URL = "https://eqcjvaspagwmiezqmgiy.supabase.co";
  var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_OiQz4PO-EoRZFnPbZAxeHw_nEhZaaPe";

  // Admin usernames are mapped to a fixed internal address so the login
  // screen can show a plain "Username" field. Must match the domain of
  // the email the admin auth user was created with in Supabase — the
  // account exists as admin1@flowerseverywhere.com, so username `admin1`
  // maps to it. (Typing a full email in the field still works too.)
  var ADMIN_EMAIL_DOMAIN = "flowerseverywhere.com";

  if (!window.supabase || !window.supabase.createClient) {
    console.error("[FE] supabase-js failed to load — check the CDN <script> tag.");
    return;
  }

  window.FE_SB = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  // ---- camelCase (app) <-> snake_case (DB) mapping ------------------
  function rowToProduct(r) {
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      price: Number(r.price) || 0,
      oldPrice: r.old_price != null ? Number(r.old_price) : null,
      color: r.color || "",
      colors: Array.isArray(r.colors) ? r.colors : [],
      colorImages: Array.isArray(r.color_images) ? r.color_images : [],
      stock: r.stock || "in",
      status: r.status || "published",
      shortDesc: r.short || "",
      longDesc: r.long || "",
      alt: r.alt || "",
      images: Array.isArray(r.images) ? r.images : [],
      featured: !!r.featured,
      isNew: !!r.is_new,
      isBest: !!r.is_best,
      isTrending: !!r.is_trending,
      // status 'archived' is the admin's archive concept (hidden from store)
      archived: r.status === "archived",
      slug: (r.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      imageCount: 3,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function productToRow(p) {
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price) || 0,
      old_price: (p.oldPrice === "" || p.oldPrice == null) ? null : Number(p.oldPrice),
      color: p.color || "",
      colors: Array.isArray(p.colors) ? p.colors : [],
      color_images: Array.isArray(p.colorImages) ? p.colorImages : [],
      stock: p.stock || "in",
      status: p.archived ? "archived" : (p.status || "published"),
      short: p.shortDesc || "",
      long: p.longDesc || "",
      alt: p.alt || "",
      images: Array.isArray(p.images) ? p.images : [],
      is_new: !!p.isNew,
      is_best: !!p.isBest,
      is_trending: !!p.isTrending,
      featured: !!p.featured,
    };
  }

  function adminEmail(username) {
    var u = String(username || "").trim();
    return u.indexOf("@") >= 0 ? u : (u + "@" + ADMIN_EMAIL_DOMAIN);
  }

  /* Storefront loader (used in Stage 2): pull the live catalogue into
     window.FE_DATA so the existing Store/render code shows Supabase data.
     Falls back silently to the shipped data.js if the fetch fails or
     returns nothing, so the site can never render blank. */
  async function loadCatalogue() {
    try {
      var res = await Promise.all([
        window.FE_SB.from("products").select("*").neq("status", "archived").order("created_at", { ascending: false }).limit(2000),
        window.FE_SB.from("categories").select("*").order("sort", { ascending: true }),
      ]);
      var pr = res[0], cr = res[1];
      if (pr.error || cr.error) return false;
      window.FE_DATA = window.FE_DATA || {};
      // Merge: live Supabase products FIRST, then the bundled demo products
      // as static filler so the storefront never looks empty while the real
      // catalogue is being built. The admin only ever sees the live Supabase
      // products, so the demo filler can't be edited/deleted there. When the
      // real catalogue is ready, change this line to just `live`.
      var demo = Array.isArray(window.FE_DATA.products) ? window.FE_DATA.products.slice() : [];
      var live = Array.isArray(pr.data) ? pr.data.map(rowToProduct) : [];
      var seen = {};
      live.forEach(function (p) { seen[p.id] = true; });
      window.FE_DATA.products = live.concat(demo.filter(function (p) { return !seen[p.id]; }));
      if (Array.isArray(cr.data) && cr.data.length) {
        window.FE_DATA.categories = cr.data.map(function (c) {
          return { key: c.key, name: c.name, palette: c.palette, blurb: c.blurb, sort: c.sort };
        });
      }
      return true;
    } catch (e) {
      console.warn("[FE] Supabase catalogue load failed; using bundled data.", e);
      return false;
    }
  }

  window.FE_SB_HELPERS = {
    rowToProduct: rowToProduct,
    productToRow: productToRow,
    adminEmail: adminEmail,
    loadCatalogue: loadCatalogue,
  };
})();
