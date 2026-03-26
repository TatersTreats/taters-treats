const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin & Turmeric",
    description: "Gentle on sensitive stomachs",
    image: "assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Mint & Carob",
    description: "Freshens breath naturally",
    image: "assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter & Ginger",
    description: "Comforts and settles the tummy",
    image: "assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

const SIZE_OPTIONS = ["Regular", "Double"];
const SIZE_COUNTS = { Regular: 1, Double: 2 };
const SCROLL_DURATION_MS = 420;
const MODAL_CLOSE_DURATION_MS = 320;
const WOOFLE_FLIGHT_DURATION_MS = 620;
const MODAL_ENTER_DELAY_MS = 70;
const WOOFLE_STAGGER_MS = 60;
const QUANTITY_DRAG_STEP_PX = 24;
const FEEDBACK_PULSE_MS = 180;
const BOWL_TARGET = {
  centerX: 0.5,
  centerY: 0.69,
  radiusX: 0.11,
  radiusY: 0.045
};

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");
const bowlImageEl = document.getElementById("bowlImage");
const bowlNoteEl = document.getElementById("bowlNote");
const cartCountEl = document.getElementById("cartCount");
const clearCartButton = document.getElementById("clearCartButton");
const checkoutButton = document.getElementById("checkoutButton");
const cartStatus = document.getElementById("cartStatus");
const headerEl = document.querySelector(".site-header");

const BOWL_STATES = {
  empty: {
    image: "assets/images/dogbowl/dogbowl-empty-state.png",
    note: "Your DogBowl™ is empty."
  },
  lightly: {
    image: "assets/images/dogbowl/dogbowl-lightly-filled-state.png",
    note: "A little something good is in the bowl."
  },
  medium: {
    image: "assets/images/dogbowl/dogbowl-medium-filled-state.png",
    note: "Now that looks generous."
  },
  full: {
    image: "assets/images/dogbowl/dogbowl-generously-filled-state.png",
    note: "That DogBowl™ looks very loved."
  }
};

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlItemsLayer: null,
  isOpening: false,
  bowlCount: 0
};

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
        <img src="${product.image}" alt="${product.flavor}" class="woofle">
      </div>
      <span class="product-flavor">${formatFlavorLabel(product.flavor)}</span>
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

function formatFlavorLabel(flavor) {
  const parts = flavor.split(" & ");
  if (parts.length !== 2) return flavor;

  return `
    <span class="flavor-line">${parts[0]}</span>
    <span class="flavor-line amp">&amp;</span>
    <span class="flavor-line">${parts[1]}</span>
  `;
}

function getShopScrollTarget() {
  if (!shopEl) return window.scrollY;
  const headerOffset = headerEl ? headerEl.offsetHeight : 0;
  return Math.max(0, window.scrollY + shopEl.getBoundingClientRect().top - headerOffset - 12);
}

