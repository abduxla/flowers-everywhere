/* =====================================================================
   Flowers Everywhere — Admin panel (no-code product management)
   Everything is stored in the browser (localStorage). Use Export to
   download an updated data file and re-deploy to make changes public.
   ===================================================================== */
(function () {
  const { Store, Analytics, esc, money, slugify, productImage, I, CONFIG } = window.FE;
  const $ = FE.$, $$ = FE.$$;

  const ADMIN_PASSWORD = "flowers2026"; // ← change this in assets/js/admin.js
  const SESSION_KEY = "fe_admin_ok";

  let editingId = null;
  let formImages = []; // array of image src (url or dataURL)

  /* ---------------- Auth ---------------- */
  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === "1"; }
  function showApp() { $("#adminLogin").classList.add("hidden"); $("#adminApp").classList.remove("hidden"); boot(); }
  function login() {
    const v = $("#adminPass").value;
    if (v === ADMIN_PASSWORD) { sessionStorage.setItem(SESSION_KEY, "1"); showApp(); }
    else { $("#loginErr").textContent = "Incorrect password. Try again."; }
  }

  /* ---------------- Data helpers ---------------- */
  function all() { return Store.getAllProducts().map(p => Object.assign({}, p)); }
  function persist(list) { Store.setAllProducts(list); }
  function nextId() {
    const nums = Store.getAllProducts().map(p => parseInt(String(p.id).replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "FE" + String((nums.length ? Math.max(...nums) : 1000) + 1);
  }
  function toast(msg) { FE.UI.toast ? FE.UI.toast(msg, true) : alert(msg); }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const list = Store.getAllProducts();
    const active = list.filter(p => !p.archived && p.status !== "draft");
    const cats = Store.getCategories();
    const a = Analytics.get();
    const topViews = Object.entries(a.views || {}).sort((x, y) => y[1] - x[1]).slice(0, 5);
    $("#statGrid").innerHTML = `
      <div class="stat-card"><div class="lbl">Live Products</div><div class="val">${active.length}</div></div>
      <div class="stat-card"><div class="lbl">Categories</div><div class="val">${cats.length}</div></div>
      <div class="stat-card"><div class="lbl">Featured</div><div class="val">${list.filter(p=>p.featured&&!p.archived).length}</div></div>
      <div class="stat-card"><div class="lbl">WhatsApp Checkouts</div><div class="val">${a.checkouts||0}</div></div>`;
    $("#dashTopViews").innerHTML = topViews.length
      ? topViews.map(([id, n]) => { const p = Store.byId(id); return `<div class="summary-row"><span>${p ? esc(p.name) : id}</span><span>${n} views</span></div>`; }).join("")
      : '<p class="muted">No product views tracked yet. Views are recorded as customers browse the live site.</p>';
    const recent = list.slice().sort((x,y)=>new Date(y.updatedAt)-new Date(x.updatedAt)).slice(0,5);
    $("#dashRecent").innerHTML = recent.map(p => `<div class="summary-row"><span>${esc(p.name)}</span><span>${money(p.price)}</span></div>`).join("");
  }

  /* ---------------- Products table ---------------- */
  const tState = { q: "", cat: "", status: "" };
  function renderTable() {
    let list = all();
    if (tState.q) { const q = tState.q.toLowerCase(); list = list.filter(p => (p.name+" "+p.id+" "+p.color).toLowerCase().includes(q)); }
    if (tState.cat) list = list.filter(p => p.category === tState.cat);
    if (tState.status === "archived") list = list.filter(p => p.archived);
    else if (tState.status === "draft") list = list.filter(p => p.status === "draft" && !p.archived);
    else if (tState.status === "published") list = list.filter(p => p.status !== "draft" && !p.archived);

    $("#tableCount").textContent = list.length + " products";
    $("#productRows").innerHTML = list.map(p => `
      <tr>
        <td><img class="thumb" src="${productImage(p,0)}" alt=""></td>
        <td><strong>${esc(p.name)}</strong><br><span class="muted" style="font-size:.78rem">${p.id}</span></td>
        <td class="hide-sm">${esc(Store.categoryName(p.category))}</td>
        <td>${money(p.price)}</td>
        <td class="hide-sm">${p.archived?'<span class="tag tag--archived">Archived</span>':(p.status==="draft"?'<span class="tag tag--off">Draft</span>':'<span class="tag tag--on">Live</span>')}</td>
        <td class="hide-sm">${p.featured?'★':'–'}</td>
        <td>
          <div class="tbl-actions">
            <button title="Edit" data-edit="${p.id}">${I.copy.replace('9 9','').includes('rect')?'✎':'✎'}</button>
            <button title="Duplicate" data-dup="${p.id}">⧉</button>
            <button title="${p.archived?'Restore':'Archive'}" data-arch="${p.id}">${p.archived?'↺':'🗄'}</button>
            <button title="Delete" data-del="${p.id}">🗑</button>
          </div>
        </td>
      </tr>`).join("") || '<tr><td colspan="7" style="text-align:center;padding:40px" class="muted">No products match.</td></tr>';

    $$("#productRows [data-edit]").forEach(b => b.onclick = () => openForm(b.getAttribute("data-edit")));
    $$("#productRows [data-dup]").forEach(b => b.onclick = () => duplicate(b.getAttribute("data-dup")));
    $$("#productRows [data-arch]").forEach(b => b.onclick = () => toggleArchive(b.getAttribute("data-arch")));
    $$("#productRows [data-del]").forEach(b => b.onclick = () => del(b.getAttribute("data-del")));
  }

  function duplicate(id) {
    const list = all(); const src = list.find(p => p.id === id); if (!src) return;
    const copy = Object.assign({}, src);
    copy.id = nextId(); copy.name = src.name + " (Copy)"; copy.slug = slugify(copy.name);
    copy.status = "draft"; copy.createdAt = copy.updatedAt = new Date().toISOString();
    list.push(copy); persist(list); renderTable(); renderDashboard(); toast("Duplicated as draft");
  }
  function toggleArchive(id) {
    const list = all(); const p = list.find(x => x.id === id); if (!p) return;
    p.archived = !p.archived; p.updatedAt = new Date().toISOString();
    persist(list); renderTable(); renderDashboard(); toast(p.archived ? "Archived" : "Restored");
  }
  function del(id) {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    persist(all().filter(p => p.id !== id)); renderTable(); renderDashboard(); toast("Deleted");
  }

  /* ---------------- Product form (modal) ---------------- */
  function catOptions(sel) {
    return Store.getCategories().map(c => `<option value="${c.key}" ${c.key===sel?"selected":""}>${esc(c.name)}</option>`).join("");
  }
  function openForm(id) {
    editingId = id || null;
    const p = id ? Store.byId(id) : null;
    formImages = p && p.images ? p.images.slice() : [];
    $("#modalTitle").textContent = id ? "Edit Product" : "Add Product";
    $("#f_id").value = p ? p.id : nextId();
    $("#f_name").value = p ? p.name : "";
    $("#f_category").innerHTML = catOptions(p ? p.category : "roses");
    $("#f_price").value = p ? p.price : "";
    $("#f_oldPrice").value = p && p.oldPrice ? p.oldPrice : "";
    $("#f_color").value = p ? p.color : "";
    $("#f_stock").value = p ? p.stock : "in";
    $("#f_status").value = p ? (p.status || "published") : "published";
    $("#f_short").value = p ? p.shortDesc : "";
    $("#f_long").value = p ? (p.longDesc || "") : "";
    $("#f_alt").value = p ? (p.alt || "") : "";
    $("#f_featured").checked = p ? !!p.featured : false;
    $("#f_new").checked = p ? !!p.isNew : true;
    $("#f_best").checked = p ? !!p.isBest : false;
    $("#f_trend").checked = p ? !!p.isTrending : false;
    renderFormImages();
    $("#productModal").classList.add("open");
  }
  function closeForm() { $("#productModal").classList.remove("open"); editingId = null; formImages = []; }

  function renderFormImages() {
    const box = $("#imgPreviews");
    box.innerHTML = formImages.map((src, i) => `<div class="img-preview"><img src="${src}" alt=""><button data-rm="${i}" aria-label="Remove">×</button></div>`).join("")
      || '<p class="muted" style="font-size:.84rem">No images yet — an elegant placeholder is generated automatically. Add photo URLs or upload images below.</p>';
    box.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { formImages.splice(+b.getAttribute("data-rm"), 1); renderFormImages(); });
  }

  function saveForm(e) {
    e.preventDefault();
    const name = $("#f_name").value.trim();
    const price = parseFloat($("#f_price").value);
    if (!name || isNaN(price)) { toast("Name and price are required"); return; }
    const list = all();
    let p = editingId ? list.find(x => x.id === editingId) : null;
    const now = new Date().toISOString();
    const data = {
      id: $("#f_id").value.trim() || nextId(),
      name, slug: slugify(name),
      category: $("#f_category").value,
      price, oldPrice: $("#f_oldPrice").value ? parseFloat($("#f_oldPrice").value) : null,
      color: $("#f_color").value.trim() || "Blush",
      stock: $("#f_stock").value,
      status: $("#f_status").value,
      shortDesc: $("#f_short").value.trim(),
      longDesc: $("#f_long").value.trim(),
      alt: $("#f_alt").value.trim() || (name + " — premium artificial flowers by Flowers Everywhere"),
      featured: $("#f_featured").checked,
      isNew: $("#f_new").checked,
      isBest: $("#f_best").checked,
      isTrending: $("#f_trend").checked,
      images: formImages.slice(),
      imageCount: 3,
      palette: p ? p.palette : paletteForCategory($("#f_category").value),
      archived: p ? p.archived : false,
      updatedAt: now,
    };
    if (p) { Object.assign(p, data); }
    else { data.createdAt = now; list.push(data); }
    persist(list); closeForm(); renderTable(); renderDashboard(); toast("Saved");
  }
  function paletteForCategory(key) {
    const c = Store.getCategories().find(c => c.key === key);
    return c ? c.palette : "blush";
  }

  /* ---------------- Image upload + compression ---------------- */
  function compress(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1100; let { width, height } = img;
          if (width > max || height > max) { const s = max / Math.max(width, height); width *= s; height *= s; }
          const c = document.createElement("canvas"); c.width = width; c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          try { resolve(c.toDataURL("image/jpeg", 0.82)); } catch (e) { resolve(reader.result); }
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  async function handleFiles(files) {
    for (const f of files) { if (f.type.startsWith("image/")) { const d = await compress(f); formImages.push(d); } }
    renderFormImages();
  }

  /* ---------------- Categories ---------------- */
  function renderCategories() {
    const cats = Store.getCategories();
    $("#catRows").innerHTML = cats.map((c, i) => `
      <tr><td><strong>${esc(c.name)}</strong></td><td class="muted">${c.key}</td>
      <td>${Store.getAllProducts().filter(p=>p.category===c.key).length}</td>
      <td><div class="tbl-actions"><button data-catdel="${c.key}" title="Delete">🗑</button></div></td></tr>`).join("");
    $$("#catRows [data-catdel]").forEach(b => b.onclick = () => {
      const key = b.getAttribute("data-catdel");
      if (Store.getAllProducts().some(p => p.category === key)) { toast("Move or delete products in this category first"); return; }
      Store.setCategories(cats.filter(c => c.key !== key)); renderCategories(); toast("Category removed");
    });
  }
  function addCategory(e) {
    e.preventDefault();
    const name = $("#newCatName").value.trim(); if (!name) return;
    const cats = Store.getCategories();
    const key = slugify(name);
    if (cats.some(c => c.key === key)) { toast("Category already exists"); return; }
    cats.push({ key, name, palette: $("#newCatPalette").value, blurb: "" });
    Store.setCategories(cats); $("#newCatName").value = ""; renderCategories(); toast("Category added");
  }

  /* ---------------- Export / Import ---------------- */
  function download(filename, text) {
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    a.download = filename; a.click();
  }
  function exportDataJs() {
    const data = { version: 1, categories: Store.getCategories(), colors: window.FE_DATA.colors, products: Store.getAllProducts(), collections: Store.getCollections() };
    const js = "/* Flowers Everywhere — exported catalogue. Replace assets/js/data.js with this file, then commit & push to redeploy. */\nwindow.FE_DATA = " + JSON.stringify(data, null, 2) + ";\n";
    download("data.js", js);
    toast("Exported data.js");
  }
  function exportJson() {
    download("flowers-everywhere-products.json", JSON.stringify(Store.getAllProducts(), null, 2));
    toast("Exported JSON");
  }
  function importJson(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        const products = Array.isArray(parsed) ? parsed : parsed.products;
        if (!Array.isArray(products)) throw new Error("bad");
        persist(products);
        if (parsed.categories) Store.setCategories(parsed.categories);
        renderTable(); renderDashboard(); renderCategories(); toast("Imported " + products.length + " products");
      } catch (e) { toast("Could not read that file"); }
    };
    r.readAsText(file);
  }

  /* ---------------- View switching ---------------- */
  function switchView(view) {
    $$(".admin-view").forEach(v => v.classList.add("hidden"));
    $("#view-" + view).classList.remove("hidden");
    $$(".admin-nav a").forEach(a => a.classList.toggle("active", a.getAttribute("data-view") === view));
    if (view === "dashboard") renderDashboard();
    if (view === "products") renderTable();
    if (view === "categories") renderCategories();
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    // Ensure a working copy exists so edits persist
    if (!FE.load(CONFIG.keys.products, null)) persist(window.FE_DATA.products.map(p => Object.assign({}, p)));

    renderDashboard(); renderTable(); renderCategories();

    $$(".admin-nav a").forEach(a => a.onclick = (e) => { e.preventDefault(); switchView(a.getAttribute("data-view")); });
    $("#addBtn").onclick = () => openForm(null);
    $("#addBtn2").onclick = () => openForm(null);
    $("#modalClose").onclick = closeForm;
    $("#modalCancel").onclick = closeForm;
    $("#productForm").onsubmit = saveForm;
    $("#productModal").addEventListener("click", e => { if (e.target.id === "productModal") closeForm(); });

    $("#searchTable").oninput = e => { tState.q = e.target.value; renderTable(); };
    $("#filterCat").onchange = e => { tState.cat = e.target.value; renderTable(); };
    $("#filterStatus").onchange = e => { tState.status = e.target.value; renderTable(); };
    $("#filterCat").innerHTML = '<option value="">All categories</option>' + Store.getCategories().map(c => `<option value="${c.key}">${esc(c.name)}</option>`).join("");

    // image url add
    $("#addImgUrl").onclick = () => {
      const u = $("#imgUrl").value.trim(); if (!u) return;
      formImages.push(u); $("#imgUrl").value = ""; renderFormImages();
    };
    // dropzone
    const dz = $("#dropzone"), fi = $("#fileInput");
    dz.onclick = () => fi.click();
    fi.onchange = () => handleFiles(fi.files);
    ["dragenter","dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("drag"); }));
    ["dragleave","drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("drag"); }));
    dz.addEventListener("drop", e => handleFiles(e.dataTransfer.files));

    // categories
    $("#addCatForm").onsubmit = addCategory;

    // export/import
    $("#exportDataJs").onclick = exportDataJs;
    $("#exportJson").onclick = exportJson;
    $("#importInput").onchange = e => { if (e.target.files[0]) importJson(e.target.files[0]); };
    $("#resetData").onclick = () => { if (confirm("Reset all products & categories to the shipped defaults? Your changes will be lost.")) { Store.reset(); renderDashboard(); renderTable(); renderCategories(); toast("Reset to defaults"); } };
    $("#logoutBtn").onclick = () => { sessionStorage.removeItem(SESSION_KEY); location.reload(); };
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#loginBtn").onclick = login;
    $("#adminPass").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
    if (isAuthed()) showApp();
  });
})();
