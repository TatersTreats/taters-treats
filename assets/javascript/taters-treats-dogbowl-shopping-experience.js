const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin & Turmeric",
    description: "Gentle on sensitive stomachs",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Mint & Carob",
    description: "Freshens breath naturally",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter & Ginger",
    description: "Comforts and settles the tummy",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

const SIZE_OPTIONS = ["Trial", "Regular", "Value"];

const productsEl = document.getElementById("products");

let activeOverlay = null;
let activeModal = null;
let activeOriginCard = null;

function renderProducts() {
  if (!productsEl) return;

  productsEl.innerHTML = PRODUCTS.map((p) => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.flavor}" />
      </div>
      <span class="product-flavor">${p.flavor}</span>
    </article>
  `).join("");

  attachCardEvents();
}

function attachCardEvents() {
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => openDetail(card));
  });
}

function openDetail(card) {
  if (!card || activeModal) return;

  const product = PRODUCTS.find((p) => p.id === card.dataset.id);
  if (!product) return;

  activeOriginCard = card;

  const rect = card.getBoundingClientRect();
  const width = Math.min(window.innerWidth * 0.92, 420);
  const left = (window.innerWidth - width) / 2;

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";

  const modal = document.createElement("div");
  modal.className = "product-modal";

  modal.innerHTML = `
    <img src="${product.image}" class="modal-image" alt="${product.flavor}" />

    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      ${SIZE_OPTIONS.map((s, i) => `
        <button class="pill ${i === 1 ? "active" : ""}" data-size="${s}" type="button">
          ${s}
        </button>
      `).join("")}
    </div>

    <div class="quantity">
      <button class="qty minus" type="button" aria-label="Decrease quantity">−</button>
      <span class="qty-value">1</span>
      <button class="qty plus" type="button" aria-label="Increase quantity">+</button>
    </div>

    <button class="cta" type="button">Fill the DogBowl™</button>
  `;

  Object.assign(modal.style, {
    position: "fixed",
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
    transition: "all 260ms ease",
    borderRadius: "16px",
    zIndex: 9999
  });

  document.body.append(overlay, modal);
  document.body.classList.add("product-detail-open");
  card.style.visibility = "hidden";

  activeOverlay = overlay;
  activeModal = modal;

  bindModal(modal, overlay);

  requestAnimationFrame(() => {
    Object.assign(modal.style, {
      left: left + "px",
      top: "9vh",
      width: width + "px",
      height: "auto",
      maxHeight: "72vh",
      transform: "none",
      borderRadius: "20px"
    });
  });
}

function bindModal(modal, overlay) {
  let qty = 1;
  let size = "Regular";

  const qtyEl = modal.querySelector(".qty-value");

  modal.querySelector(".plus").onclick = (e) => {
    e.stopPropagation();
    qty += 1;
    qtyEl.textContent = qty;
  };

  modal.querySelector(".minus").onclick = (e) => {
    e.stopPropagation();
    qty = Math.max(1, qty - 1);
    qtyEl.textContent = qty;
  };

  modal.querySelectorAll(".pill").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      modal.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      size = btn.dataset.size;
    };
  });

  modal.querySelector(".cta").onclick = (e) => {
    e.stopPropagation();
    console.log({ size, qty });
    closeModal();
  };

  overlay.onclick = closeModal;
}

function closeModal() {
  if (!activeModal) return;

  const rect = activeOriginCard?.getBoundingClientRect();

  if (rect) {
    Object.assign(activeModal.style, {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
      transform: "none",
      borderRadius: "16px"
    });
  }

  const m = activeModal;
  const o = activeOverlay;
  const c = activeOriginCard;

  activeModal = null;
  activeOverlay = null;
  activeOriginCard = null;

  setTimeout(() => {
    m.remove();
    o.remove();
    document.body.classList.remove("product-detail-open");
    if (c) c.style.visibility = "";
  }, 260);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

renderProducts();