function scrollToShop() {
  return new Promise((resolve) => {
    window.scrollTo({ top: getShopScrollTarget(), behavior: "smooth" });
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
        <button class="pill ${index === 0 ? "active" : ""}" data-size="${size}" type="button">${size}</button>
      `).join("")}
    </div>
    <div class="quantity">
      <div class="brass-stepper" data-quantity-stepper>
        <button class="qty qty-minus" type="button" aria-label="Decrease quantity">−</button>
        <div class="qty-dial" aria-label="Quantity display">
          <span class="qty-value">1</span>
        </div>
        <button class="qty qty-plus" type="button" aria-label="Increase quantity">+</button>
      </div>
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
  requestAnimationFrame(() => overlay.classList.add("active"));
  const scrollPromise = scrollToShop();

  window.setTimeout(() => {
    if (state.activeModal === modal) modal.classList.add("active");
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

function updateBowlUi() {
  const count = state.bowlCount;
  if (cartCountEl) cartCountEl.textContent = String(count);

  let bowlState = BOWL_STATES.empty;
  if (count >= 5) {
    bowlState = BOWL_STATES.full;
  } else if (count >= 3) {
    bowlState = BOWL_STATES.medium;
  } else if (count >= 1) {
    bowlState = BOWL_STATES.lightly;
  }

  if (bowlImageEl) {
    bowlImageEl.src = bowlState.image;
  }
  if (bowlNoteEl) {
    bowlNoteEl.textContent = bowlState.note;
  }
}

function launchWoofleFromCTA(sourceEl, imageSrc, count) {
  if (!sourceEl || !bowlFrameEl || count < 1) return;
  const sourceRect = sourceEl.getBoundingClientRect();

  for (let index = 0; index < count; index += 1) {
    const targetPoint = createBowlTarget(index);
    if (!targetPoint) continue;
    const bowlRect = bowlFrameEl.getBoundingClientRect();
    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;
    flight.alt = "";

    const startLeft = sourceRect.left + sourceRect.width / 2;
    const startTop = sourceRect.top + sourceRect.height * 0.42;
    const endLeft = bowlRect.left + targetPoint.xPx;
    const endTop = bowlRect.top + targetPoint.yPx;

    flight.style.left = `${startLeft}px`;
    flight.style.top = `${startTop}px`;
    flight.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
    flight.style.opacity = "1";
    document.body.appendChild(flight);

    window.setTimeout(() => {
      flight.style.left = `${endLeft}px`;
      flight.style.top = `${endTop}px`;
      flight.style.transform = `translate(-50%, -50%) scale(0.9) rotate(${targetPoint.rotation}deg)`;
    }, index * WOOFLE_STAGGER_MS);

    window.setTimeout(() => {
      addWoofleToBowl(imageSrc, targetPoint);
      flight.remove();
    }, WOOFLE_FLIGHT_DURATION_MS + index * WOOFLE_STAGGER_MS);
  }
}

function pulseQuantityFeedback(stepper) {
  if (!stepper) return;
  stepper.classList.remove("is-changing");
  void stepper.offsetWidth;
  stepper.classList.add("is-changing");
  window.setTimeout(() => stepper.classList.remove("is-changing"), FEEDBACK_PULSE_MS);
}

function bindQuantityDial({ dialEl, valueEl, stepperEl, getQuantity, setQuantity }) {
  if (!dialEl || !valueEl) return;
  let pointerId = null;
  let startY = 0;
  let carry = 0;

  const updateAria = () => {
    dialEl.setAttribute("aria-valuenow", String(getQuantity()));
    dialEl.setAttribute("aria-valuetext", `${getQuantity()}`);
  };

  const applyStepFromDrag = (deltaY) => {
    const raw = carry + deltaY;
    const steps = Math.trunc(raw / QUANTITY_DRAG_STEP_PX);
    if (steps === 0) return;
    carry = raw - steps * QUANTITY_DRAG_STEP_PX;
    if (steps > 0) {
      setQuantity(Math.max(1, getQuantity() - steps));
    } else {
      setQuantity(getQuantity() + Math.abs(steps));
    }
    pulseQuantityFeedback(stepperEl);
    updateAria();
  };

  dialEl.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    startY = event.clientY;
    carry = 0;
    dialEl.classList.add("is-dragging");
    dialEl.setPointerCapture(pointerId);
  });

  dialEl.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const deltaY = event.clientY - startY;
    applyStepFromDrag(deltaY);
    startY = event.clientY;
  });

  const endDrag = (event) => {
    if (pointerId !== event.pointerId) return;
    dialEl.classList.remove("is-dragging");
    if (dialEl.hasPointerCapture(pointerId)) dialEl.releasePointerCapture(pointerId);
    pointerId = null;
    carry = 0;
    updateAria();
  };

  dialEl.addEventListener("pointerup", endDrag);
  dialEl.addEventListener("pointercancel", endDrag);
  dialEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      setQuantity(getQuantity() + 1);
      pulseQuantityFeedback(stepperEl);
      updateAria();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      setQuantity(Math.max(1, getQuantity() - 1));
      pulseQuantityFeedback(stepperEl);
      updateAria();
    }
  });

  updateAria();
}

function bindModal(modal, overlay, product) {
  let quantity = 1;
  let selectedSize = "Regular";

  const valueEl = modal.querySelector(".qty-value");
  const dialEl = modal.querySelector(".qty-dial");
  const stepperEl = modal.querySelector("[data-quantity-stepper]");
  const plusButton = modal.querySelector(".qty-plus");
  const minusButton = modal.querySelector(".qty-minus");
  const sizeButtons = modal.querySelectorAll(".pill");
  const ctaButton = modal.querySelector(".cta");
  const modalImage = modal.querySelector(".modal-image");

  const setQuantity = (nextQuantity) => {
    quantity = Math.max(1, nextQuantity);
    if (valueEl) valueEl.textContent = String(quantity);
    if (dialEl) {
      dialEl.setAttribute("aria-valuenow", String(quantity));
      dialEl.setAttribute("aria-valuetext", `${quantity}`);
    }
  };

  modal.addEventListener("click", (event) => event.stopPropagation());
  plusButton?.addEventListener("click", () => {
    setQuantity(quantity + 1);
    pulseQuantityFeedback(stepperEl);
  });
  minusButton?.addEventListener("click", () => {
    setQuantity(quantity - 1);
    pulseQuantityFeedback(stepperEl);
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sizeButtons.forEach((otherButton) => otherButton.classList.remove("active"));
      button.classList.add("active");
      selectedSize = button.dataset.size || "Regular";
    });
  });

  ctaButton?.addEventListener("click", () => {
    const totalWoofles = (SIZE_COUNTS[selectedSize] || 1) * quantity;
    launchWoofleFromCTA(modalImage || ctaButton, product.image, totalWoofles);
    state.bowlCount += quantity;
    updateBowlUi();
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

clearCartButton?.addEventListener("click", () => {
  const layer = ensureBowlItemsLayer();
  if (layer) layer.innerHTML = "";
  state.bowlCount = 0;
  updateBowlUi();
  if (cartStatus) cartStatus.textContent = "DogBowl™ cleared.";
  window.setTimeout(() => {
    if (cartStatus) cartStatus.textContent = "";
  }, 1400);
});

}
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

renderProducts();
updateBowlUi();
