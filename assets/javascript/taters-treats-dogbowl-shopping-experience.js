const PRODUCTS = [
  {
    id: "pbmc",
    line: "WOOFLES™",
    flavor: "Peanut Butter Mint Carob",
    benefit: "Helps freshen breath",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Small", priceId: "price_1TD3rlDywMn3O3R84BZEFkVl" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8Kw2mxifP" },
      value: { label: "Large", priceId: "price_1TD3rkDywMn3O3R8LhNyxt0V" }
    }
  },
  {
    id: "pumpkin",
    line: "WOOFLES™",
    flavor: "Pumpkin Turmeric",
    benefit: "Supports gentle digestion",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Small", priceId: "price_1TD3rlDywMn3O3R8C2mIqpVZ" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8psJph7ti" },
      value: { label: "Large", priceId: "price_1TD3rlDywMn3O3R8fHQICEqm" }
    }
  },
  {
    id: "ginger",
    line: "WOOFLES™",
    flavor: "Peanut Butter Ginger",
    benefit: "Helps soothe the tummy",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Small", priceId: "price_1TD3rmDywMn3O3R81CgJYyr4" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8CDw2xmaI" },
      value: { label: "Large", priceId: "price_1TD3rkDywMn3O3R8PquAjDEM" }
    }
  }
];

const STORAGE_KEY = "taters_dogbowl_v5";

const DOGBOWL_BACKGROUND_IMAGE =
  "/assets/images/dogbowl/dogbowl-hardwood-floor-with-oat-flour-dusting.png";

const DOGBOWL_BOWL_IMAGE =
  "/assets/images/dogbowl/dogbowl-ceramic-bowl-top-down.png";

const SIZE_TO_WOOFLE_COUNT = {
  trial: 1,
  regular: 2,
  value: 3
};

const productsEl = document.getElementById("products");
const cartListEl = document.getElementById("cartList");
const cartCountEl = document.getElementById("cartCount");
const cartStatusEl = document.getElementById("cartStatus");
const bowlNoteEl = document.getElementById("bowlNote");
const checkoutButton = document.getElementById("checkoutButton");
const clearCartButton = document.getElementById("clearCartButton");
const bowlFrameEl = document.querySelector(".bowl-frame");

let bowl = loadBowl();
let dogbowlStageEl = null;
let dogbowlTreatLayerEl = null;
let dogbowlBowlEl = null;

function loadBowl() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveBowl() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bowl));
}

function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function getSelectedSizeKey(productId) {
  const active = document.querySelector(`.pill-btn[data-product="${productId}"].active`);
  return active ? active.dataset.size : null;
}

function getSelectedQuantity(productId) {
  const valueEl = document.getElementById(`qty-${productId}`);
  return Number(valueEl ? valueEl.textContent : "1") || 1;
}

