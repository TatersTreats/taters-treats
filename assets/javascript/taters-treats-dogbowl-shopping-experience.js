const products = [
  {
    id: "pb-mint-carob",
    image: "assets/images/products/peanut-butter-mint-carob-woofle.png",
    name: "Peanut Butter Mint Carob",
    desc: "Freshens breath"
  },
  {
    id: "pb-ginger",
    image: "assets/images/products/peanut-butter-ginger-woofle.png",
    name: "Peanut Butter Ginger",
    desc: "Warm and nutty"
  },
  {
    id: "pumpkin-turmeric",
    image: "assets/images/products/pumpkin-turmeric-woofle.png",
    name: "Pumpkin Turmeric",
    desc: "Cozy and nourishing"
  }
];

const bowlStates = {
  empty: "assets/images/dogbowl/dogbowl-empty-state.png",
  light: "assets/images/dogbowl/dogbowl-lightly-filled-state.png",
  medium: "assets/images/dogbowl/dogbowl-medium-filled-state.png",
  generous: "assets/images/dogbowl/dogbowl-generously-filled-state.png",
  full: "assets/images/dogbowl/dogbowl-full-state.png"
};

const cart = [];

const productsContainer = document.getElementById("products");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const bowlImage = document.getElementById("bowlImage");
const checkoutButton = document.getElementById("checkoutButton");
const cartStatus = document.getElementById("cartStatus");

function safeSetStatus(message) {
  if (cartStatus) {
    cartStatus.textContent = message || "";
  }
}

function getTotalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateBowlImage() {
  if (!bowlImage) return;

  const total = getTotalItems();
  let nextState = bowlStates.empty;

  if (total >= 9) {
    nextState = bowlStates.full;
  } else if (total >= 6) {
    nextState = bowlStates.generous;
  } else if (total >= 4) {
    nextState = bowlStates.medium;
  } else if (total >= 1) {
    nextState = bowlStates.light;
  }

  bowlImage.src = nextState;
}

function renderProducts() {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="card-top">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
        </div>
      </div>

      <div class="card-controls">
        <div class="control-row">
          <div class="sizes">
            <button data-size="S" type="button">S</button>
            <button data-size="M" class="active" type="button">M</button>
            <button data-size="L" type="button">L</button>
          </div>

          <div class="qty">
            <button class="minus" type="button" aria-label="Decrease quantity">-</button>
            <span class="qty-val">1</span>
            <button class="plus" type="button" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <button class="add" type="button">Add to bowl</button>
      </div>
    `;

    let selectedSize = "M";
    let quantity = 1;

    const sizeButtons = card.querySelectorAll(".sizes button");
    const qtyVal = card.querySelector(".qty-val");

    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSize = btn.dataset.size;
      });
    });

    card.querySelector(".minus").addEventListener("click", () => {
      if (quantity > 1) {
        quantity -= 1;
        qtyVal.textContent = String(quantity);
      }
    });

    card.querySelector(".plus").addEventListener("click", () => {
      quantity += 1;
      qtyVal.textContent = String(quantity);
    });

    card.querySelector(".add").addEventListener("click", () => {
      addToCart(product, selectedSize, quantity);
      safeSetStatus(`${product.name} added to your bowl.`);
    });

    productsContainer.appendChild(card);
  });
}

function addToCart(product, size, qty) {
  const existing = cart.find((item) => item.id === product.id && item.size === size);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      size,
      qty
    });
  }

  renderCart();
}

function renderCart() {
  if (!cartList || !cartCount) return;

  cartList.innerHTML = "";

  if (!cart.length) {
    cartList.innerHTML = '<p class="empty-cart">Your bowl is empty.</p>';
  } else {
    cart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div>
          <div>${item.name}</div>
          <div class="cart-item-meta">Size ${item.size}</div>
        </div>
        <strong>x${item.qty}</strong>
      `;
      cartList.appendChild(div);
    });
  }

  const total = getTotalItems();
  cartCount.textContent = String(total);
  if (checkoutButton) {
    checkoutButton.disabled = total === 0;
  }
  updateBowlImage();
}

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (!cart.length) {
      safeSetStatus("Add something to your bowl first.");
      return;
    }
    safeSetStatus("Checkout is not configured in this reset yet, but your bowl is working.");
  });
}

renderProducts();
renderCart();
