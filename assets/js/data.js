/* =====================================================================
   Flowers Everywhere — Seed Catalogue
   This is the DEFAULT product data shipped with the site.
   The Admin panel edits a copy stored in the browser (localStorage) and
   can EXPORT an updated data file to replace this one before re-deploying.
   ===================================================================== */
window.FE_DATA = (function () {

  /* ---- Categories (edit freely in Admin) ---- */
  const categories = [
    { key: "roses",        name: "Roses",                   palette: "blush",  blurb: "Timeless silk & real-touch roses" },
    { key: "peonies",      name: "Peonies & Hydrangeas",    palette: "blush",  blurb: "Lush, full-bloom statement flowers" },
    { key: "orchids",      name: "Orchids",                 palette: "lavender", blurb: "Elegant cascading orchid stems" },
    { key: "tulips",       name: "Tulips & Lilies",         palette: "gold",   blurb: "Graceful spring-inspired stems" },
    { key: "bouquets",     name: "Signature Bouquets",      palette: "terracotta", blurb: "Ready-arranged designer bouquets" },
    { key: "greenery",     name: "Greenery & Foliage",      palette: "sage",   blurb: "Lifelike botanicals & leaves" },
    { key: "vases",        name: "Vases & Pots",            palette: "cream",  blurb: "Ceramic, glass & metal vessels" },
    { key: "centerpieces", name: "Centerpieces",            palette: "terracotta", blurb: "Show-stopping table arrangements" },
    { key: "wreaths",      name: "Wreaths & Garlands",      palette: "sage",   blurb: "Seasonal door & mantel décor" },
    { key: "gifts",        name: "Gift Sets",               palette: "gold",   blurb: "Curated gifting collections" },
  ];

  const colors = ["Blush","White","Ivory","Sage","Lavender","Gold","Terracotta","Dusty Pink","Burgundy","Champagne"];

  /* compact seed rows: [name, category, price, palette, color, flags, oldPrice?] */
  const rows = [
    ["Velvet Real-Touch Rose Stem", "roses", 950, "blush", "Blush", "new,best"],
    ["Ivory Garden Rose Bunch", "roses", 2450, "cream", "Ivory", "best,trend"],
    ["Burgundy Silk Rose Spray", "roses", 1850, "terracotta", "Burgundy", "new"],
    ["Champagne Rose Bundle (12 Stems)", "roses", 4200, "gold", "Champagne", "best", 5200],
    ["Dusty Pink Rose Bloom", "roses", 1120, "blush", "Dusty Pink", ""],
    ["Antique Rose Half-Bloom Trio", "roses", 1680, "blush", "Blush", "trend"],

    ["Full-Bloom Peony Stem", "peonies", 1350, "blush", "Blush", "best,new"],
    ["Blush Hydrangea Cluster", "peonies", 1950, "blush", "Blush", "trend"],
    ["White Peony Luxe Bunch", "peonies", 3850, "cream", "White", "best", 4600],
    ["Coral Peony Duo", "peonies", 2100, "terracotta", "Terracotta", ""],
    ["Lavender Hydrangea Head", "peonies", 990, "lavender", "Lavender", "new"],

    ["Cascading Phalaenopsis Orchid", "orchids", 4800, "lavender", "White", "best,trend"],
    ["Potted Mini Orchid", "orchids", 3200, "lavender", "Lavender", "new"],
    ["Dendrobium Orchid Spray", "orchids", 2650, "lavender", "White", ""],
    ["Butterfly Orchid Stem", "orchids", 1450, "lavender", "White", "trend"],

    ["French Tulip Bundle (10 Stems)", "tulips", 2850, "gold", "Champagne", "new,best"],
    ["Real-Touch Calla Lily", "tulips", 1250, "cream", "Ivory", ""],
    ["Stargazer Lily Stem", "tulips", 1580, "blush", "Dusty Pink", "trend"],
    ["Golden Tulip Trio", "tulips", 1180, "gold", "Gold", ""],

    ["The Serene Bouquet", "bouquets", 6800, "blush", "Blush", "best,trend", 7900],
    ["Tuscan Sunset Bouquet", "bouquets", 7500, "terracotta", "Terracotta", "new,best"],
    ["Whispering Meadow Bouquet", "bouquets", 5900, "sage", "Sage", "trend"],
    ["Pearl & Ivory Bridal Bouquet", "bouquets", 9800, "cream", "Ivory", "best"],
    ["Blushing Garden Posy", "bouquets", 4300, "blush", "Blush", "new"],

    ["Eucalyptus Greenery Stem", "greenery", 850, "sage", "Sage", "best"],
    ["Trailing Ivy Vine (2m)", "greenery", 1650, "sage", "Sage", "new,trend"],
    ["Monstera Leaf Spray", "greenery", 1350, "sage", "Sage", "trend"],
    ["Olive Branch Bunch", "greenery", 1780, "sage", "Sage", "best"],
    ["Fern & Fillers Mixed Pack", "greenery", 990, "sage", "Sage", ""],

    ["Fluted Ceramic Vase — Sand", "vases", 3600, "cream", "Ivory", "best,new"],
    ["Ribbed Glass Bud Vase", "vases", 1450, "cream", "Champagne", "trend"],
    ["Brushed Gold Bottle Vase", "vases", 4200, "gold", "Gold", "best"],
    ["Matte Stone Pedestal Pot", "vases", 5200, "cream", "Ivory", "new"],
    ["Terracotta Textured Planter", "vases", 2900, "terracotta", "Terracotta", ""],

    ["Grand Table Centerpiece", "centerpieces", 11500, "terracotta", "Terracotta", "best,trend", 13500],
    ["Low Bowl Rose Centerpiece", "centerpieces", 6900, "blush", "Blush", "best"],
    ["Candlelit Greenery Runner", "centerpieces", 8200, "sage", "Sage", "new,trend"],
    ["Modern Minimalist Centerpiece", "centerpieces", 5400, "cream", "Ivory", ""],

    ["Seasonal Spring Wreath", "wreaths", 4800, "sage", "Sage", "new,best"],
    ["Eucalyptus Door Garland (1.8m)", "wreaths", 3900, "sage", "Sage", "trend"],
    ["Blush Bloom Wreath", "wreaths", 5600, "blush", "Blush", "best"],
    ["Autumn Harvest Wreath", "wreaths", 4400, "terracotta", "Terracotta", ""],

    ["The Everyday Elegance Gift Set", "gifts", 7900, "gold", "Champagne", "best,new", 9200],
    ["Petite Posy & Vase Gift Box", "gifts", 4600, "blush", "Blush", "trend"],
    ["Luxury Home Fragrance & Blooms", "gifts", 8800, "gold", "Gold", "best"],
    ["Housewarming Botanical Bundle", "gifts", 6200, "sage", "Sage", "new"],
  ];

  const shortDescs = {
    roses: "Premium real-touch petals with a natural, hand-finished look that lasts for years.",
    peonies: "Lush, full-bloom heads that bring soft romance to any room — no water, no wilting.",
    orchids: "Elegant, lifelike orchid stems that add a quiet, sculptural luxury to your space.",
    tulips: "Graceful stems with a delicate spring feel and a beautifully realistic finish.",
    bouquets: "A designer-arranged bouquet, ready to style straight out of the box.",
    greenery: "Botanically accurate foliage to layer, fill and soften any arrangement.",
    vases: "A considered vessel crafted to elevate your blooms and your tabletop.",
    centerpieces: "A statement arrangement designed to anchor your dining or console table.",
    wreaths: "Seasonal door and mantel décor, handcrafted for a warm welcome.",
    gifts: "A thoughtfully curated set — beautifully boxed and ready to gift.",
  };

  const longDesc = "Crafted from premium real-touch and silk materials, this piece is designed to look and feel remarkably lifelike. Unlike fresh flowers, it never wilts — simply dust occasionally to keep it looking its best for years. Each item is hand-finished, so subtle natural variations make every stem unique. A beautiful, low-maintenance way to bring lasting colour and warmth into your home, event or gift.";

  function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
  function flagset(f){ const a=(f||"").split(",").map(x=>x.trim()).filter(Boolean); return {
    isNew:a.includes("new"), isBest:a.includes("best"), isTrending:a.includes("trend") }; }

  // Curated minimalist flower photos (Unsplash — free, permanent, hotlink-safe).
  // Each product gets its category's photos; if any ever fails to load the site
  // falls back to a clean generated graphic. Replace with your own photos in Admin.
  const U = (id, w) => "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&q=70&w=" + (w || 800);
  const catPhotos = {
    roses:        [U("1502809737437-1d85c70dd2ca"), U("1526642738196-ad8ed2d50805"), U("1620223437074-594368cad589")],
    peonies:      [U("1620223437074-594368cad589"), U("1526642738196-ad8ed2d50805"), U("1567978575885-e1c8f4fda634")],
    orchids:      [U("1556557753-4d7eb13e06c4"), U("1520025925072-e27e41e14681"), U("1526642738196-ad8ed2d50805")],
    tulips:       [U("1526642738196-ad8ed2d50805"), U("1542491873-564432bfb050"), U("1620223437074-594368cad589")],
    bouquets:     [U("1567978575885-e1c8f4fda634"), U("1532204182725-d0f67855ac87"), U("1620223437074-594368cad589")],
    greenery:     [U("1466781783364-36c955e42a7f"), U("1542491873-564432bfb050"), U("1501301466131-127da9f28100")],
    vases:        [U("1532204182725-d0f67855ac87"), U("1567978575885-e1c8f4fda634"), U("1621341104239-d11fd41673ec")],
    centerpieces: [U("1494058303350-0bd5a9ecc5d3"), U("1532204182725-d0f67855ac87"), U("1620223437074-594368cad589")],
    wreaths:      [U("1501301466131-127da9f28100"), U("1466781783364-36c955e42a7f"), U("1494058303350-0bd5a9ecc5d3")],
    gifts:        [U("1621341104239-d11fd41673ec"), U("1695277898993-729e5b79585f"), U("1567978575885-e1c8f4fda634")],
  };
  const rotate = (arr, n) => { n = ((n % arr.length) + arr.length) % arr.length; return arr.slice(n).concat(arr.slice(0, n)); };

  const baseDate = new Date("2026-05-01").getTime();
  const products = rows.map((r, i) => {
    const [name, category, price, palette, color, flags, oldPrice] = r;
    const fl = flagset(flags);
    const created = new Date(baseDate - (rows.length - i) * 86400000).toISOString();
    return {
      id: "FE" + String(1001 + i),
      slug: slugify(name),
      name, category, price,
      oldPrice: oldPrice || null,
      palette, color,
      shortDesc: shortDescs[category],
      longDesc,
      stock: (i % 11 === 5) ? "out" : "in",
      featured: fl.isBest || i % 4 === 0,
      isNew: fl.isNew,
      isBest: fl.isBest,
      isTrending: fl.isTrending,
      archived: false,
      status: "published",
      images: rotate(catPhotos[category] || catPhotos.roses, i),
      imageCount: 3,         // generated fallback variants if a photo fails to load
      alt: name + " — premium artificial flowers by Flowers Everywhere",
      createdAt: created,
      updatedAt: created,
    };
  });

  return {
    version: 1,
    categories,
    colors,
    products,
    collections: [
      { key: "wedding", name: "The Wedding Edit", blurb: "Timeless whites, ivories & blush for the big day", palette: "cream" },
      { key: "everyday", name: "Everyday Elegance", blurb: "Effortless blooms for the console, desk & kitchen", palette: "sage" },
      { key: "seasonal", name: "Seasonal Warmth", blurb: "Terracotta, gold & autumnal tones for the season", palette: "terracotta" },
    ],
    categoryImages: catPhotos,
    siteImages: {
      hero: U("1567978575885-e1c8f4fda634", 1000),
      banner: U("1532204182725-d0f67855ac87", 1400),
      wedding: U("1532204182725-d0f67855ac87"),
      everyday: U("1466781783364-36c955e42a7f"),
      seasonal: U("1621341104239-d11fd41673ec"),
      instagram: [U("1526642738196-ad8ed2d50805", 400), U("1556557753-4d7eb13e06c4", 400), U("1532204182725-d0f67855ac87", 400), U("1620223437074-594368cad589", 400), U("1466781783364-36c955e42a7f", 400), U("1502809737437-1d85c70dd2ca", 400)],
    },
  };
})();
