/* Full cart page */
(function () {
  const { Cart, WhatsApp, UI, esc, money, productImage, Store } = window.FE;

  function render() {
    const root = FE.$("#cartPage");
    const lines = Cart.lines();
    if (!lines.length) {
      root.innerHTML = `<div class="empty-state" style="padding:100px 20px">
        <h2 class="h2">Your cart is empty</h2>
        <p style="margin:12px 0 22px">Discover beautiful blooms that last a lifetime.</p>
        <a class="btn btn--primary" href="shop.html">Start shopping</a></div>`;
      return;
    }
    const sub = Cart.subtotal();
    root.innerHTML = `
      <div class="shop-layout" style="grid-template-columns:1fr 360px">
        <div>
          ${lines.map(l => `
            <div class="cart-line" data-id="${l.product.id}" style="padding:20px 0">
              ${FE.imgHTML(l.product, 0, { alt: l.product.name, cls: "thumb" })}
              <div class="cart-line__info">
                <a href="product.html?id=${l.product.id}"><div class="cart-line__name" style="font-size:1.2rem">${esc(l.product.name)}</div></a>
                ${l.color ? `<div class="cart-line__variant">${FE.colorDot(l.color)}Colour: ${esc(l.color)}</div>` : ""}
                <div class="cart-line__price">${esc(Store.categoryName(l.product.category))} · ${money(l.product.price)}</div>
                <div class="cart-line__row" style="max-width:280px">
                  <div class="qty">
                    <button data-dec="${l.product.id}" data-color="${esc(l.color)}" aria-label="Decrease">−</button>
                    <span>${l.qty}</span>
                    <button data-inc="${l.product.id}" data-color="${esc(l.color)}" aria-label="Increase">+</button>
                  </div>
                  <strong>${money(l.total)}</strong>
                </div>
                <button class="cart-line__remove" data-remove="${l.product.id}" data-color="${esc(l.color)}" style="margin-top:8px">Remove</button>
              </div>
            </div>`).join("")}
          <a class="link-underline" href="shop.html" style="display:inline-block;margin-top:20px">← Continue shopping</a>
        </div>
        <aside>
          <div class="admin-panel" style="position:sticky;top:calc(var(--header-h) + 20px)">
            <h2 style="font-family:var(--font-display)">Order Summary</h2>
            <div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div>
            <div class="summary-row"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
            <div class="summary-row total"><span>Estimated Total</span><span>${money(sub)}</span></div>
            <button class="btn btn--wa btn--block" id="pageCheckout" style="margin-top:18px">${FE.I.wa} Checkout on WhatsApp</button>
            <p class="search-hint" style="text-align:center;margin-top:12px">No online payment needed. Your order opens in WhatsApp — just press send.</p>
          </div>
        </aside>
      </div>`;
    root.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => Cart.add(b.getAttribute("data-inc"), 1, b.getAttribute("data-color")));
    root.querySelectorAll("[data-dec]").forEach(b => { const id=b.getAttribute("data-dec"), color=b.getAttribute("data-color"); b.onclick = () => Cart.setQty(id, Cart.qtyOf(id, color) - 1, color); });
    root.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => Cart.remove(b.getAttribute("data-remove"), b.getAttribute("data-color")));
    const co = root.querySelector("#pageCheckout"); if (co) co.onclick = () => WhatsApp.checkout();
  }

  FE.boot(() => {
    FE.UI.init();
    render();
    document.addEventListener("fe:cart", render);
  });
})();
