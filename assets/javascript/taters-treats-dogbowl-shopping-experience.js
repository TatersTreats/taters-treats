const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin Turmeric",
    description: "Supports gentle digestion",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Peanut Butter Mint Carob",
    description: "Helps freshen breath",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter Ginger",
    description: "Helps soothe the tummy",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

const productsEl = document.getElementById("products");

let activeOverlay = null;
let activeModal = null;
let activeOriginCard = null;

/* ---------- RENDER ---------- */

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

/* ---------- INTERACTION ---------- */

function attachCardEvents() {
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      openDetail(card);
    });
  });
}

/* ---------- DETAIL VIEW ---------- */

function openDetail(card) {
  if (!card || activeModal) return;

  const id = card.dataset.id;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  activeOriginCard = card;

  const originRect = card.getBoundingClientRect();
  const modalWidth = Math.min(window.innerWidth * 0.92, 420);
  const modalLeft = (window.innerWidth - modalWidth) / 2;

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 220ms ease";

  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.innerHTML = `
    <img src="${product.image}" class="modal-image" alt="${product.flavor}" />

    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      <button class="pill active" type="button">Trial</button>
      <button class="pill" type="button">Regular</button>
      <button class="pill" type="button">Value</button>
    </div>

    <div class="quantity">
      <button class="qty minus" type="button">−</button>
      <span class="qty-value">1</span>
      <button class="qty plus" type="button">+</button>
    </div>

    <button class="cta" type="button">Fill the DogBowl™</button>
  `;

  modal.style.position = "fixed";
  modal.style.left = `${originRect.left}px`;
  modal.style.top = `${originRect.top}px`;
  modal.style.width = `${originRect.width}px`;
  modal.style.height = `${originRect.height}px`;
  modal.style.margin = "0";
  modal.style.transform = "none";
  modal.style.transformOrigin = "center center";
  modal.style.overflow = "hidden";
  modal.style.transition =
    "left 260ms ease, top 260ms ease, width 260ms ease, height 260ms ease, border-radius 260ms ease, box-shadow 260ms ease";
  modal.style.borderRadius = "16px";
  modal.style.zIndex = "9999";

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  document.body.classList.add("product-detail-open");
  card.style.visibility = "hidden";

  activeOverlay = overlay;
  activeModal = modal;

  attachModalEvents(modal, overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    modal.style.left = `${modalLeft}px`;
    modal.style.top = "50%";
    modal.style.width = `${modalWidth}px`;
    modal.style.height = "auto";
    modal.style.maxHeight = "86vh";
    modal.style.transform = "translateY(-42%)";
    modal.style.borderRadius = "20px";
  });
}

function attachModalEvents(modal, overlay) {
  let qty = 1;
  const qtyEl = modal.querySelector(".qty-value");

  modal.querySelector(".plus").addEventListener("click", (event) => {
    event.stopPropagation();
    qty += 1;
    qtyEl.textContent = qty;
  });

  modal.querySelector(".minus").addEventListener("click", (event) => {
    event.stopPropagation();
    qty -= 1;
    if (qty < 1) qty = 1;
    qtyEl.textContent = qty;
  });

  modal.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      modal.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  modal.querySelector(".cta").addEventListener("click", (event) => {
    event.stopPropagation();
    closeModal();
  });

  overlay.addEventListener("click", closeModal);
}

function closeModal() {
  if (!activeModal || !activeOverlay) return;

  const originCard = activeOriginCard;
  const originRect = originCard
    ? originCard.getBoundingClientRect()
    : null;

  activeOverlay.style.opacity = "0";

  if (originRect) {
    activeModal.style.left = `${originRect.left}px`;
    activeModal.style.top = `${originRect.top}px`;
    activeModal.style.width = `${originRect.width}px`;
    activeModal.style.height = `${originRect.height}px`;
    activeModal.style.maxHeight = `${originRect.height}px`;
    activeModal.style.transform = "none";
    activeModal.style.borderRadius = "16px";
  }

  const modalToRemove = activeModal;
  const overlayToRemove = activeOverlay;
  const cardToRestore = activeOriginCard;

  activeModal = null;
  activeOverlay = null;
  activeOriginCard = null;

  setTimeout(() => {
    overlayToRemove.remove();
    modalToRemove.remove();
    document.body.classList.remove("product-detail-open");
    if (cardToRestore) {
      cardToRestore.style.visibility = "";
    }
  }, 260);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* ---------- INIT ---------- */

renderProducts();
