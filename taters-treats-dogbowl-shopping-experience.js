const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin & Turmeric",
    description: "Gentle on sensitive stomachs",
    image: "assets/images/products/pumpkin-turmeric-woofle.png",
    displayPrices: {
      Regular: "$18 — delivered",
      Double: "$32 — delivered"
    }
  },
  {
    id: "pbmc",
    flavor: "Mint & Carob",
    description: "Freshens breath naturally",
    image: "assets/images/products/peanut-butter-mint-carob-woofle.png",
    displayPrices: {
      Regular: "$18 — delivered",
      Double: "$32 — delivered"
    }
  },
  {
    id: "ginger",
    flavor: "Peanut Butter & Ginger",
    description: "Comforts and settles the tummy",
    image: "assets/images/products/peanut-butter-ginger-woofle.png",
    displayPrices: {
      Regular: "$18 — delivered",
      Double: "$32 — delivered"
    }
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
const WOOFLE_MULTI_STAGGER_MS = 180;
const BOWL_TARGET = {
  centerX: 0.5,
  centerY: 0.57,
  ringSlots: [1, 4, 6, 8, 10],
  ringRadii: [0, 0.038, 0.062, 0.084, 0.102],
  startAngleDeg: -90,
  clampXMin: 0.31,
  clampXMax: 0.69,
  clampYMin: 0.42,
  clampYMax: 0.74
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

const BOWL_NEUTRAL = {
  image: "assets/images/dogbowl/dogbowl-ceramic-bowl-top-down.png",
  note: "Your DogBowl™ is empty."
};


const state = {
  activeOverlay: null,
  activeModal: null,
  bowlItemsLayer: null,
  isOpening: false,
  bowlCount: 0,
  cartItems: [],
  activeHandoffWoofle: null,
  activeSourceCard: null
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
    <p class="modal-price">${product.displayPrices?.Regular || "$18 — delivered"}</p>
    <p class="modal-description">${product.description}</p>
    <p class="modal-value">Small-batch. Premium ingredients. Delivered fresh.</p>
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
  state.activeSourceCard = card;
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
  const layer = ensureBowlItemsLayer();
  const existingItems = layer ? Array.from(layer.querySelectorAll(".static-bowl-woofle")) : [];
  const placementIndex = existingItems.length + indexOffset;

  const centerX = BOWL_TARGET.centerX || 0.5;
  const centerY = BOWL_TARGET.centerY || 0.57;
  const clampMinX = BOWL_TARGET.clampXMin || 0.33;
  const clampMaxX = BOWL_TARGET.clampXMax || 0.67;
  const clampMinY = BOWL_TARGET.clampYMin || 0.44;
  const clampMaxY = BOWL_TARGET.clampYMax || 0.72;

  // Approx landed woofle size in normalized bowl space.
  const itemW = 0.162;
  const itemH = 0.132;

  // Allow at most ~15% overlap.
  const minDx = itemW * 0.85;
  const minDy = itemH * 0.85;
  const minDistance = Math.min(minDx, minDy) * 0.98;

  // Center-first organic rings, but with jitter so it does not read as rigid radial stacking.
  const ringRadii = [0.000, 0.040, 0.066, 0.090, 0.110];
  const ringSlots = [1, 4, 6, 8, 10];

  let ringIndex = 0;
  let slotIndex = placementIndex;
  while (ringIndex < ringSlots.length && slotIndex >= ringSlots[ringIndex]) {
    slotIndex -= ringSlots[ringIndex];
    ringIndex += 1;
  }
  ringIndex = Math.min(ringIndex, ringSlots.length - 1);

  const tries = 40;
  let best = null;

  for (let attempt = 0; attempt < tries; attempt += 1) {
    let xNorm = centerX;
    let yNorm = centerY;

    if (ringIndex > 0) {
      const slots = ringSlots[ringIndex];
      const baseStep = (Math.PI * 2) / slots;
      const seed = placementIndex * 17 + attempt * 13 + 7;
      const angleBase = (-Math.PI / 2) + baseStep * slotIndex;
      const angleJitter = ((((seed * 37) % 100) / 100) - 0.5) * baseStep * 0.70;
      const radialJitter = ((((seed * 53) % 100) / 100) - 0.5) * 0.012;
      const xJitter = ((((seed * 29) % 100) / 100) - 0.5) * 0.010;
      const yJitter = ((((seed * 61) % 100) / 100) - 0.5) * 0.008;

      const angle = angleBase + angleJitter;
      const radius = Math.max(0, ringRadii[ringIndex] + radialJitter);

      xNorm = centerX + Math.cos(angle) * radius + xJitter;
      yNorm = centerY + Math.sin(angle) * radius * 0.82 + yJitter;
    }

    xNorm = Math.min(clampMaxX, Math.max(clampMinX, xNorm));
    yNorm = Math.min(clampMaxY, Math.max(clampMinY, yNorm));

    let nearest = Infinity;
    for (const item of existingItems) {
      const ex = parseFloat(item.style.left) / 100;
      const ey = parseFloat(item.style.top) / 100;
      const dx = xNorm - ex;
      const dy = yNorm - ey;
      const d = Math.sqrt(dx * dx + dy * dy);
      nearest = Math.min(nearest, d);
    }

    if (!existingItems.length) {
      best = { xNorm, yNorm, score: 999 };
      break;
    }

    if (nearest >= minDistance) {
      best = { xNorm, yNorm, score: nearest };
      break;
    }

    if (!best || nearest > best.score) {
      best = { xNorm, yNorm, score: nearest };
    }
  }

  const rotationBase = [0, -6, 7, -4, 5, -7, 4, -5, 6, -3];
  const rotation = placementIndex === 0 ? 0 : rotationBase[placementIndex % rotationBase.length];

  return {
    xPx: best.xNorm * bowlRect.width,
    yPx: best.yNorm * bowlRect.height,
    xPercent: best.xNorm * 100,
    yPercent: best.yNorm * 100,
    rotation,
    zIndex: 4 + placementIndex
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


function addCartSelection(product, size, quantity) {
  if (!product || !product.id || !size || quantity < 1) return;

  const existing = state.cartItems.find((item) => item.productId === product.id && item.size === size);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cartItems.push({
      productId: product.id,
      flavor: product.flavor,
      size,
      quantity
    });
  }
}

function clearCartSelections() {
  state.cartItems = [];
}


const PRICE_MAP = {
  pumpkin: { Regular: "price_1TD3rlDywMn3O3R8psJph7ti", Double: "price_1TD3rlDywMn3O3R8fHQICEqm" },
  pbmc: { Regular: "price_1TD3rlDywMn3O3R8Kw2mxifP", Double: "price_1TD3rkDywMn3O3R8LhNyxt0V" },
  ginger: { Regular: "price_1TD3rlDywMn3O3R8CDw2xmaI", Double: "price_1TD3rkDywMn3O3R8PquAjDEM" }
};

async function beginCheckout() {
  if (!state.cartItems || !state.cartItems.length) {
    if (cartStatus) {
      cartStatus.textContent = "Add a few Woofles first.";
      window.setTimeout(() => {
        if (cartStatus) cartStatus.textContent = "";
      }, 1400);
    }
    return;
  }

  if (checkoutButton) {
    checkoutButton.disabled = true;
    checkoutButton.textContent = "Opening Checkout...";
  }
  if (cartStatus) cartStatus.textContent = "Preparing secure checkout...";

  try {
    const items = state.cartItems.map((item) => {
      const priceId = PRICE_MAP[item.productId]?.[item.size];
      if (!priceId) {
        throw new Error(`Missing Stripe price for ${item.productId} ${item.size}`);
      }
      return {
        priceId,
        quantity: item.quantity
      };
    });

    const response = await fetch("/api/create-dogbowl-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.url) {
      throw new Error(data?.error || "Checkout failed.");
    }

    window.location.href = data.url;
  } catch (error) {
    if (cartStatus) {
      cartStatus.textContent = error?.message || "Checkout failed.";
      window.setTimeout(() => {
        if (cartStatus) cartStatus.textContent = "";
      }, 2200);
    }
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Checkout";
    }
  }
}


function updateBowlUi() {
  const count = state.bowlCount;
  if (cartCountEl) cartCountEl.textContent = String(count);

  if (bowlImageEl) {
    bowlImageEl.src = BOWL_NEUTRAL.image;
  }

  if (bowlNoteEl) {
    bowlNoteEl.textContent = count > 0
      ? `${count} woofel${count === 1 ? "" : "s"} in your DogBowl™.`
      : BOWL_NEUTRAL.note;
  }
}

function launchWoofleFromCTA(sourceEl, imageSrc, count) {
  if (!bowlFrameEl || count < 1) return;

  const cardImageEl = state.activeSourceCard?.querySelector(".woofle");
  const launchSourceEl = cardImageEl || sourceEl;
  if (!launchSourceEl) return;

  const sourceRect = launchSourceEl.getBoundingClientRect();
  const sharedStartLeft = sourceRect.left + sourceRect.width / 2;
  const sharedStartTop = sourceRect.top + sourceRect.height / 2 + 18;
  const originalWidth = sourceRect.width;

  if (sourceEl && sourceEl.style) {
    sourceEl.style.opacity = "1";
  }

  for (let flightIndex = 0; flightIndex < count; flightIndex += 1) {
    window.setTimeout(() => {
      const target = createBowlTarget(flightIndex);
      if (!target) return;

      const bowlRect = bowlFrameEl.getBoundingClientRect();
      const endLeft = bowlRect.left + target.xPx;
      const endTop = bowlRect.top + target.yPx;

      const handoffWoofle = launchSourceEl.cloneNode(true);
      handoffWoofle.classList.add("is-handoff");
      handoffWoofle.style.position = "fixed";
      handoffWoofle.style.left = `${sharedStartLeft}px`;
      handoffWoofle.style.top = `${sharedStartTop}px`;
      handoffWoofle.style.width = `${originalWidth}px`;
      handoffWoofle.style.height = "auto";
      handoffWoofle.style.maxWidth = "none";
      handoffWoofle.style.margin = "0";
      handoffWoofle.style.transform = "translate(-50%, -50%) scale(1)";
      handoffWoofle.style.opacity = "1";
      handoffWoofle.style.pointerEvents = "none";
      handoffWoofle.style.zIndex = "0";
      document.body.appendChild(handoffWoofle);

      if (flightIndex === count - 1) {
        state.activeHandoffWoofle = handoffWoofle;
      }

      // Start underneath the card woofle, then emerge without changing size yet.
      requestAnimationFrame(() => {
        handoffWoofle.style.transition = "top 260ms ease";
        handoffWoofle.style.top = `${sharedStartTop + 20}px`;
      });

      // Rise above the card and hold true card size.
      window.setTimeout(() => {
        handoffWoofle.style.zIndex = "95";
        handoffWoofle.style.transition = "top 260ms ease";
        handoffWoofle.style.top = `${sharedStartTop + 8}px`;
      }, 120);

      // Card-size start -> controlled scale-down during flight.
      window.setTimeout(() => {
        handoffWoofle.style.transition = "left 1000ms cubic-bezier(0.22, 1, 0.36, 1), top 1000ms cubic-bezier(0.22, 1, 0.36, 1), width 1000ms ease";
        handoffWoofle.style.left = `${endLeft}px`;
        handoffWoofle.style.top = `${endTop}px`;
        handoffWoofle.style.width = "72px";
      }, 420);

      window.setTimeout(() => {
        addWoofleToBowl(imageSrc, target);
        state.bowlCount += 1;
        updateBowlUi();

        handoffWoofle.remove();
        if (state.activeHandoffWoofle === handoffWoofle) {
          state.activeHandoffWoofle = null;
        }

        if (flightIndex === count - 1 && sourceEl && sourceEl.style) {
          sourceEl.style.opacity = "0";
        }
      }, 1420);
    }, flightIndex * WOOFLE_MULTI_STAGGER_MS);
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
  const priceEl = modal.querySelector(".modal-price");

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
      if (priceEl) {
        priceEl.textContent = product.displayPrices?.[selectedSize] || "$18 — delivered";
      }
    });
  });

  ctaButton?.addEventListener("click", () => {
    const totalWoofles = (SIZE_COUNTS[selectedSize] || 1) * quantity;
    addCartSelection(product, selectedSize, quantity);
    launchWoofleFromCTA(modalImage || ctaButton, product.image, totalWoofles);
    closeModal({ preserveHandoffWoofle: true });
  });

  overlay.addEventListener("click", closeModal);
}

