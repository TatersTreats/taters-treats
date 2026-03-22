const PRODUCTS = [
  {
    id: "pbmc",
    line: "WOOFLES™",
    flavor: "Peanut Butter Mint Carob",
    benefit: "Helps freshen breath",
    image: "/assets/images/products/pbmc.jpg",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rlDywMn3O3R84BZEFkVl" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8Kw2mxifP" },
      value:   { label: "Large",  priceId: "price_1TD3rkDywMn3O3R8LhNyxt0V" }
    }
  },
  {
    id: "pumpkin",
    line: "WOOFLES™",
    flavor: "Pumpkin Turmeric",
    benefit: "Supports gentle digestion",
    image: "/assets/images/products/pumpkin.jpg",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rlDywMn3O3R8C2mIqpVZ" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8psJph7ti" },
      value:   { label: "Large",  priceId: "price_1TD3rlDywMn3O3R8fHQICEqm" }
    }
  },
  {
    id: "ginger",
    line: "WOOFLES™",
    flavor: "Peanut Butter Ginger",
    benefit: "Helps soothe the tummy",
    image: "/assets/images/products/ginger.jpg",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rmDywMn3O3R81CgJYyr4" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8CDw2xmaI" },
      value:   { label: "Large",  priceId: "price_1TD3rkDywMn3O3R8PquAjDEM" }
    }
  }
];

const STORAGE_KEY = "taters_dogbowl_v3";

const productsEl = document.getElementById("products");
const cartListEl = document.getElementById("cartList");
const cartCountEl = document.getElementById("cartCount");
const cartStatusEl = document.getElementById("cartStatus");
const bowlImageEl = document.getElementById("bowlImage");
const bowlNoteEl = document.getElementById("bowlNote");
const checkoutButton = document.getElementById("checkoutButton");
const clearCartButton = document.getElementById("clearCartButton");

let bowl = loadBowl();

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
  if (statusEl) statusEl.textContent = message;
}

function bowlKey(productId, sizeKey) {
  return `${productId}__${sizeKey}`;
}

function getBowlVisualState(totalItems) {
  if (totalItems <= 0) {
    return {
      src: "/assets/images/dogbowl/empty-bowl.png",
      alt: "An empty DogBowl™",
      note: "Your DogBowl™ is waiting."
    };
  }

  if (totalItems <= 2) {
    return {
      src: "/assets/images/dogbowl/bowl-1.png",
      alt: "A DogBowl™ with a few WOOFLES™ inside",
      note: "A good start."
    };
  }

  if (totalItems <= 4) {
    return {
      src: "/assets/images/dogbowl/bowl-2.png",
      alt: "A DogBowl™ with more WOOFLES™ inside",
      note: "Coming together nicely."
    };
  }

  if (totalItems <= 6) {
    return {
      src: "/assets/images/dogbowl/bowl-3.png",
      alt: "A generously filled DogBowl™",
      note: "Now we're talking."
    };
  }

  return {
    src: "/assets/images/dogbowl/bowl-full.png",
    alt: "A full DogBowl™ of WOOFLES™",
    note: "That's a full DogBowl™."
  };
}

function renderBowlVisual(totalItems) {
  const state = getBowlVisualState(totalItems);
  bowlImageEl.src = state.src;
  bowlImageEl.alt = state.alt;
  bowlNoteEl.textContent = state.note;
}

function pulseBowl() {
  bowlImageEl.classList.remove("bowl-pulse");
  void bowlImageEl.offsetWidth;
  bowlImageEl.classList.add("bowl-pulse");
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
  if (!bowl.length) {
    cartListEl.innerHTML = `<div class="empty-state">Your DogBowl™ is empty.</div>`;
    cartCountEl.textContent = "0";
    renderBowlVisual(0);
    return;
  }

  const totalItems = bowl.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = String(totalItems);
  renderBowlVisual(totalItems);

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
}

async function checkout() {
  if (!bowl.length) {
    cartStatusEl.textContent = "Fill your DogBowl™ first.";
    return;
  }

  cartStatusEl.textContent = "Redirecting to secure checkout...";

  try {
    const response = await fetch("/api/create-checkout", {
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

checkoutButton.addEventListener("click", checkout);
clearCartButton.addEventListener("click", clearBowl);

renderProducts();
renderBowl();