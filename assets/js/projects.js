/* Projects / event & venue styling showcase.
   Placeholder projects for now — swap `blurb`/`type`/`title` freely, and set
   an `image` URL (e.g. a cPanel photo) to replace the generated placeholder. */
(function () {
  const { UI, esc, CONFIG, genSVG } = window.FE;

  const PROJECTS = [
    { title: "Garden Wedding Arch", type: "Wedding", palette: "blush", image: "",
      blurb: "A four-metre floral arch in blush roses, peonies and trailing eucalyptus for a private garden ceremony." },
    { title: "Hotel Lobby Installation", type: "Hospitality", palette: "sage", image: "",
      blurb: "Seasonal artificial arrangements — refreshed each month — for a boutique hotel lobby. Always in bloom, zero upkeep." },
    { title: "Birthday Backdrop & Table Styling", type: "Celebration", palette: "lavender", image: "",
      blurb: "A pastel bloom-and-balloon backdrop with matching centrepieces for a milestone birthday." },
    { title: "Corporate Gala Centrepieces", type: "Corporate", palette: "gold", image: "",
      blurb: "Forty tall gold-and-ivory centrepieces for an awards night — consistent, reusable and photo-ready." },
    { title: "Engagement Stage Décor", type: "Wedding", palette: "terracotta", image: "",
      blurb: "A full floral stage wall in deep reds and whites, framing the couple's seating for the evening." },
    { title: "Boutique Storefront Display", type: "Retail", palette: "cream", image: "",
      blurb: "Window-display styling with cascading faux florals that stay fresh through the whole season." },
  ];

  function projectCard(p) {
    const img = p.image ? p.image : genSVG({ palette: p.palette, name: p.title }, 0);
    return `<article class="project-card reveal">
      <div class="project-card__media"><img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy"></div>
      <div class="project-card__body">
        <span class="project-card__tag">${esc(p.type)}</span>
        <h3 class="project-card__title">${esc(p.title)}</h3>
        <p class="project-card__blurb">${esc(p.blurb)}</p>
      </div>
    </article>`;
  }

  FE.boot(() => {
    FE.UI.init("projects");
    const grid = FE.$("#projectsGrid");
    if (grid) grid.innerHTML = PROJECTS.map(projectCard).join("");
    // Wire the "get a quote" button to WhatsApp.
    const q = FE.$("#projectQuote");
    if (q) {
      const msg = "Hello " + CONFIG.brand + ", I'd like to discuss an event / venue project. Here are the details:";
      q.href = "https://wa.me/" + CONFIG.waNumber + "?text=" + encodeURIComponent(msg);
    }
    if (FE.UI && FE.UI.reveal) FE.UI.reveal();
  });
})();