function closeModal(options = {}) {
  if (!state.activeModal || !state.activeOverlay) return;
  const modal = state.activeModal;
  const overlay = state.activeOverlay;
  const preserveHandoffWoofle = Boolean(options.preserveHandoffWoofle);
  state.activeModal = null;
  state.activeOverlay = null;
  state.isOpening = false;
  overlay.classList.remove("active");
  modal.classList.remove("active");

  if (preserveHandoffWoofle) {
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
  }

  window.setTimeout(() => {
    if (!preserveHandoffWoofle && state.activeHandoffWoofle) {
      state.activeHandoffWoofle.remove();
      state.activeHandoffWoofle = null;
    }
    modal.remove();
    overlay.remove();
    document.body.classList.remove("product-detail-open");
    document.body.style.removeProperty("--header-offset");
    state.activeSourceCard = null;
  }, MODAL_CLOSE_DURATION_MS);
}

clearCartButton?.addEventListener("click", () => {
  const layer = ensureBowlItemsLayer();
  if (layer) layer.innerHTML = "";
  state.bowlCount = 0;
  if (state.activeHandoffWoofle) {
    state.activeHandoffWoofle.remove();
    state.activeHandoffWoofle = null;
  }
  state.activeSourceCard = null;
  clearCartSelections();
  updateBowlUi();
  if (cartStatus) cartStatus.textContent = "DogBowl™ cleared.";
  window.setTimeout(() => {
    if (cartStatus) cartStatus.textContent = "";
  }, 1400);
});

checkoutButton?.addEventListener("click", beginCheckout);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

renderProducts();
updateBowlUi();
