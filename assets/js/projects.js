/* Projects / event & venue styling showcase.
   Placeholder projects for now — swap `blurb`/`type`/`title` freely, and set
   an `image` URL (e.g. a cPanel photo) to replace the generated placeholder. */
(function () {
  const { UI, esc, CONFIG, genSVG } = window.FE;
  const IX = "?auto=format&fit=crop&w=800&h=600&q=70";

  // Seed projects (shown until the shop adds its own in Admin → Projects).
  // These use real, licence-free photos as stand-ins; the shop edits/replaces
  // them from the admin panel, where uploads go to cPanel.
  const PROJECTS = [
    { title: "Garden Wedding Arch", type: "Wedding", palette: "blush",
      image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a" + IX,
      blurb: "A four-metre floral arch in blush roses, peonies and trailing eucalyptus for a private garden ceremony." },
    { title: "Hotel Lobby Installation", type: "Hospitality", palette: "sage",
      image: "https://images.unsplash.com/photo-1561848355-890d054dc55a" + IX,
      blurb: "Seasonal artificial arrangements — refreshed each month — for a boutique hotel lobby. Always in bloom, zero upkeep." },
    { title: "Birthday Backdrop & Table Styling", type: "Celebration", palette: "lavender",
      image: "https://images.unsplash.com/photo-1561593367-66c79c2294e6" + IX,
      blurb: "A pastel bloom-and-balloon backdrop with matching centrepieces for a milestone birthday." },
    { title: "Corporate Gala Centrepieces", type: "Corporate", palette: "gold",
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364" + IX,
      blurb: "Tall gold-and-ivory centrepieces for an awards night — consistent, reusable and photo-ready." },
    { title: "Engagement Stage Décor", type: "Wedding", palette: "terracotta",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8" + IX,
      blurb: "Romantic floral styling in soft roses and gold accents, framing the couple's seating for the evening." },
    { title: "Boutique Storefront Display", type: "Retail", palette: "cream",
      image: "https://images.unsplash.com/photo-1558879787-4c4aea1fbb83" + IX,
      blurb: "Window-display styling with cascading faux florals that stay fresh through the whole season." },
  ];

  function projectCard(p) {
    const img = p.image ? p.image : genSVG({ palette: p.palette || "blush", name: p.title }, 0);
    return `<article class="project-card reveal${p.image ? "" : " project-card--placeholder"}">
      <div class="project-card__media"><img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">${p.image ? "" : '<span class="project-card__ph">Photo coming soon</span>'}</div>
      <div class="project-card__body">
        <span class="project-card__tag">${esc(p.type)}</span>
        <h3 class="project-card__title">${esc(p.title)}</h3>
        <p class="project-card__blurb">${esc(p.blurb)}</p>
      </div>
    </article>`;
  }

  // Pull the shop's live projects from Supabase; fall back to the seeds above
  // if the table is empty or unavailable.
  async function loadProjects() {
    try {
      if (!window.FE_SB) return PROJECTS;
      const res = await window.FE_SB.from("projects").select("*").eq("published", true).order("sort", { ascending: true });
      if (res.error || !res.data || !res.data.length) return PROJECTS;
      return res.data.map((r) => ({ title: r.title, type: r.type, blurb: r.blurb, image: r.image }));
    } catch (e) { return PROJECTS; }
  }

  FE.boot(() => {
    FE.UI.init("projects");
    // Wire the "get a quote" button to WhatsApp.
    const q = FE.$("#projectQuote");
    if (q) {
      const msg = "Hello " + CONFIG.brand + ", I'd like to discuss an event / venue project. Here are the details:";
      q.href = "https://wa.me/" + CONFIG.waNumber + "?text=" + encodeURIComponent(msg);
    }
    const grid = FE.$("#projectsGrid");
    loadProjects().then((list) => {
      if (grid) grid.innerHTML = list.map(projectCard).join("");
      if (FE.UI && FE.UI.reveal) FE.UI.reveal();
    });
  });
})();
