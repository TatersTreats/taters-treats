const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin Turmeric",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Peanut Butter Mint Carob",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter Ginger",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.product = product.id;

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.flavor}" />
    </div>

    <div class="product-body">
      <div class="product-title">
        <span class="product-flavor">${product.flavor}</span>
      </div>
    </div>
  `;

  return card;
}

function renderProducts() {
  const productsEl = document.getElementById("products");
  if (!productsEl) return;

  productsEl.innerHTML = "";

  PRODUCTS.forEach((product) => {
    productsEl.appendChild(renderProductCard(product));
  });

  attachProductCardHandlers();
}

function attachProductCardHandlers() {
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      openProductDetail(card);
    });
  });
}

function openProductDetail(card) {
  if (!card) return;
  if (document.body.classList.contains("product-detail-open")) return;

  document.body.classList.add("product-detail-open");
  card.classList.add("active");

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", closeProductDetail);
}

function closeProductDetail() {
  document.body.classList.remove("product-detail-open");

  document.querySelectorAll(".product-card.active").forEach((card) => {
    card.classList.remove("active");
  });

  document.querySelectorAll(".product-overlay").forEach((el) => {
    el.remove();
  });
}

renderProducts();
