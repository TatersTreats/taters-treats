const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin Turmeric",
    description: "A cozy pumpkin-forward bake with turmeric, crafted to support gentle digestion.",
    image: "/assets/images/products/pumpkin.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Trial" },
      regular: { label: "Regular" },
      value: { label: "Value" }
    }
  },
  {
    id: "pbmc",
    flavor: "Peanut Butter Mint Carob",
    description: "A fresh-baked blend of peanut butter, mint, and carob made to help freshen breath.",
    image: "/assets/images/products/pbmc.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Trial" },
      regular: { label: "Regular" },
      value: { label: "Value" }
    }
  },
  {
    id: "ginger",
    flavor: "Peanut Butter Ginger",
    description: "A warm peanut butter bake with ginger, thoughtfully made to help soothe the tummy.",
    image: "/assets/images/products/ginger.png",
    defaultSize: "regular",
    sizes: {
      trial: { label: "Trial" },
      regular: { label: "Regular" },
      value: { label: "Value" }
    }
  }
];

const productsEl = document.getElementById("products");

/* --- RENDER --- */

function renderProductCard(product) {
  const sizeButtons = Object.entries(product.sizes).map(([key, size]) => `
    <button class="pill-btn ${key === product.defaultSize ? "active" : ""}" data-size="${key}">
      ${size.label}
    </button>
  `).join("");

  return `
    <article class="product-card" data-product="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.flavor}" />
      </div>

      <div class="product-body">
        <span class="product-flavor">${product.flavor}</span>

        <p class="product-description">${product.description}</p>

        <div class="card-controls">
          <div class="size-options">${sizeButtons}</div>

          <div class="quantity">
            <button class="qty-button" data-action="minus">−</button>
            <span class="qty-value">1</span>
            <button class="qty-button" data-action="plus">+</button>
          </div>

          <button class="add-button">Fill the DogBowl™</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  productsEl.innerHTML = PRODUCTS.map(renderProductCard).join("");
  attachHandlers();
}

/* --- INTERACTION --- */

function attachHandlers() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".pill-btn, .qty-button, .add-button")) return;

      openCard(card);
    });

    const qtyValue = card.querySelector(".qty-value");

    card.querySelectorAll(".qty-button").forEach(btn => {
      btn.addEventListener("click", () => {
        let value = parseInt(qtyValue.textContent);

        if (btn.dataset.action === "plus") value++;
        if (btn.dataset.action === "minus") value--;

        if (value < 1) value = 1;

        qtyValue.textContent = value;
      });
    });

    card.querySelectorAll(".pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    card.querySelector(".add-button").addEventListener("click", () => {
      closeCard();
    });
  });
}

function openCard(card) {
  document.body.classList.add("product-detail-open");
  card.classList.add("active");

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", closeCard);
}

function closeCard() {
  document.body.classList.remove("product-detail-open");

  document.querySelectorAll(".product-card.active").forEach(card => {
    card.classList.remove("active");
  });

  document.querySelectorAll(".product-overlay").forEach(el => el.remove());
}

/* --- INIT --- */

renderProducts();