function setProductStatus(productId, message) {
  const statusEl = document.getElementById(`status-${productId}`);
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function bowlKey(productId, sizeKey) {
  return `${productId}__${sizeKey}`;
}

function injectDogBowlStyles() {
  if (document.getElementById("dogbowl-layered-styles")) return;

  const style = document.createElement("style");
  style.id = "dogbowl-layered-styles";
  style.textContent = `
    .dogbowl-stage {
      position: relative;
      width: min(100%, 500px);
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      overflow: hidden;
      border-radius: 18px;
    }

    .dogbowl-stage__background,
    .dogbowl-stage__bowl {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
      user-select: none;
    }

    .dogbowl-stage__background {
      object-fit: cover;
      z-index: 1;
    }

    .dogbowl-stage__bowl {
      object-fit: contain;
      z-index: 2;
    }

    .dogbowl-stage__treat-layer {
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
    }

    .dogbowl-stage__treat {
      position: absolute;
      width: clamp(34px, 8vw, 58px);
      height: auto;
      transform: translate(-50%, -50%);
      transform-origin: center center;
      filter: drop-shadow(0 2px 3px rgba(45, 32, 20, 0.10));
      user-select: none;
      pointer-events: none;
    }

    .dogbowl-stage__bowl.is-pulsing,
    .dogbowl-stage__treat-layer.is-pulsing {
      animation: dogbowlPulse 0.38s ease;
    }

    @keyframes dogbowlPulse {
      0% { transform: scale(1); }
      40% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    @media (max-width: 640px) {
      .dogbowl-stage {
        width: min(100%, 440px);
      }

      .dogbowl-stage__treat {
        width: clamp(30px, 9vw, 48px);
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureDogBowlStage() {
  if (!bowlFrameEl) return;

  injectDogBowlStyles();

  bowlFrameEl.innerHTML = `
    <div class="dogbowl-stage" id="dogbowlStage" aria-hidden="true">
      <img
        class="dogbowl-stage__background"
        src="${DOGBOWL_BACKGROUND_IMAGE}"
        alt=""
      />
      <img
        class="dogbowl-stage__bowl"
        id="dogbowlBowlLayer"
        src="${DOGBOWL_BOWL_IMAGE}"
        alt=""
      />
      <div
        class="dogbowl-stage__treat-layer"
        id="dogbowlTreatLayer"
      ></div>
    </div>
  `;

  dogbowlStageEl = document.getElementById("dogbowlStage");
  dogbowlTreatLayerEl = document.getElementById("dogbowlTreatLayer");
  dogbowlBowlEl = document.getElementById("dogbowlBowlLayer");
}

function getDogBowlNote(woofleCount) {
  if (woofleCount <= 0) {
    return "Your DogBowl™ is waiting.";
  }

  if (woofleCount === 1) {
    return "1 WOOFLE™ in your DogBowl™.";
  }

  return `${woofleCount} WOOFLES™ in your DogBowl™.`;
}

function getRenderedWoofles() {
  const renderedWoofles = [];

  bowl.forEach((item) => {
    const product = getProduct(item.productId);
    if (!product) return;

    const countPerSelection = SIZE_TO_WOOFLE_COUNT[item.sizeKey] || 1;
    const totalVisualCount = item.quantity * countPerSelection;

    for (let i = 0; i < totalVisualCount; i += 1) {
      renderedWoofles.push({
        productId: product.id,
        flavor: product.flavor,
        image: product.image
      });
    }
  });

  return renderedWoofles;
}

function getWoofleSlots() {
  return [
    { x: 50, y: 63, r: 0, s: 1.0 },
    { x: 42, y: 62, r: -12, s: 0.98 },
    { x: 58, y: 62, r: 12, s: 0.98 },

    { x: 35, y: 58, r: -18, s: 0.96 },
    { x: 65, y: 58, r: 18, s: 0.96 },

    { x: 50, y: 56, r: 6, s: 0.96 },
    { x: 43, y: 54, r: -10, s: 0.95 },
    { x: 57, y: 54, r: 10, s: 0.95 },

    { x: 36, y: 50, r: -18, s: 0.94 },
    { x: 64, y: 50, r: 18, s: 0.94 },

    { x: 50, y: 48, r: 0, s: 0.94 },
    { x: 42, y: 46, r: -12, s: 0.93 },
    { x: 58, y: 46, r: 12, s: 0.93 },

    { x: 38, y: 42, r: -16, s: 0.92 },
    { x: 62, y: 42, r: 16, s: 0.92 },

    { x: 50, y: 40, r: 4, s: 0.91 },
    { x: 44, y: 37, r: -10, s: 0.9 },
    { x: 56, y: 37, r: 10, s: 0.9 },

    { x: 40, y: 67, r: -10, s: 0.96 },
    { x: 60, y: 67, r: 10, s: 0.96 },

    { x: 33, y: 64, r: -20, s: 0.95 },
    { x: 67, y: 64, r: 20, s: 0.95 },

    { x: 34, y: 54, r: -18, s: 0.93 },
    { x: 66, y: 54, r: 18, s: 0.93 },

    { x: 39, y: 34, r: -12, s: 0.88 },
    { x: 61, y: 34, r: 12, s: 0.88 },

    { x: 50, y: 31, r: 0, s: 0.88 }
  ];
}

function getOverflowSlot(index, slots) {
  const ringIndex = index - slots.length;
  const angle = (ringIndex * 37) * (Math.PI / 180);
  const radiusX = 12 + (ringIndex % 4) * 2.4;
  const radiusY = 8 + (ringIndex % 4) * 1.8;

  return {
    x: 50 + Math.cos(angle) * radiusX,
    y: 50 + Math.sin(angle) * radiusY,
    r: ((ringIndex * 19) % 28) - 14,
    s: 0.84 + ((ringIndex % 3) * 0.03)
  };
}

function renderDogBowlLayered() {
  if (!dogbowlTreatLayerEl) return;

  const renderedWoofles = getRenderedWoofles();
  const slots = getWoofleSlots();

  dogbowlTreatLayerEl.innerHTML = "";

  renderedWoofles.forEach((woofle, index) => {
    const slot = slots[index] || getOverflowSlot(index, slots);

    const treat = document.createElement("img");
    treat.className = "dogbowl-stage__treat";
    treat.src = woofle.image;
    treat.alt = woofle.flavor;
    treat.style.left = `${slot.x}%`;
    treat.style.top = `${slot.y}%`;
    treat.style.zIndex = String(100 + index + Math.round(slot.y));
    treat.style.transform =
      `translate(-50%, -50%) rotate(${slot.r}deg) scale(${slot.s})`;

    dogbowlTreatLayerEl.appendChild(treat);
  });

  bowlNoteEl.textContent = getDogBowlNote(renderedWoofles.length);
}

function pulseBowl() {
  if (!dogbowlBowlEl || !dogbowlTreatLayerEl) return;

  dogbowlBowlEl.classList.remove("is-pulsing");
  dogbowlTreatLayerEl.classList.remove("is-pulsing");
  void dogbowlBowlEl.offsetWidth;
  dogbowlBowlEl.classList.add("is-pulsing");
  dogbowlTreatLayerEl.classList.add("is-pulsing");
}

function addToBowl(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const sizeKey = getSelectedSizeKey(productId);
  const quantity = getSelectedQuantity(productId);

  if (!sizeKey || !product.sizes[sizeKey]) {
    setProductStatus(productId, "Please choose a size first.");
    return;
  }

  const key = bowlKey(productId, sizeKey);
  const existing = bowl.find((item) => item.key === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    bowl.push({
      key,
      productId,
      sizeKey,
      quantity,
      priceId: product.sizes[sizeKey].priceId,
      name: `${product.line} — ${product.flavor}`,
      sizeLabel: product.sizes[sizeKey].label
    });
  }

  saveBowl();
  renderBowl();
  pulseBowl();

  const button = document.querySelector(`.add-button[data-add="${productId}"]`);
  if (button) {
    const originalText = button.textContent;
    button.textContent = "Added ✓";
    button.style.background = "#2f4a35";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = "";
    }, 1200);
  }

  setProductStatus(productId, "Added to your DogBowl™.");
  cartStatusEl.textContent = "Your DogBowl™ has been updated.";

  if (window.innerWidth < 768) {
    document.getElementById("dogbowl")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function removeFromBowl(itemKey) {
  bowl = bowl.filter((item) => item.key !== itemKey);
  saveBowl();
  renderBowl();
}

function changeBowlQuantity(itemKey, delta) {
  const item = bowl.find((entry) => entry.key === itemKey);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromBowl(itemKey);
    return;
  }

  saveBowl();
  renderBowl();
}

function clearBowl() {
  bowl = [];
  saveBowl();
  renderBowl();
  cartStatusEl.textContent = "DogBowl™ cleared.";
}

function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const sizeButtons = Object.entries(product.sizes).map(([key, size]) => `
    <button
      type="button"
      class="pill-btn ${key === product.defaultSize ? "active" : ""}"
      data-product="${product.id}"
      data-size="${key}"
    >
      ${size.label}
    </button>
  `).join("");

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.line} ${product.flavor}" />
    </div>

    <div class="product-body">
      <span class="mini-badge">Small Batch</span>

      <div class="product-title">
        <span class="product-line">${product.line}</span>
        <span class="product-flavor">${product.flavor}</span>
      </div>

      <p class="product-benefit">${product.benefit}</p>

      <div>
        <div class="control-label">Select Size</div>
        <div class="size-options">${sizeButtons}</div>
      </div>

      <div class="quantity-row">
        <div>
          <div class="control-label">Quantity</div>
          <div class="quantity-controls">
            <button
              type="button"
              class="qty-button"
              data-qty-action="decrease"
              data-product="${product.id}"
            >
              −
            </button>
            <span class="qty-value" id="qty-${product.id}">1</span>
            <button
              type="button"
              class="qty-button"
              data-qty-action="increase"
              data-product="${product.id}"
            >
              +
            </button>
          </div>
        </div>

        <div class="selected-copy" id="selected-${product.id}">
          Selected: ${product.sizes[product.defaultSize].label}
        </div>
      </div>

      <button type="button" class="add-button" data-add="${product.id}">
        Add to DogBowl™
      </button>

      <div class="status-message" id="status-${product.id}"></div>
    </div>
  `;

  return card;
}

function renderProducts() {
  productsEl.innerHTML = "";
  PRODUCTS.forEach((product) => {
    productsEl.appendChild(renderProductCard(product));
  });
}

function renderBowl() {
  const totalSelections = bowl.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = String(totalSelections);

  if (!bowl.length) {
    cartListEl.innerHTML = `<div class="empty-state">Your DogBowl™ is empty.</div>`;
    renderDogBowlLayered();
    return;
  }

  cartListEl.innerHTML = bowl.map((item) => `
    <div class="cart-item">
      <div class="cart-item-top">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.sizeLabel} · Qty ${item.quantity}</div>
        </div>
        <button type="button" class="link-button" data-remove="${item.key}">Remove</button>
      </div>

      <div class="cart-item-bottom">
        <div class="quantity-controls">
          <button
            type="button"
            class="qty-button"
            data-cart-action="decrease"
            data-key="${item.key}"
          >
            −
          </button>
          <span class="qty-value">${item.quantity}</span>
          <button
            type="button"
            class="qty-button"
            data-cart-action="increase"
            data-key="${item.key}"
          >
            +
          </button>
        </div>
      </div>
    </div>
  `).join("");

  renderDogBowlLayered();
}

async function checkout() {
  if (!bowl.length) {
    cartStatusEl.textContent = "Fill your DogBowl™ first.";
    return;
  }

  cartStatusEl.textContent = "Redirecting to secure checkout...";

  try {
    const response = await fetch("/api/create-dogbowl-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: bowl.map((item) => ({
          priceId: item.priceId,
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Checkout failed.");
    }

    if (!data.url) {
      throw new Error("Missing checkout URL.");
    }

    window.location.href = data.url;
  } catch (error) {
    cartStatusEl.textContent = error.message || "Checkout failed.";
  }
}

document.addEventListener("click", (event) => {
  const sizeButton = event.target.closest(".pill-btn");
  if (sizeButton) {
    const { product: productId, size } = sizeButton.dataset;
    const product = getProduct(productId);
    if (!product) return;

    document
      .querySelectorAll(`.pill-btn[data-product="${productId}"]`)
      .forEach((btn) => btn.classList.remove("active"));

    sizeButton.classList.add("active");

    const selectedEl = document.getElementById(`selected-${productId}`);
    if (selectedEl) {
      selectedEl.textContent = `Selected: ${product.sizes[size].label}`;
    }

    setProductStatus(productId, "");
    return;
  }

  const qtyButton = event.target.closest(".qty-button[data-qty-action]");
  if (qtyButton) {
    const productId = qtyButton.dataset.product;
    const valueEl = document.getElementById(`qty-${productId}`);
    let current = Number(valueEl.textContent) || 1;

    current += qtyButton.dataset.qtyAction === "increase" ? 1 : -1;
    if (current < 1) current = 1;

    valueEl.textContent = String(current);
    return;
  }

  const addButton = event.target.closest(".add-button");
  if (addButton) {
    addToBowl(addButton.dataset.add);
    return;
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    removeFromBowl(removeButton.dataset.remove);
    return;
  }

  const cartQtyButton = event.target.closest(".qty-button[data-cart-action]");
  if (cartQtyButton) {
    changeBowlQuantity(
      cartQtyButton.dataset.key,
      cartQtyButton.dataset.cartAction === "increase" ? 1 : -1
    );
  }
});

ensureDogBowlStage();
checkoutButton.addEventListener("click", checkout);
clearCartButton.addEventListener("click", clearBowl);

renderProducts();
renderBowl();
