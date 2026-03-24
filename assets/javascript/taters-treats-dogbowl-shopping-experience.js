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
const MODAL_CLOSE_DURATION_MS = 320;
const WOOFLE_FLIGHT_DURATION_MS = 620;
const MODAL_ENTER_DELAY_MS = 70;

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlInnerEl: null,
  bowlItemsLayer: null,
  isOpening: false
};

function initShopIntro() {
  if (!shopEl) return;

  const sectionHead = shopEl.querySelector(".section-head");
  if (sectionHead) {
    sectionHead.innerHTML = `
      <h2 class="shop-intro-line">Three flavors. Two sizes. One happy dog.</h2>
    `;
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
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => openDetail(card));
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
  const breathingOffset = 10;

  return Math.max(
    0,
    window.scrollY + shopEl.getBoundingClientRect().top - headerOffset - breathingOffset
  );
}

function scrollToShop() {
  return new Promise((resolve) => {
    window.scrollTo({
      top: getShopScrollTarget(),
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

function ensureBowlLayers() {
  if (!bowlFrameEl) return { inner: null, items: null };

  if (!state.bowlInnerEl) {
    let inner = bowlFrameEl.querySelector(".bowl-inner-target");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "bowl-inner-target";
      bowlFrameEl.appendChild(inner);
    }
    state.bowlInnerEl = inner;
  }

  if (!state.bowlItemsLayer) {
    let items = state.bowlInnerEl.querySelector(".static-bowl-items");
    if (!items) {
      items = document.createElement("div");
      items.className = "static-bowl-items";
      state.bowlInnerEl.appendChild(items);
    }
    state.bowlItemsLayer = items;
  }

  return {
    inner: state.bowlInnerEl,
    items: state.bowlItemsLayer
  };
}

function addWoofleToBowl(imageSrc, indexOffset = 0) {
  const { items } = ensureBowlLayers();
  if (!items) return;

  const item = document.createElement("img");
  item.className = "static-bowl-woofle";
  item.src = imageSrc;
  item.alt = "";

  const left = 24 + Math.random() * 52;
  const bottom = 8 + Math.random() * 18 + Math.min(indexOffset, 4) * 2;
  const rotation = -18 + Math.random() * 36;
  const scale = 0.82 + Math.random() * 0.12;

  item.style.left = `${left}%`;
  item.style.bottom = `${bottom}%`;
  item.style.transform = `translate(-50%, 0) rotate(${rotation}deg) scale(${scale})`;

  items.appendChild(item);
}

function animateWoofleArc(flight, start, control, end, duration, onDone) {
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    const x =
      (1 - eased) * (1 - eased) * start.x +
      2 * (1 - eased) * eased * control.x +
      eased * eased * end.x;

    const y =
      (1 - eased) * (1 - eased) * start.y +
      2 * (1 - eased) * eased * control.y +
      eased * eased * end.y;

    const rotate = -8 + eased * 24;
    const scale = 0.82 + eased * 0.18;

    flight.style.left = `${x}px`;
    flight.style.top = `${y}px`;
    flight.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

function launchWoofleFromCTA(button, imageSrc, count) {
  const { inner } = ensureBowlLayers();
  if (!button || !inner || count < 1) return;

  const buttonRect = button.getBoundingClientRect();
  const innerRect = inner.getBoundingClientRect();

  for (let index = 0; index < count; index += 1) {
    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;
    flight.alt = "";

    const start = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2 - 4
    };

    const end = {
      x: innerRect.left + innerRect.width * (0.35 + Math.random() * 0.3),
      y: innerRect.top + innerRect.height * (0.48 + Math.random() * 0.18)
    };

    const control = {
      x: start.x + (end.x - start.x) * 0.38,
      y: Math.min(start.y, end.y) - 90 - Math.random() * 24
    };

    flight.style.left = `${start.x}px`;
    flight.style.top = `${start.y}px`;
    flight.style.opacity = "1";
    flight.style.transform = "translate(-50%, -50%) rotate(-8deg) scale(0.82)";

    document.body.appendChild(flight);

    window.setTimeout(() => {
      animateWoofleArc(
        flight,
        start,
        control,
        end,
        WOOFLE_FLIGHT_DURATION_MS,
        () => {
          addWoofleToBowl(imageSrc, index);
          flight.remove();
        }
      );
    }, index * 65);
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
    quantityValueEl.textContent = String(quantity);
  });

  minusButton?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    quantityValueEl.textContent = String(quantity);
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

  modal.classList.add("closing");
  overlay.classList.remove("active");

  state.activeModal = null;
  state.activeOverlay = null;
  state.isOpening = false;

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

initShopIntro();
renderProducts();
