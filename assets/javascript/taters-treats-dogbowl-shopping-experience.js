const products = [
  {
    id: "pb-mint",
    name: "Peanut Butter Mint Carob",
    desc: "Freshens breath"
  },
  {
    id: "pb-ginger",
    name: "Peanut Butter Ginger",
    desc: "Warm & nutty"
  },
  {
    id: "pumpkin",
    name: "Pumpkin Turmeric",
    desc: "Cozy & nourishing"
  }
];

const cart = [];

const productsContainer = document.getElementById("products");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");

function renderProducts() {
  productsContainer.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="card-top">
        <img src="assets/images/${product.id}.png" />
        <div>
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
        </div>
      </div>

      <div class="card-controls">
        <div class="sizes">
          <button data-size="S">S</button>
          <button data-size="M" class="active">M</button>
          <button data-size="L">L</button>
        </div>

        <div class="qty">
          <button class="minus">-</button>
          <span class="qty-val">1</span>
          <button class="plus">+</button>
        </div>

        <button class="add">Add</button>
      </div>
    `;

    let selectedSize = "M";
    let quantity = 1;

    const sizeButtons = card.querySelectorAll(".sizes button");
    sizeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSize = btn.dataset.size;
      });
    });

    const qtyVal = card.querySelector(".qty-val");

    card.querySelector(".minus").addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        qtyVal.textContent = quantity;
      }
    });

    card.querySelector(".plus").addEventListener("click", () => {
      quantity++;
      qtyVal.textContent = quantity;
    });

    card.querySelector(".add").addEventListener("click", () => {
      addToCart(product, selectedSize, quantity);
    });

    productsContainer.appendChild(card);
  });
}

function addToCart(product, size, qty) {
  cart.push({
    id: product.id,
    name: product.name,
    size,
    qty
  });

  renderCart();
}

function renderCart() {
  cartList.innerHTML = "";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.name} (${item.size})</span>
      <span>x${item.qty}</span>
    `;

    cartList.appendChild(div);
  });

  cartCount.textContent = cart.length;
}

renderProducts();
