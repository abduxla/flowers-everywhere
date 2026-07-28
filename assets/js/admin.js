/* =====================================================================
   Flowers Everywhere — Admin panel (Supabase-backed, no-code).
   Auth, product CRUD and image upload all go straight to Supabase, so
   every change is LIVE instantly — no export/replace/push, no data.js.
   Requires: supabase-js CDN + supabase-config.js loaded before this.
   ===================================================================== */
(function () {
  const { esc, money, slugify, productImage, I, CONFIG } = window.FE;
  const $ = FE.$, $$ = FE.$$;
  const SB = window.FE_SB;
  const H = window.FE_SB_HELPERS;

  if (!SB || !H) {
    alert("Store backend failed to load. Check your connection and refresh.");
    return;
  }

  let editingId = null;
  let formImages = [];             // array of image URLs (Storage or pasted)
  const MEM = { products: [], categories: [] };  // live cache from Supabase

  /* ---------------- Data cache ---------------- */
  async function loadAll() {
    const [pr, cr] = await Promise.all([
      SB.from("products").select("*").order("created_at", { ascending: false }).limit(2000),
      SB.from("categories").select("*").order("sort", { ascending: true }),
    ]);
    if (pr.error) throw pr.error;
    if (cr.error) throw cr.error;
    MEM.products = (pr.data || []).map(H.rowToProduct);
    MEM.categories = (cr.data || []).map((c) => ({
      key: c.key, name: c.name, palette: c.palette, blurb: c.blurb, sort: c.sort,
    }));
  }
  const all = () => MEM.products.map((p) => Object.assign({}, p));
  const cats = () => MEM.categories;
  const byId = (id) => MEM.products.find((p) => p.id === id);
  const catName = (key) => { const c = MEM.categories.find((c) => c.key === key); return c ? c.name : key; };
  function nextId() {
    const nums = MEM.products.map((p) => parseInt(String(p.id).replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
    return "FE" + String((nums.length ? Math.max(...nums) : 1000) + 1);
  }
  function toast(msg) { FE.UI && FE.UI.toast ? FE.UI.toast(msg, true) : console.log(msg); }

  /* ---------------- Auth ---------------- */
  async function showApp() {
    $("#adminLogin").classList.add("hidden");
    $("#adminApp").classList.remove("hidden");
    try { await loadAll(); } catch (e) { toast("Could not load products: " + (e.message || e)); }
    boot();
  }
  async function login() {
    const email = H.adminEmail($("#adminUser").value);
    const password = $("#adminPass").value;
    $("#loginErr").textContent = "";
    const btn = $("#loginBtn"); const old = btn.textContent; btn.textContent = "Signing in…"; btn.disabled = true;
    try {
      const { error } = await SB.auth.signInWithPassword({ email, password });
      if (error) { $("#loginErr").textContent = "Incorrect username or password."; return; }
      await showApp();
    } catch (e) {
      $("#loginErr").textContent = "Sign-in failed. Check your connection.";
    } finally { btn.textContent = old; btn.disabled = false; }
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const list = MEM.products;
    const live = list.filter((p) => !p.archived && p.status !== "draft");
    $("#statGrid").innerHTML = `
      <div class="stat-card"><div class="lbl">Live Products</div><div class="val">${live.length}</div></div>
      <div class="stat-card"><div class="lbl">Categories</div><div class="val">${cats().length}</div></div>
      <div class="stat-card"><div class="lbl">Featured</div><div class="val">${list.filter((p) => p.featured && !p.archived).length}</div></div>
      <div class="stat-card"><div class="lbl">Drafts</div><div class="val">${list.filter((p) => p.status === "draft" && !p.archived).length}</div></div>`;
    const topEl = $("#dashTopViews");
    if (topEl) topEl.innerHTML = '<p class="muted">Live product views appear in the storefront analytics once Stage 2 is connected.</p>';
    const recent = list.slice().sort((x, y) => new Date(y.updatedAt) - new Date(x.updatedAt)).slice(0, 5);
    const recEl = $("#dashRecent");
    if (recEl) recEl.innerHTML = recent.map((p) => `<div class="summary-row"><span>${esc(p.name)}</span><span>${money(p.price)}</span></div>`).join("")
      || '<p class="muted">No products yet. Click “Add Product” to create your first one.</p>';
  }

  /* ---------------- Products table ---------------- */
  const tState = { q: "", cat: "", status: "" };
  function renderTable() {
    let list = all();
    if (tState.q) { const q = tState.q.toLowerCase(); list = list.filter((p) => (p.name + " " + p.id + " " + p.color).toLowerCase().includes(q)); }
    if (tState.cat) list = list.filter((p) => p.category === tState.cat);
    if (tState.status === "archived") list = list.filter((p) => p.archived);
    else if (tState.status === "draft") list = list.filter((p) => p.status === "draft" && !p.archived);
    else if (tState.status === "published") list = list.filter((p) => p.status !== "draft" && !p.archived);

    $("#tableCount").textContent = list.length + " products";
    $("#productRows").innerHTML = list.map((p) => `
      <tr>
        <td><img class="thumb" src="${productImage(p, 0)}" alt=""></td>
        <td><strong>${esc(p.name)}</strong><br><span class="muted" style="font-size:.78rem">${p.id}</span></td>
        <td class="hide-sm">${esc(catName(p.category))}</td>
        <td>${money(p.price)}</td>
        <td class="hide-sm">${p.archived ? '<span class="tag tag--archived">Archived</span>' : (p.status === "draft" ? '<span class="tag tag--off">Draft</span>' : '<span class="tag tag--on">Live</span>')}</td>
        <td class="hide-sm">${p.featured ? "★" : "–"}</td>
        <td>
          <div class="tbl-actions">
            <button title="Edit" data-edit="${p.id}">✎</button>
            <button title="Duplicate" data-dup="${p.id}">⧉</button>
            <button title="${p.archived ? "Restore" : "Archive"}" data-arch="${p.id}">${p.archived ? "↺" : "🗄"}</button>
            <button title="Delete" data-del="${p.id}">🗑</button>
          </div>
        </td>
      </tr>`).join("") || '<tr><td colspan="7" style="text-align:center;padding:40px" class="muted">No products match.</td></tr>';

    $$("#productRows [data-edit]").forEach((b) => b.onclick = () => openForm(b.getAttribute("data-edit")));
    $$("#productRows [data-dup]").forEach((b) => b.onclick = () => duplicate(b.getAttribute("data-dup")));
    $$("#productRows [data-arch]").forEach((b) => b.onclick = () => toggleArchive(b.getAttribute("data-arch")));
    $$("#productRows [data-del]").forEach((b) => b.onclick = () => del(b.getAttribute("data-del")));
  }

  async function persistRow(product) {
    const { error } = await SB.from("products").upsert(H.productToRow(product));
    if (error) throw error;
  }

  async function duplicate(id) {
    const src = byId(id); if (!src) return;
    const copy = Object.assign({}, src);
    copy.id = nextId(); copy.name = src.name + " (Copy)"; copy.status = "draft"; copy.archived = false;
    try { await persistRow(copy); await loadAll(); renderTable(); renderDashboard(); toast("Duplicated as draft"); }
    catch (e) { toast("Duplicate failed: " + (e.message || e)); }
  }
  async function toggleArchive(id) {
    const p = byId(id); if (!p) return;
    const upd = Object.assign({}, p, { archived: !p.archived });
    try { await persistRow(upd); await loadAll(); renderTable(); renderDashboard(); toast(upd.archived ? "Archived" : "Restored"); }
    catch (e) { toast("Update failed: " + (e.message || e)); }
  }
  async function del(id) {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    try {
      const { error } = await SB.from("products").delete().eq("id", id);
      if (error) throw error;
      await loadAll(); renderTable(); renderDashboard(); toast("Deleted");
    } catch (e) { toast("Delete failed: " + (e.message || e)); }
  }

  /* ---------------- Product form (modal) ---------------- */
  function catOptions(sel) {
    return cats().map((c) => `<option value="${c.key}" ${c.key === sel ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  }
  function openForm(id) {
    editingId = id || null;
    const p = id ? byId(id) : null;
    formImages = p && p.images ? p.images.slice() : [];
    $("#modalTitle").textContent = id ? "Edit Product" : "Add Product";
    $("#f_id").value = p ? p.id : nextId();
    $("#f_name").value = p ? p.name : "";
    $("#f_category").innerHTML = catOptions(p ? p.category : (cats()[0] && cats()[0].key) || "roses");
    // Price field shows the FULL (pre-discount) price; the % is derived
    // from the stored oldPrice/price pair so edits round-trip cleanly.
    const full = p ? ((p.oldPrice && p.oldPrice > p.price) ? p.oldPrice : p.price) : "";
    $("#f_price").value = full;
    $("#f_discount").value = (p && p.oldPrice && p.oldPrice > p.price)
      ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : "";
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
      || '<p class="muted" style="font-size:.84rem">No images yet — an elegant placeholder is shown until you add one. Upload photos or paste an image URL below.</p>';
    box.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { formImages.splice(+b.getAttribute("data-rm"), 1); renderFormImages(); });
  }

  async function saveForm(e) {
    e.preventDefault();
    const name = $("#f_name").value.trim();
    const price = parseFloat($("#f_price").value);
    if (!name || isNaN(price)) { toast("Name and price are required"); return; }
    // Discount %: store the discounted amount as price and the entered
    // (full) price as oldPrice, so the storefront strikes the original and
    // the cart charges the discounted price with no extra logic.
    const pct = Math.round(Number($("#f_discount").value) || 0);
    const hasDisc = pct > 0 && pct < 100;
    const finalPrice = hasDisc ? Math.round(price * (1 - pct / 100)) : price;
    const btn = $("#productForm").querySelector('button[type="submit"]');
    const old = btn.textContent; btn.textContent = "Saving…"; btn.disabled = true;
    const data = {
      id: $("#f_id").value.trim() || nextId(),
      name,
      category: $("#f_category").value,
      price: finalPrice,
      oldPrice: hasDisc ? price : null,
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
      archived: editingId ? !!(byId(editingId) || {}).archived : false,
    };
    try {
      await persistRow(data);
      await loadAll(); closeForm(); renderTable(); renderDashboard(); toast("Saved — live on your store");
    } catch (err) {
      toast("Save failed: " + (err.message || err));
    } finally { btn.textContent = old; btn.disabled = false; }
  }

  /* ---------------- Image upload → Supabase Storage ---------------- */
  function compressToBlob(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // One photo per product, so we can afford a crisp, near-lossless
          // export: cap at 1800px (well above the ~800px display size, sharp
          // on retina) at quality 0.92. Still ~400-700 KB — 500 products fit
          // the free tier's 1 GB many times over.
          const max = 1800; let { width, height } = img;
          if (width > max || height > max) { const s = max / Math.max(width, height); width *= s; height *= s; }
          const c = document.createElement("canvas"); c.width = width; c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          c.toBlob((b) => resolve(b || file), "image/jpeg", 0.92);
        };
        img.onerror = () => resolve(file);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  async function uploadImage(blob) {
    const path = "products/" + Date.now() + "_" + Math.random().toString(36).slice(2, 8) + ".jpg";
    const { error } = await SB.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    const { data } = SB.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }
  async function handleFiles(files) {
    // One photo per product: take the first image and replace any existing.
    const f = Array.from(files).find((x) => x.type.startsWith("image/"));
    if (f) {
      try {
        toast("Uploading image…");
        const blob = await compressToBlob(f);
        const url = await uploadImage(blob);
        formImages = [url];
        renderFormImages();
      } catch (err) { toast("Image upload failed: " + (err.message || err)); }
    }
  }

  /* ---------------- Categories ---------------- */
  function renderCategories() {
    $("#catRows").innerHTML = cats().map((c) => `
      <tr><td><strong>${esc(c.name)}</strong></td><td class="muted">${c.key}</td>
      <td>${MEM.products.filter((p) => p.category === c.key).length}</td>
      <td><div class="tbl-actions"><button data-catdel="${c.key}" title="Delete">🗑</button></div></td></tr>`).join("");
    $$("#catRows [data-catdel]").forEach((b) => b.onclick = async () => {
      const key = b.getAttribute("data-catdel");
      if (MEM.products.some((p) => p.category === key)) { toast("Move or delete products in this category first"); return; }
      try { const { error } = await SB.from("categories").delete().eq("key", key); if (error) throw error; await loadAll(); renderCategories(); toast("Category removed"); }
      catch (e) { toast("Delete failed: " + (e.message || e)); }
    });
  }
  async function addCategory(e) {
    e.preventDefault();
    const name = $("#newCatName").value.trim(); if (!name) return;
    const key = slugify(name);
    if (cats().some((c) => c.key === key)) { toast("Category already exists"); return; }
    try {
      const sort = (cats().reduce((m, c) => Math.max(m, c.sort || 0), 0)) + 1;
      const { error } = await SB.from("categories").insert({ key, name, palette: $("#newCatPalette").value, blurb: "", sort });
      if (error) throw error;
      await loadAll(); $("#newCatName").value = ""; renderCategories();
      $("#filterCat").innerHTML = '<option value="">All categories</option>' + cats().map((c) => `<option value="${c.key}">${esc(c.name)}</option>`).join("");
      toast("Category added");
    } catch (e2) { toast("Add failed: " + (e2.message || e2)); }
  }

  /* ---------------- Backup export (optional) ---------------- */
  function exportJson() {
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(MEM.products, null, 2));
    a.download = "flowers-everywhere-backup.json"; a.click();
    toast("Backup downloaded");
  }

  /* ---------------- View switching ---------------- */
  function switchView(view) {
    $$(".admin-view").forEach((v) => v.classList.add("hidden"));
    $("#view-" + view).classList.remove("hidden");
    $$(".admin-nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("data-view") === view));
    if (view === "dashboard") renderDashboard();
    if (view === "products") renderTable();
    if (view === "categories") renderCategories();
  }

  /* ---------------- Boot (after login) ---------------- */
  function boot() {
    renderDashboard(); renderTable(); renderCategories();

    $$(".admin-nav a").forEach((a) => a.onclick = (e) => { e.preventDefault(); switchView(a.getAttribute("data-view")); });
    $("#addBtn").onclick = () => openForm(null);
    $("#addBtn2").onclick = () => openForm(null);
    $("#modalClose").onclick = closeForm;
    $("#modalCancel").onclick = closeForm;
    $("#productForm").onsubmit = saveForm;
    $("#productModal").addEventListener("click", (e) => { if (e.target.id === "productModal") closeForm(); });

    $("#searchTable").oninput = (e) => { tState.q = e.target.value; renderTable(); };
    $("#filterCat").onchange = (e) => { tState.cat = e.target.value; renderTable(); };
    $("#filterStatus").onchange = (e) => { tState.status = e.target.value; renderTable(); };
    $("#filterCat").innerHTML = '<option value="">All categories</option>' + cats().map((c) => `<option value="${c.key}">${esc(c.name)}</option>`).join("");

    $("#addImgUrl").onclick = () => { const u = $("#imgUrl").value.trim(); if (!u) return; formImages = [u]; $("#imgUrl").value = ""; renderFormImages(); };
    const dz = $("#dropzone"), fi = $("#fileInput");
    dz.onclick = () => fi.click();
    fi.onchange = () => handleFiles(fi.files);
    ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
    dz.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));

    $("#addCatForm").onsubmit = addCategory;

    if ($("#exportJson")) $("#exportJson").onclick = exportJson;
    $("#logoutBtn").onclick = async () => { await SB.auth.signOut(); location.reload(); };
  }

  document.addEventListener("DOMContentLoaded", async () => {
    $("#loginBtn").onclick = login;
    const onEnter = (e) => { if (e.key === "Enter") login(); };
    $("#adminUser") && $("#adminUser").addEventListener("keydown", onEnter);
    $("#adminPass").addEventListener("keydown", onEnter);
    try {
      const { data } = await SB.auth.getSession();
      if (data && data.session) await showApp();
    } catch (e) { /* stay on login */ }
  });
})();
