/* Shop / catalogue page */
(function () {
  const { Store, UI, esc, money } = window.FE;

  const state = { categories: new Set(), colors: new Set(), min: null, max: null, availOnly: false, sort: "featured", q: "", quick: null };

  function readParams() {
    const p = new URLSearchParams(location.search);
    if (p.get("category")) state.categories.add(p.get("category"));
    if (p.get("q")) state.q = p.get("q").toLowerCase();
    if (p.get("filter")) state.quick = p.get("filter"); // new | best | trend
  }

  function match(pr) {
    if (state.categories.size && !state.categories.has(pr.category)) return false;
    if (state.colors.size && !state.colors.has(pr.color)) return false;
    if (state.min != null && pr.price < state.min) return false;
    if (state.max != null && pr.price > state.max) return false;
    if (state.availOnly && pr.stock === "out") return false;
    if (state.quick === "new" && !pr.isNew) return false;
    if (state.quick === "best" && !pr.isBest) return false;
    if (state.quick === "trend" && !pr.isTrending) return false;
    if (state.q) {
      const hay = (pr.name + " " + pr.id + " " + Store.categoryName(pr.category) + " " + pr.color).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  }

  function sortList(list) {
    const s = state.sort;
    const arr = list.slice();
    if (s === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (s === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (s === "newest") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (s === "oldest") arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (s === "az") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (s === "best") arr.sort((a, b) => (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0));
    else arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); // featured
    return arr;
  }

  function renderFilters() {
    const cats = Store.getCategories();
    const all = Store.getProducts();
    const catBox = FE.$("#filterCategories");
    catBox.innerHTML = cats.map(c => {
      const n = all.filter(p => p.category === c.key).length;
      return `<label class="filter-opt"><input type="checkbox" value="${c.key}" data-cat ${state.categories.has(c.key) ? "checked" : ""}> ${esc(c.name)} <span class="cnt">${n}</span></label>`;
    }).join("");
    const colBox = FE.$("#filterColors");
    const swatchMap = { Blush:"#E7CFC6", White:"#F7F3EE", Ivory:"#EFE7DA", Sage:"#A9B7A5", Lavender:"#BEACD9", Gold:"#C9A24B", Terracotta:"#C0764F", "Dusty Pink":"#D3A0A0", Burgundy:"#7d2b3a", Champagne:"#E4D2A8" };
    colBox.innerHTML = (window.FE_DATA.colors).map(c =>
      `<label class="filter-opt"><input type="checkbox" value="${esc(c)}" data-color ${state.colors.has(c) ? "checked" : ""}> <span class="swatch" style="background:${swatchMap[c]||'#ccc'}"></span> ${esc(c)}</label>`
    ).join("");

    catBox.querySelectorAll("[data-cat]").forEach(cb => cb.onchange = () => { cb.checked ? state.categories.add(cb.value) : state.categories.delete(cb.value); render(); });
    colBox.querySelectorAll("[data-color]").forEach(cb => cb.onchange = () => { cb.checked ? state.colors.add(cb.value) : state.colors.delete(cb.value); render(); });
  }

  function activeFilterChips() {
    const chips = [];
    state.categories.forEach(c => chips.push(["category", c, Store.categoryName(c)]));
    state.colors.forEach(c => chips.push(["color", c, c]));
    if (state.min != null || state.max != null) chips.push(["price", "range", `${money(state.min||0)} – ${state.max ? money(state.max) : "∞"}`]);
    if (state.availOnly) chips.push(["avail", "1", "In stock"]);
    if (state.quick) chips.push(["quick", state.quick, ({new:"New Arrivals",best:"Best Sellers",trend:"Trending"})[state.quick]]);
    if (state.q) chips.push(["q", state.q, `“${state.q}”`]);
    const box = FE.$("#activeFilters");
    if (!chips.length) { box.innerHTML = ""; return; }
    box.innerHTML = chips.map(([t, v, label]) => `<span class="chip">${esc(label)} <button data-clear="${t}" data-val="${esc(v)}" aria-label="Remove">×</button></span>`).join("")
      + `<button class="chip" data-clear-all>Clear all</button>`;
    box.querySelectorAll("[data-clear]").forEach(b => b.onclick = () => {
      const t = b.getAttribute("data-clear"), v = b.getAttribute("data-val");
      if (t === "category") state.categories.delete(v);
      if (t === "color") state.colors.delete(v);
      if (t === "price") { state.min = null; state.max = null; FE.$("#priceMin").value=""; FE.$("#priceMax").value=""; }
      if (t === "avail") { state.availOnly = false; FE.$("#availToggle").checked = false; }
      if (t === "quick") state.quick = null;
      if (t === "q") state.q = "";
      renderFilters(); render();
    });
    const ca = box.querySelector("[data-clear-all]");
    if (ca) ca.onclick = () => { state.categories.clear(); state.colors.clear(); state.min=state.max=null; state.availOnly=false; state.quick=null; state.q=""; FE.$("#priceMin").value=""; FE.$("#priceMax").value=""; FE.$("#availToggle").checked=false; renderFilters(); render(); };
  }

  // Paginated rendering: only PAGE cards are added at a time (with a
  // "Load more" button), so a 500-600 product catalogue never floods the
  // DOM. Filtering/sorting resets to the first page; Load more appends.
  const PAGE = 36;
  let filteredNow = [];
  let shown = 0;
  function renderPage(reset) {
    const grid = FE.$("#shopGrid");
    if (reset) {
      filteredNow = sortList(Store.getProducts().filter(match));
      shown = 0;
      grid.innerHTML = "";
      FE.$("#shopCount").textContent = filteredNow.length + (filteredNow.length === 1 ? " product" : " products");
      activeFilterChips();
    }
    if (!filteredNow.length) {
      grid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>';
    } else {
      const next = filteredNow.slice(shown, shown + PAGE);
      grid.insertAdjacentHTML("beforeend", next.map((p) => UI.productCard(p)).join(""));
      shown += next.length;
      if (FE.UI && FE.UI.reveal) FE.UI.reveal();
    }
    const moreWrap = FE.$("#shopMore");
    if (moreWrap) {
      const left = filteredNow.length - shown;
      moreWrap.innerHTML = left > 0
        ? '<button class="btn btn--ghost btn--block" id="loadMoreBtn">Load more (' + left + ' more)</button>'
        : "";
      const lm = FE.$("#loadMoreBtn");
      if (lm) lm.onclick = () => renderPage(false);
    }
  }
  function render() { renderPage(true); }

  FE.boot(() => {
    FE.UI.init("shop");
    readParams();

    // heading based on category/filter
    const head = FE.$("#shopTitle");
    if (state.categories.size === 1) head.textContent = Store.categoryName([...state.categories][0]);
    else if (state.quick) head.textContent = ({ new: "New Arrivals", best: "Best Sellers", trend: "Trending Now" })[state.quick] || "Shop All";

    renderFilters();

    FE.$("#sortSelect").onchange = (e) => { state.sort = e.target.value; render(); };
    FE.$("#priceMin").oninput = (e) => { state.min = e.target.value ? +e.target.value : null; render(); };
    FE.$("#priceMax").oninput = (e) => { state.max = e.target.value ? +e.target.value : null; render(); };
    FE.$("#availToggle").onchange = (e) => { state.availOnly = e.target.checked; render(); };

    // mobile filter toggle
    const filters = FE.$("#shopFilters");
    FE.$("#filterToggle").onclick = () => filters.classList.add("open");
    FE.$("#filtersClose").onclick = () => filters.classList.remove("open");
    FE.$("#applyFilters").onclick = () => filters.classList.remove("open");

    render();
  });
})();
