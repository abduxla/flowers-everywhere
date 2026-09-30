/* Homepage dynamic sections */
(function () {
  const { Store, UI, esc, productImage, I, money } = window.FE;

  /**
   * Slowly drift a horizontal rail so it advertises what's further along
   * without the shopper having to swipe.
   *
   * The rail holds two identical copies of the set; we advance the scroll
   * position and wrap it back by exactly one copy's width, so the motion is
   * seamless and never hits a dead end. Manual scrolling still works
   * normally — any interaction pauses the drift and it picks up from
   * wherever the shopper left it. It also idles while off-screen and stays
   * completely still for anyone who prefers reduced motion.
   *
   * @param {HTMLElement} rail  the scrolling container
   * @param {number} originals  how many cards make up ONE copy of the set
   */
  function driftRail(rail, originals) {
    if (!rail || !originals) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const SPEED = 0.35;       // px per frame ≈ 21px/s — a slow, calm drift
    const RESUME_MS = 2500;   // settle time after the shopper interacts
    const HOLD = Number.MAX_SAFE_INTEGER; // "stay paused until we say so"

    let pos = 0, paused = false, resumeAt = 0, onScreen = true, span = 0;

    // Distance from the first card to its clone = exactly one copy. Measured
    // rather than using scrollWidth/2, because the flex gap between the two
    // copies would otherwise skew the wrap point and make the loop jump.
    const measure = () => {
      const a = rail.children[0], b = rail.children[originals];
      span = (a && b) ? (b.offsetLeft - a.offsetLeft) : 0;
    };
    measure();
    window.addEventListener("resize", measure);

    const nudge = () => { paused = true; resumeAt = Date.now() + RESUME_MS; };
    ["pointerdown", "touchstart", "wheel"].forEach((ev) =>
      rail.addEventListener(ev, nudge, { passive: true }));
    const hold = () => { paused = true; resumeAt = HOLD; };
    const release = () => { paused = true; resumeAt = 0; };   // resumes next frame, re-syncing pos
    rail.addEventListener("mouseenter", hold);
    rail.addEventListener("focusin", hold);
    rail.addEventListener("mouseleave", release);
    rail.addEventListener("focusout", release);

    if (window.IntersectionObserver) {
      new IntersectionObserver((entries) => { onScreen = entries[0].isIntersecting; })
        .observe(rail);
    }

    function step() {
      requestAnimationFrame(step);
      if (!onScreen) return;
      if (paused) {
        if (Date.now() < resumeAt) return;
        paused = false;
        pos = rail.scrollLeft;   // continue from wherever they left it
      }
      if (!span) { measure(); if (!span) return; }
      pos += SPEED;
      if (pos >= span) pos -= span;   // wrap onto the first copy, unnoticed
      rail.scrollLeft = pos;
    }
    requestAnimationFrame(step);
  }

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
      // Every real photo belonging to a category, product images and colour
      // variants alike. The tile shows one of them and moves to the next one
      // each day, so the storefront keeps looking fresh without anyone
      // uploading category artwork.
      const catShots = (key) => {
        const out = [];
        all.forEach((p) => {
          if (p.category !== key) return;
          [].concat(p.images || [], p.colorImages || []).forEach((u) => {
            if (isRealImg(u) && out.indexOf(u) < 0) out.push(u);
          });
        });
        return out;
      };
      // Whole days since epoch — same photo all day for everyone, next photo
      // tomorrow. Deterministic, so there's no flicker between page loads.
      const dayIndex = Math.floor(Date.now() / 86400000);
      const catCover = (key) =>
        all.find((p) => p.category === key &&
          Array.isArray(p.images) && p.images.some(isRealImg)) || null;
      const homeCats = Store.getCategories().slice(0, 8);
      const catCardHTML = (c, clone) => {
        const shots = catShots(c.key);
        const photos = catPhotos[c.key] || [];
        const cover = catCover(c.key);
        const img = shots.length
          // rotates once every 24h through that category's own product photos
          ? FE.webImgHTML(shots[dayIndex % shots.length], { w: 600, h: 800, alt: c.name, palette: c.palette, id: c.key, name: c.name })
          : photos.length
            ? FE.webImgHTML(photos[0], { w: 600, h: 800, alt: c.name, palette: c.palette, id: c.key, name: c.name })
            : cover
              ? FE.imgHTML(cover, 0, { w: 600, h: 800, alt: c.name })
              : FE.imgHTML({ palette: c.palette, id: c.key, name: c.name }, 0, { w: 600, h: 800, alt: c.name });
        // The rail drifts continuously, so a second copy of the set follows
        // the first and the scroll position wraps back onto copy 1 before
        // anyone sees the end. Clones are hidden from screen readers and the
        // tab order so the duplicate isn't announced twice.
        return `<a class="cat-card reveal" href="shop.html?category=${c.key}"${clone ? ' aria-hidden="true" tabindex="-1"' : ""}>
          ${img}
          <div class="cat-card__label"><h3>${esc(c.name)}</h3></div>
        </a>`;
      };
      catWrap.innerHTML = homeCats.map((c) => catCardHTML(c, false)).join("")
        + homeCats.map((c) => catCardHTML(c, true)).join("");
      driftRail(catWrap, homeCats.length);
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
          ${(c.image || si[c.key]) ? FE.webImgHTML(c.image || si[c.key], { w: 800, h: 600, alt: c.name, palette: c.palette, id: c.key, name: c.name }) : FE.imgHTML({ palette: c.palette, id: c.key, name: c.name }, 1, { w: 800, h: 600, alt: c.name })}
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
