/* Homepage dynamic sections */
(function () {
  const { Store, UI, esc, productImage, I, money } = window.FE;

  FE.boot(() => {
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
      const isRealImg = (s) => /^(data:|https?:)/.test(s || "");
      // Auto-cover: if no explicit categoryImages entry, borrow the first
      // real product photo in that category so tiles show real imagery the
      // moment a catalogue is uploaded — no separate category-image upload
      // needed. Still falls back to the generated SVG when the category has
      // no photographed products yet (imgHTML also swaps to SVG on load
      // error, so a broken borrowed URL degrades gracefully).
      const catCover = (key) =>
        all.find((p) => p.category === key &&
          Array.isArray(p.images) && p.images.some(isRealImg)) || null;
      catWrap.innerHTML = Store.getCategories().slice(0, 8).map((c, idx) => {
        const photos = catPhotos[c.key] || [];
        const cover = catCover(c.key);
        const img = photos.length
          ? FE.webImgHTML(photos[0], { w: 600, h: 800, alt: c.name, palette: c.palette, id: c.key, name: c.name })
          : cover
            ? FE.imgHTML(cover, 0, { w: 600, h: 800, alt: c.name })
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

    // "Follow us on TikTok". If real TikTok video URLs are configured
    // (siteImages.tiktokVideos), render playable TikTok embeds; otherwise
    // fall back to placeholder tiles linking to the profile.
    const ig = FE.$("#homeInstagram");
    if (ig) {
      const vids = (window.FE_DATA && FE_DATA.siteImages && FE_DATA.siteImages.tiktokVideos) || [];
      if (vids.length) {
        ig.classList.add("tiktok-embeds");
        ig.innerHTML = vids.slice(0, 6).map((url) => {
          const m = String(url).match(/video\/(\d+)/);
          const id = m ? m[1] : "";
          return '<blockquote class="tiktok-embed" cite="' + url + '"' +
            (id ? ' data-video-id="' + id + '"' : '') +
            ' style="max-width:325px;min-width:250px;margin:0">' +
            '<section><a href="' + url + '" target="_blank" rel="noopener">Watch on TikTok</a></section></blockquote>';
        }).join("");
        // Load TikTok's embed script once; if already loaded, re-render.
        if (!document.getElementById("tiktok-embed-js")) {
          const s = document.createElement("script");
          s.id = "tiktok-embed-js"; s.async = true;
          s.src = "https://www.tiktok.com/embed.js";
          document.body.appendChild(s);
        } else if (window.tiktokEmbed && window.tiktokEmbed.lib && window.tiktokEmbed.lib.render) {
          window.tiktokEmbed.lib.render(ig.querySelectorAll(".tiktok-embed"));
        }
      } else {
        const igPal = ["blush", "sage", "gold", "lavender", "terracotta", "cream"];
        const igPhotos = (window.FE_DATA && FE_DATA.siteImages && FE_DATA.siteImages.instagram) || [];
        ig.innerHTML = igPal.map((pal, i) => `
          <a class="ig-item reveal" href="${FE.CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok post">
            ${igPhotos[i] ? FE.webImgHTML(igPhotos[i], { w: 400, h: 400, alt: "Flowers Everywhere on TikTok", palette: pal, id: "ig" + i, name: "TikTok" }) : FE.imgHTML({ palette: pal, id: "ig" + i, name: "TikTok" }, i % 3, { w: 400, h: 400, alt: "Flowers Everywhere on TikTok" })}
            <span class="ig-ic">${I.tt}</span>
          </a>`).join("");
      }
    }

    // Newsletter (front-end only)
    const nf = FE.$("#newsletterForm");
    if (nf) nf.addEventListener("submit", e => { e.preventDefault(); nf.reset(); UI.toast("Thanks — you're on the list!", true); });

    // Re-observe reveal animations for content injected above (categories,
    // collections, Instagram) so they fade in instead of staying hidden.
    FE.UI.reveal();
  });
})();
