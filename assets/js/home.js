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
    // Best sellers — one big auto-rotating image showcase (pictures only).
    (function () {
      const wrap = FE.$("#homeBest");
      if (!wrap) return;
      const bestList = all.filter(p => p.isBest);
      const list = (bestList.length ? bestList : all.slice(4, 12)).slice(0, 6);
      if (!list.length) { wrap.style.display = "none"; return; }
      wrap.className = "best-showcase reveal";
      wrap.innerHTML =
        list.map((p, i) =>
          `<a class="best-slide${i === 0 ? " is-active" : ""}" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}">`
          + FE.imgHTML(p, 0, { w: 1200, h: 800, alt: p.name, eager: i === 0 })
          + `</a>`).join("")
        + `<div class="best-dots">`
          + list.map((_, i) => `<button class="best-dot${i === 0 ? " is-active" : ""}" data-i="${i}" aria-label="Best seller ${i + 1}"></button>`).join("")
        + `</div>`;
      const slides = wrap.querySelectorAll(".best-slide");
      const dots = wrap.querySelectorAll(".best-dot");
      if (slides.length < 2) return;
      let idx = 0, timer = null;
      const go = (n) => {
        slides[idx].classList.remove("is-active"); dots[idx].classList.remove("is-active");
        idx = (n + slides.length) % slides.length;
        slides[idx].classList.add("is-active"); dots[idx].classList.add("is-active");
      };
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = () => { if (!reduce) timer = setInterval(() => go(idx + 1), 3800); };
      dots.forEach((d) => d.addEventListener("click", (e) => {
        e.preventDefault(); go(+d.getAttribute("data-i"));
        if (timer) { clearInterval(timer); start(); }
      }));
      start();
    })();
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

    // (The "Follow us on TikTok" section was removed from the homepage.)

    // Newsletter (front-end only)
    const nf = FE.$("#newsletterForm");
    if (nf) nf.addEventListener("submit", e => { e.preventDefault(); nf.reset(); UI.toast("Thanks — you're on the list!", true); });

    // Re-observe reveal animations for content injected above (categories,
    // collections, Instagram) so they fade in instead of staying hidden.
    FE.UI.reveal();
  });
})();
