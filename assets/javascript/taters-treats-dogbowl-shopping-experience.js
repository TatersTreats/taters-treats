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

const SIZE_OPTIONS = ["Regular", "Value"];
const SIZE_COUNTS = {
  Regular: 1,
  Value: 2
};

const SCROLL_DURATION_MS = 420;
const MODAL_CLOSE_DURATION_MS = 320;
const WOOFLE_FLIGHT_DURATION_MS = 560;
const MODAL_ENTER_DELAY_MS = 70;
const WOOFLE_STAGGER_MS = 60;
const BOWL_TARGET = {
  centerX: 0.5,
  centerY: 0.7,
  radiusX: 0.17,
  radiusY: 0.068
};

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");
const headerEl = document.querySelector(".site-header");

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlItemsLayer: null,
  isOpening: false
};

function initHeroAndBridge() {
  const heroHeading = document.querySelector(".hero h1");
if (heroHeading) {
  heroHeading.innerHTML = `
    <span>Dogs Deserve</span>
    <span>The Best</span>
  `;
}

  const missionBox = document.querySelector(".hero-bridge");
  if (missionBox) {
    missionBox.innerHTML = `
      <p class="hero-bridge-kicker">Premium, Small-batch Canine Confections</p>
      <h2>For Dogs Who Deserve More Than Just Treats. Like Tater.</h2>
    `;
  }

  if (shopEl) {
    const existingIntro = shopEl.querySelector(".shop-intro");

    if (!existingIntro) {
      const intro = document.createElement("div");
      intro.className = "shop-intro";
      intro.innerHTML = `
        <p class="shop-intro-line">Three flavors. Two sizes. One happy dog.</p>
      `;
      shopEl.prepend(intro);
    } else {
      const line = existingIntro.querySelector(".shop-intro-line");
      if (line) {
        line.textContent = "Three flavors. Two sizes. One happy dog.";
      }
    }
  }
}

function renderProducts() {
  if (!productsEl) return;

  productsEl.innerHTML = PRODUCTS.map((product) => `
    <article
      class="product-card"
      data-id="${product.id}"
      tabindex="0"
      role="button"
      aria-label="Open ${product.flavor}"
    >
      <div class="product-image">
        <img src="${product.image}" alt="${product.flavor}" />
      </div>
      <span class="product-flavor">${formatFlavorLabel(product.flavor)}</span>
    </article>
  `).join("");

  attachCardEvents();
}

function attachCardEvents() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      openDetail(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(card);
      }
    });
  });
}

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}

function formatFlavorLabel(flavor) {
  const parts = flavor.split(" & ");

  if (parts.length !== 2) {
    return flavor;
  }

  return `
    <span class="flavor-line">${parts[0]}</span>
    <span class="flavor-line amp">&amp;</span>
    <span class="flavor-line">${parts[1]}</span>
  `;
}

  return `
    <span class="product-flavor-line">${parts[0]}</span>
    <span class="product-flavor-line product-flavor-amp">&amp;</span>
    <span class="product-flavor-line">${parts[1]}</span>
  `;
}

function getShopScrollTarget() {
  if (!shopEl) return window.scrollY;

  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.offsetHeight : 0;
  const breathingOffset = 12;

  return Math.max(
    0,
    window.scrollY + shopEl.getBoundingClientRect().top - headerOffset - breathingOffset
  );
}

function scrollToShop() {
  return new Promise((resolve) => {
    const targetTop = getShopScrollTarget();

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });

    window.setTimeout(resolve, SCROLL_DURATION_MS);
  });
}

function createModalMarkup(product) {
  return `
    <img src="${product.image}" class="modal-image" alt="${product.flavor}" />

    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      ${SIZE_OPTIONS.map((size, index) => `
        <button
          class="pill ${index === 0 ? "active" : ""}"
          data-size="${size}"
          type="button"
        >
          ${size}
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
}

async function openDetail(card) {
  if (!card || state.activeModal || state.isOpening) return;

  const product = getProductById(card.dataset.id);
  if (!product) return;

  state.isOpening = true;

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";

  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", product.flavor);
  modal.innerHTML = createModalMarkup(product);

  const headerHeight = headerEl ? headerEl.offsetHeight : 0;
  document.body.style.setProperty("--header-offset", `${headerHeight + 18}px`);

  document.body.append(overlay, modal);
  document.body.classList.add("product-detail-open");

  state.activeOverlay = overlay;
  state.activeModal = modal;

  bindModal(modal, overlay, product);

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  const scrollPromise = scrollToShop();

  window.setTimeout(() => {
    if (state.activeModal === modal) {
      modal.classList.add("active");
    }
    state.isOpening = false;
  }, MODAL_ENTER_DELAY_MS);

  await scrollPromise;
}

function ensureBowlItemsLayer() {
  if (!bowlFrameEl) return null;

  if (!state.bowlItemsLayer) {
    let layer = bowlFrameEl.querySelector(".static-bowl-items");

    if (!layer) {
      layer = document.createElement("div");
      layer.className = "static-bowl-items";
      bowlFrameEl.appendChild(layer);
    }

    state.bowlItemsLayer = layer;
  }

  return state.bowlItemsLayer;
}

