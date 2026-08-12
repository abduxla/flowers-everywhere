/* Product detail page */
(function () {
  const { Store, UI, Cart, WhatsApp, Analytics, esc, money, productGallery, I } = window.FE;

  function getProduct() {
    const p = new URLSearchParams(location.search);
    const id = p.get("id"), slug = p.get("slug");
    return (id && Store.byId(id)) || (slug && Store.bySlug(slug)) || Store.getProducts()[0];
  }

  function injectSchema(pr) {
    const gallery = productGallery(pr);
    const schema = {
      "@context": "https://schema.org/", "@type": "Product",
      name: pr.name, sku: pr.id, description: pr.shortDesc,
      brand: { "@type": "Brand", name: "Flowers Everywhere" },
      category: Store.categoryName(pr.category),
      offers: { "@type": "Offer", priceCurrency: "LKR", price: pr.price,
        availability: pr.stock === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }
    };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  FE.boot(() => {
    FE.UI.init();
    const pr = getProduct();
    if (!pr) { FE.$("#pdpRoot").innerHTML = '<div class="empty-state"><h3>Product not found</h3><a class="btn btn--primary" href="shop.html">Back to shop</a></div>'; return; }

    document.title = pr.name + " · Flowers Everywhere";
    Analytics.track("view", pr.id);
    injectSchema(pr);

    const gallery = productGallery(pr);
    let active = 0, qty = 1;

    // Breadcrumb
    FE.$("#breadcrumb").innerHTML =
      `<a href="index.html">Home</a><span class="sep">/</span>
       <a href="shop.html">Shop</a><span class="sep">/</span>
       <a href="shop.html?category=${pr.category}">${esc(Store.categoryName(pr.category))}</a><span class="sep">/</span>
       <span>${esc(pr.name)}</span>`;

    // Gallery
    const main = FE.$("#pdpMain"), thumbs = FE.$("#pdpThumbs");
    function paint() {
      main.innerHTML = FE.imgHTML(pr, active, { w: 800, h: 1000, eager: true });
      thumbs.innerHTML = gallery.map((g, i) => `<button class="pdp-thumb${i === active ? " active" : ""}" data-i="${i}" aria-label="View image ${i+1}">${FE.imgHTML(pr, i, { alt: pr.name + " view " + (i+1) })}</button>`).join("");
      thumbs.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { active = +b.getAttribute("data-i"); paint(); });
    }
    paint();
    main.onclick = () => main.classList.toggle("zoomed");

    // Info
    const badges = [];
    if (pr.isNew) badges.push('<span class="badge badge--new">New</span>');
    if (pr.isBest) badges.push('<span class="badge badge--best">Best Seller</span>');
    if (pr.isTrending) badges.push('<span class="badge badge--trend">Trending</span>');
    const price = pr.oldPrice ? `${money(pr.price)}<span class="was">${money(pr.oldPrice)}</span>` : money(pr.price);

    // Colour options (variants). Selecting a chip updates `selColor`, which
    // rides into the cart line and the WhatsApp order.
    const hasColors = Array.isArray(pr.colors) && pr.colors.length;
    let selColor = hasColors ? pr.colors[0] : "";
    const colorRow = hasColors ? `
      <div class="pdp-colors" data-color-group="pdp">
        <span class="pdp-colors__label">Colour: <b id="pdpColorName">${esc(selColor)}</b></span>
        <div class="pdp-colors__chips">
          ${pr.colors.map((c, i) => `<button type="button" class="color-chip${i === 0 ? " is-selected" : ""}" data-color-pick="pdp" data-color="${esc(c)}" title="${esc(c)}" aria-pressed="${i === 0 ? "true" : "false"}">${FE.colorDot(c)}<span>${esc(c)}</span></button>`).join("")}
        </div>
      </div>` : "";

    FE.$("#pdpInfo").innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">${badges.join("")}</div>
      <span class="pdp-cat">${esc(Store.categoryName(pr.category))}</span>
      <h1>${esc(pr.name)}</h1>
      <div class="pdp-price">${price}</div>
      <p class="pdp-desc">${esc(pr.shortDesc)}</p>
      <div style="font-size:.86rem;color:${pr.stock==="out"?"var(--danger)":"var(--success)"};font-weight:600">${pr.stock==="out"?"● Currently sold out":"● In stock — ready to ship"}</div>
      ${colorRow}
      <div class="pdp-buy">
        <div class="qty">
          <button id="qMinus" aria-label="Decrease">−</button>
          <span id="qVal">1</span>
          <button id="qPlus" aria-label="Increase">+</button>
        </div>
        <button class="btn btn--primary" id="pdpAdd" ${pr.stock==="out"?"disabled":""}>Add to Cart</button>
        <a class="btn btn--wa" id="pdpWa" href="${WhatsApp.inquiry(pr)}" target="_blank">${I.wa} Inquire</a>
      </div>
      <div class="pdp-meta">
        <div class="row">${I.shield} Handcrafted premium real-touch & silk materials</div>
        <div class="row">${I.leaf} No water, no wilting — lasts for years</div>
        <div class="row">${I.truck} Island-wide delivery · free over ${money(FE.CONFIG.freeShipThreshold)}</div>
      </div>
      <div class="pdp-share">
        <span>Share</span>
        <button data-share="wa" aria-label="Share on WhatsApp">${I.wa}</button>
        <button data-share="tt" aria-label="Share on TikTok" title="Open our TikTok">${I.tt}</button>
        <button data-share="copy" aria-label="Copy link">${I.copy}</button>
      </div>
      <div class="accordion" id="pdpAccordion">
        <div class="accordion__item"><button class="accordion__head">Description <span class="pm">+</span></button><div class="accordion__body"><p>${esc(pr.longDesc || pr.shortDesc)}</p></div></div>
        <div class="accordion__item"><button class="accordion__head">Product Details <span class="pm">+</span></button><div class="accordion__body"><p>Product ID: ${pr.id}<br>Colour: ${esc(pr.color)}${hasColors ? "<br>Colour options: " + pr.colors.map(esc).join(", ") : ""}<br>Category: ${esc(Store.categoryName(pr.category))}</p></div></div>
        <div class="accordion__item"><button class="accordion__head">Delivery & Ordering <span class="pm">+</span></button><div class="accordion__body"><p>Add to cart and checkout via WhatsApp — we'll confirm delivery or pickup and timing directly in chat. Free island-wide delivery on orders over ${money(FE.CONFIG.freeShipThreshold)}.</p></div></div>
      </div>`;

    // Colour chips → update selection + label.
    FE.$$("#pdpInfo [data-color-pick]").forEach((b) => b.onclick = () => {
      selColor = b.getAttribute("data-color");
      FE.$$("#pdpInfo .color-chip").forEach((ch) => {
        const on = ch === b;
        ch.classList.toggle("is-selected", on);
        ch.setAttribute("aria-pressed", on ? "true" : "false");
      });
      const nm = FE.$("#pdpColorName"); if (nm) nm.textContent = selColor;
    });

    const qVal = FE.$("#qVal");
    FE.$("#qPlus").onclick = () => { qty++; qVal.textContent = qty; };
    FE.$("#qMinus").onclick = () => { if (qty > 1) { qty--; qVal.textContent = qty; } };
    const addBtn = FE.$("#pdpAdd");
    if (addBtn) addBtn.onclick = () => { Cart.add(pr.id, qty, selColor); UI.toast("Added to cart", true); UI.openCart(); };

    FE.$$("[data-share]").forEach(b => b.onclick = () => {
      const url = location.href;
      const t = b.getAttribute("data-share");
      if (t === "wa") window.open("https://wa.me/?text=" + encodeURIComponent(pr.name + " — " + url), "_blank");
      if (t === "tt") window.open(FE.CONFIG.tiktok, "_blank");
      if (t === "copy") { navigator.clipboard && navigator.clipboard.writeText(url); UI.toast("Link copied", true); }
    });

    FE.$$("#pdpAccordion .accordion__head").forEach(h => h.onclick = () => h.parentElement.classList.toggle("open"));
    FE.$("#pdpAccordion .accordion__item").classList.add("open");
    const firstBody = FE.$("#pdpAccordion .accordion__item.open .accordion__body");
    if (firstBody) firstBody.style.maxHeight = firstBody.scrollHeight + "px";
    FE.$$("#pdpAccordion .accordion__head").forEach(h => h.addEventListener("click", () => {
      const body = h.nextElementSibling;
      body.style.maxHeight = h.parentElement.classList.contains("open") ? body.scrollHeight + "px" : null;
    }));

    // Related
    UI.renderProducts(FE.$("#relatedGrid"), Store.related(pr, 4));
  });
})();
