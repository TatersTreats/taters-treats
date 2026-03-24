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
let bowlActivated = false;

function renderProducts() {
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
  if (activeModal) return;

  const product = PRODUCTS.find((p) => p.id === card.dataset.id);

  const rect = card.getBoundingClientRect();
  const width = Math.min(window.innerWidth * 0.84, 360);
  const left = (window.innerWidth - width) / 2;

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";

  const modal = document.createElement("div");
  modal.className = "product-modal";

  modal.innerHTML = `
    <img src="${product.image}" class="modal-image" />

    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      ${SIZE_OPTIONS.map((s, i) => `
        <button class="pill ${i === 1 ? "active" : ""}" data-size="${s}">
          ${s}
        </button>
      `).join("")}
    </div>

    <div class="quantity">
      <button class="qty minus">−</button>
      <span class="qty-value">1</span>
      <button class="qty plus">+</button>
    </div>

    <button class="cta">Fill the DogBowl™</button>
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
  activeOriginCard = card;

  bindModal(modal, overlay);

  requestAnimationFrame(() => {
    Object.assign(modal.style, {
      left: left + "px",
      top: "9vh",
      width: width + "px",
      height: "auto",
      maxHeight: "74vh",
      transform: "none",
      borderRadius: "20px"
    });
  });
}

function bindModal(modal, overlay) {
  let qty = 1;

  const qtyEl = modal.querySelector(".qty-value");

  modal.querySelector(".plus").onclick = e => {
    e.stopPropagation();
    qty++;
    qtyEl.textContent = qty;
  };

  modal.querySelector(".minus").onclick = e => {
    e.stopPropagation();
    qty = Math.max(1, qty - 1);
    qtyEl.textContent = qty;
  };

  modal.querySelectorAll(".pill").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      modal.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  modal.querySelector(".cta").onclick = e => {
    e.stopPropagation();

    activateBowl();

    closeModal();
  };

  overlay.onclick = closeModal;
}

function activateBowl() {
  if (bowlActivated) return;

  const bowl = document.createElement("div");
  bowl.className = "floating-bowl";
  bowl.innerHTML = "🦴";

  document.body.appendChild(bowl);

  setTimeout(() => bowl.classList.add("active"), 10);

  bowlActivated = true;
}

function closeModal() {
  if (!activeModal) return;

  const rect = activeOriginCard.getBoundingClientRect();

  Object.assign(activeModal.style, {
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
    transform: "none"
  });

  const m = activeModal;
  const o = activeOverlay;
  const c = activeOriginCard;

  activeModal = activeOverlay = activeOriginCard = null;

  setTimeout(() => {
    m.remove();
    o.remove();
    document.body.classList.remove("product-detail-open");
    c.style.visibility = "";
  }, 260);
}

renderProducts();