function createBowlTarget(indexOffset = 0) {
  if (!bowlFrameEl) return null;

  const bowlRect = bowlFrameEl.getBoundingClientRect();
  const theta = Math.random() * Math.PI * 2;
  const radial = Math.sqrt(Math.random());

  const xNorm = BOWL_TARGET.centerX + Math.cos(theta) * radial * BOWL_TARGET.radiusX;
  const yNorm = BOWL_TARGET.centerY + Math.sin(theta) * radial * BOWL_TARGET.radiusY;

  const clampedX = Math.min(0.66, Math.max(0.34, xNorm));
  const clampedY = Math.min(0.76, Math.max(0.58, yNorm));
  const rotation = -16 + Math.random() * 32;
  const zIndex = 4 + indexOffset;

  return {
    xPx: clampedX * bowlRect.width,
    yPx: clampedY * bowlRect.height,
    xPercent: clampedX * 100,
    yPercent: clampedY * 100,
    rotation,
    zIndex
  };
}

function addWoofleToBowl(imageSrc, targetPoint) {
  const layer = ensureBowlItemsLayer();
  if (!layer || !targetPoint) return;

  const item = document.createElement("img");
  item.className = "static-bowl-woofle";
  item.src = imageSrc;
  item.alt = "";

  item.style.left = `${targetPoint.xPercent}%`;
  item.style.top = `${targetPoint.yPercent}%`;
  item.style.zIndex = String(targetPoint.zIndex);
  item.style.transform = `translate(-50%, -50%) rotate(${targetPoint.rotation}deg)`;

  layer.appendChild(item);
}

function launchWoofleFromCTA(button, imageSrc, count) {
  if (!button || !bowlFrameEl || count < 1) return;

  const buttonRect = button.getBoundingClientRect();

  for (let index = 0; index < count; index += 1) {
    const targetPoint = createBowlTarget(index);
    if (!targetPoint) continue;

    const bowlRect = bowlFrameEl.getBoundingClientRect();
    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;
    flight.alt = "";

    const startLeft = buttonRect.left + buttonRect.width / 2;
    const startTop = buttonRect.top + 4;
    const endLeft = bowlRect.left + targetPoint.xPx;
    const endTop = bowlRect.top + targetPoint.yPx;

    flight.style.left = `${startLeft}px`;
    flight.style.top = `${startTop}px`;
    flight.style.transform = "translate(-50%, -50%) rotate(0deg)";
    flight.style.opacity = "1";

    document.body.appendChild(flight);

    window.setTimeout(() => {
      flight.style.left = `${endLeft}px`;
      flight.style.top = `${endTop}px`;
      flight.style.transform = `translate(-50%, -50%) rotate(${targetPoint.rotation}deg)`;
    }, index * WOOFLE_STAGGER_MS);

    window.setTimeout(() => {
      addWoofleToBowl(imageSrc, targetPoint);
      flight.remove();
    }, WOOFLE_FLIGHT_DURATION_MS + index * WOOFLE_STAGGER_MS);
  }
}

function bindModal(modal, overlay, product) {
  let quantity = 1;
  let selectedSize = "Regular";

  const quantityValueEl = modal.querySelector(".qty-value");
  const plusButton = modal.querySelector(".plus");
  const minusButton = modal.querySelector(".minus");
  const sizeButtons = modal.querySelectorAll(".pill");
  const ctaButton = modal.querySelector(".cta");

  plusButton?.addEventListener("click", () => {
    quantity += 1;
    if (quantityValueEl) {
      quantityValueEl.textContent = String(quantity);
    }
  });

  minusButton?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    if (quantityValueEl) {
      quantityValueEl.textContent = String(quantity);
    }
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sizeButtons.forEach((otherButton) => {
        otherButton.classList.remove("active");
      });

      button.classList.add("active");
      selectedSize = button.dataset.size || "Regular";
    });
  });

  ctaButton?.addEventListener("click", () => {
    const totalWoofles = (SIZE_COUNTS[selectedSize] || 1) * quantity;
    launchWoofleFromCTA(ctaButton, product.image, totalWoofles);
    closeModal();
  });

  overlay.addEventListener("click", closeModal);
}

function closeModal() {
  if (!state.activeModal || !state.activeOverlay) return;

  const modal = state.activeModal;
  const overlay = state.activeOverlay;

  state.activeModal = null;
  state.activeOverlay = null;
  state.isOpening = false;

  overlay.classList.remove("active");
  modal.classList.remove("active");

  window.setTimeout(() => {
    modal.remove();
    overlay.remove();
    document.body.classList.remove("product-detail-open");
    document.body.style.removeProperty("--header-offset");
  }, MODAL_CLOSE_DURATION_MS);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

initHeroAndBridge();
renderProducts();
