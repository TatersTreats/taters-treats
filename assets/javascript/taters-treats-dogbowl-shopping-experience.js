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
  Regular: 2,
  Value: 3
};

const SCROLL_DURATION_MS = 420;
const MODAL_CLOSE_DURATION_MS = 260;
const WOOFLE_FLIGHT_DURATION_MS = 520;
const MODAL_ENTER_DELAY_MS = 70;

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlItemsLayer: null,
  isOpening: false
};

function initHeroAndBridge() {
  const heroHeading = document.querySelector(".hero h1");
  if (heroHeading) {
    heroHeading.innerHTML = "Dogs<br>Deserve<br>The Best.";
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
      <span class="product-flavor">${product.flavor}</span>
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
    const layer = document.createElement("div");
    layer.className = "static-bowl-items";
    bowlFrameEl.appendChild(layer);
    state.bowlItemsLayer = layer;
  }

  return state.bowlItemsLayer;
}

function addWoofleToBowl(imageSrc, indexOffset = 0) {
  const layer = ensureBowlItemsLayer();
  if (!layer) return;

  const item = document.createElement("img");
  item.className = "static-bowl-woofle";
  item.src = imageSrc;
  item.alt = "";

  const left = 38 + Math.random() * 24;
  const bottom = 18 + Math.random() * 28;
  const rotation = -20 + Math.random() * 40;
  const scale = 0.8 + Math.random() * 0.2;

  item.style.left = `${left}%`;
  item.style.bottom = `${bottom}px`;
  item.style.maxWidth = "48px";
  item.style.transform = `translate(-50%, 0) rotate(${rotation}deg) scale(${scale})`;

  layer.appendChild(item);
}

function launchWoofleFromCTA(button, imageSrc, count) {
  if (!button || !bowlFrameEl || count < 1) return;

  const buttonRect = button.getBoundingClientRect();
  const bowlRect = bowlFrameEl.getBoundingClientRect();

  for (let index = 0; index < count; index += 1) {
    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;
    flight.alt = "";

    const startLeft = buttonRect.left + buttonRect.width / 2;
    const startTop = buttonRect.top + 4;
    const endLeft = bowlRect.left + bowlRect.width / 2 + (-18 + Math.random() * 36);
    const endTop = bowlRect.top + bowlRect.height / 2 + (-10 + Math.random() * 18);

    flight.style.left = `${startLeft}px`;
    flight.style.top = `${startTop}px`;
    flight.style.transform = "translate(-50%, 0) scale(0.82) rotate(0deg)";
    flight.style.opacity = "1";

    document.body.appendChild(flight);

    window.setTimeout(() => {
      flight.style.left = `${endLeft}px`;
      flight.style.top = `${endTop}px`;
      flight.style.transform = `translate(-50%, -50%) scale(${0.96 + Math.random() * 0.12}) rotate(${-18 + Math.random() * 36}deg)`;
    }, index * 55);

    window.setTimeout(() => {
      addWoofleToBowl(imageSrc, index);
      flight.remove();
    }, WOOFLE_FLIGHT_DURATION_MS + index * 55);
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
  }, MODAL_CLOSE_DURATION_MS);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

initHeroAndBridge();
renderProducts();
