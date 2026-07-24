/* Homepage dynamic sections */
(function () {
  const { Store, UI, esc, productImage, I, money } = window.FE;

  document.addEventListener("DOMContentLoaded", () => {
    FE.UI.init("home");

    const all = Store.getProducts();

    const kwMap = {
      roses: "rose", peonies: "peony", orchids: "orchid", tulips: "tulip",
      bouquets: "bouquet", greenery: "eucalyptus", vases: "vase",
      centerpieces: "flower,arrangement", wreaths: "wreath,flowers", gifts: "flowers,bouquet",
    };

    // Category tiles
    const catWrap = FE.$("#homeCategories");
    if (catWrap) {
      const catPhotos = (window.FE_DATA && FE_DATA.categoryImages) || {};
      catWrap.innerHTML = Store.getCategories().slice(0, 8).map((c, idx) => {
        const photos = catPhotos[c.key] || [];
        const img = photos.length
          ? FE.webImgHTML(photos[0], { w: 600, h: 800, alt: c.name, palette: c.palette, id: c.key, name: c.name })
          : FE.imgHTML({ palette: c.palette, id: c.key, name: c.name }, 0, { w: 600, h: 800, alt: c.name });
        return `<a class="cat-card reveal" href="shop.html?category=${c.key}">
          ${img}
          <div class="cat-card__label"><h3>${esc(c.name)}</h3><span>${esc(c.blurb || "")}</span></div>
        </a>`;
      }).join("");
    }

    // New arrivals
    UI.renderProducts(FE.$("#homeNew"), all.filter(p => p.isNew).slice(0, 4).length ? all.filter(p => p.isNew).slice(0, 4) : all.slice(0, 4));
    // Best sellers
    UI.renderProducts(FE.$("#homeBest"), all.filter(p => p.isBest).slice(0, 4).length ? all.filter(p => p.isBest).slice(0, 4) : all.slice(4, 8));
    // Trending
    UI.renderProducts(FE.$("#homeTrending"), all.filter(p => p.isTrending).slice(0, 8).length ? all.filter(p => p.isTrending).slice(0, 8) : all.slice(0, 8));

    // Collections
    const colWrap = FE.$("#homeCollections");
    if (colWrap) {
      const si = (window.FE_DATA && FE_DATA.siteImages) || {};
      colWrap.innerHTML = Store.getCollections().map((c) => `
        <a class="collection-card reveal" href="shop.html">
          ${si[c.key] ? FE.webImgHTML(si[c.key], { w: 800, h: 600, alt: c.name, palette: c.palette, id: c.key, name: c.name }) : FE.imgHTML({ palette: c.palette, id: c.key, name: c.name }, 1, { w: 800, h: 600, alt: c.name })}
          <div class="collection-card__body">
            <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
            <span class="btn btn--light btn--sm">Explore</span>
          </div>
        </a>`).join("");
    }

    // Instagram gallery (placeholder tiles link to real profile)
    const ig = FE.$("#homeInstagram");
    if (ig) {
      const igPal = ["blush", "sage", "gold", "lavender", "terracotta", "cream"];
      const igPhotos = (window.FE_DATA && FE_DATA.siteImages && FE_DATA.siteImages.instagram) || [];
      ig.innerHTML = igPal.map((pal, i) => `
        <a class="ig-item reveal" href="${FE.CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok post">
          ${igPhotos[i] ? FE.webImgHTML(igPhotos[i], { w: 400, h: 400, alt: "Flowers Everywhere on TikTok", palette: pal, id: "ig" + i, name: "TikTok" }) : FE.imgHTML({ palette: pal, id: "ig" + i, name: "TikTok" }, i % 3, { w: 400, h: 400, alt: "Flowers Everywhere on TikTok" })}
          <span class="ig-ic">${I.tt}</span>
        </a>`).join("");
    }

    // Newsletter (front-end only)
    const nf = FE.$("#newsletterForm");
    if (nf) nf.addEventListener("submit", e => { e.preventDefault(); nf.reset(); UI.toast("Thanks — you're on the list!", true); });

    // Re-observe reveal animations for content injected above (categories,
    // collections, Instagram) so they fade in instead of staying hidden.
    FE.UI.reveal();
  });
})();
