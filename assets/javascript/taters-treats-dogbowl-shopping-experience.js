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
const SIZE_COUNTS = {
  Trial: 1,
  Regular: 2,
  Value: 3
};

const productsEl = document.getElementById("products");

let activeOverlay = null;
let activeModal = null;
let activeOriginCard = null;
let bowlEl = null;
let bowlItemsEl = null;
let bowlDragState = null;

function initHeroAndBridge() {
  const heroHeading = document.querySelector(".hero h1");
  if (heroHeading) {
    heroHeading.innerHTML = `Dogs Deserve<br>The Best.`;
  }

  const sectionHead = document.querySelector(".shop .section-head");
  if (sectionHead) {
    sectionHead.className = "section-head hero-bridge";
    sectionHead.innerHTML = `
      <p class="hero-bridge-kicker">Premium, Small-batch Canine Confections</p>
      <h2>For Dogs Who Deserve More Than Just Treats. Like Tater.</h2>
      <p class="hero-bridge-support">Three flavors. Three sizes. One happy dog.</p>
    `;
  }
}

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
  const width = Math.min(window.innerWidth * 0.82, 352);
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

  bindModal(modal, overlay, product);

  requestAnimationFrame(() => {
    Object.assign(modal.style, {
      left: `${left}px`,
      top: "8vh",
      width: `${width}px`,
      height: "auto",
      maxHeight: "76vh",
      transform: "none",
      borderRadius: "22px"
    });
  });
}

function bindModal(modal, overlay, product) {
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
    activateBowl(product, size, qty);
    closeModal();
  };

  overlay.onclick = closeModal;
}

function ensureFloatingBowl() {
  if (bowlEl) return;

  bowlEl = document.createElement("div");
  bowlEl.className = "floating-bowl";
  bowlEl.innerHTML = `
    <div class="floating-bowl-shell">
      <div class="floating-bowl-rim"></div>
      <div class="floating-bowl-inner"></div>
      <div class="floating-bowl-items"></div>
    </div>
  `;

  bowlItemsEl = bowlEl.querySelector(".floating-bowl-items");
  document.body.appendChild(bowlEl);

  bowlEl.addEventListener("pointerdown", startBowlDrag);
}

function activateBowl(product, size, quantity) {
  ensureFloatingBowl();

  bowlEl.classList.add("active", "bounce-in");

  const countPerUnit = SIZE_COUNTS[size] || 1;
  const totalWoofles = countPerUnit * quantity;

  for (let i = 0; i < totalWoofles; i += 1) {
    addWoofleToBowl(product.image, i);
  }

  window.setTimeout(() => {
    bowlEl.classList.remove("bounce-in");
  }, 420);
}

function addWoofleToBowl(imageSrc, indexOffset) {
  if (!bowlItemsEl) return;

  const item = document.createElement("img");
  item.className = "bowl-woofle";
  item.src = imageSrc;
  item.alt = "";

  const left = 14 + Math.random() * 56;
  const bottom = 10 + Math.random() * 62 + (indexOffset % 3) * 3;
  const rotation = -20 + Math.random() * 40;
  const scale = 0.74 + Math.random() * 0.16;

  item.style.left = `${left}%`;
  item.style.bottom = `${bottom}px`;
  item.style.transform = `translateX(-50%) rotate(${rotation}deg) scale(${scale})`;

  bowlItemsEl.appendChild(item);

  requestAnimationFrame(() => {
    item.classList.add("landed");
  });
}

function startBowlDrag(e) {
  if (!bowlEl) return;

  const rect = bowlEl.getBoundingClientRect();
  bowlDragState = {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top
  };

  bowlEl.classList.add("dragging");
  bowlEl.setPointerCapture(e.pointerId);
  bowlEl.style.left = `${rect.left}px`;
  bowlEl.style.top = `${rect.top}px`;
  bowlEl.style.right = "auto";
  bowlEl.style.bottom = "auto";

  bowlEl.addEventListener("pointermove", onBowlDrag);
  bowlEl.addEventListener("pointerup", stopBowlDrag);
  bowlEl.addEventListener("pointercancel", stopBowlDrag);
}

function onBowlDrag(e) {
  if (!bowlEl || !bowlDragState) return;

  const nextLeft = e.clientX - bowlDragState.offsetX;
  const nextTop = e.clientY - bowlDragState.offsetY;

  bowlEl.style.left = `${Math.max(8, Math.min(window.innerWidth - bowlEl.offsetWidth - 8, nextLeft))}px`;
  bowlEl.style.top = `${Math.max(8, Math.min(window.innerHeight - bowlEl.offsetHeight - 8, nextTop))}px`;
}

function stopBowlDrag(e) {
  if (!bowlEl) return;

  bowlEl.classList.remove("dragging");
  bowlDragState = null;

  bowlEl.removeEventListener("pointermove", onBowlDrag);
  bowlEl.removeEventListener("pointerup", stopBowlDrag);
  bowlEl.removeEventListener("pointercancel", stopBowlDrag);

  try {
    bowlEl.releasePointerCapture(e.pointerId);
  } catch (err) {
    // no-op
  }
}

function closeModal() {
  if (!activeModal) return;

  const rect = activeOriginCard?.getBoundingClientRect();

  if (rect) {
    Object.assign(activeModal.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: "none",
      borderRadius: "16px"
    });
  }

  if (activeOverlay) {
    activeOverlay.style.opacity = "0";
  }

  const m = activeModal;
  const o = activeOverlay;
  const c = activeOriginCard;

  activeModal = null;
  activeOverlay = null;
  activeOriginCard = null;

  window.setTimeout(() => {
    if (m) m.remove();
    if (o) o.remove();
    document.body.classList.remove("product-detail-open");
    if (c) c.style.visibility = "";
  }, 260);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

initHeroAndBridge();
renderProducts();
