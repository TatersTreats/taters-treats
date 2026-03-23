const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin Turmeric",
    description: "Supports gentle digestion",
    image: "/assets/images/products/pumpkin.png"
  },
  {
    id: "pbmc",
    flavor: "Peanut Butter Mint Carob",
    description: "Helps freshen breath",
    image: "/assets/images/products/pbmc.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter Ginger",
    description: "Helps soothe the tummy",
    image: "/assets/images/products/ginger.png"
  }
];

const productsEl = document.getElementById("products");

/* ---------- RENDER ---------- */

function renderProducts() {
  productsEl.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.flavor}" />
      </div>
      <span class="product-flavor">${p.flavor}</span>
    </article>
  `).join("");

  attachCardEvents();
}

/* ---------- INTERACTION ---------- */

function attachCardEvents() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      openDetail(card.dataset.id);
    });
  });
}

/* ---------- DETAIL VIEW ---------- */

function openDetail(id) {
  const product = PRODUCTS.find(p => p.id === id);

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";

  const modal = document.createElement("div");
  modal.className = "product-modal";

  modal.innerHTML = `
    <img src="${product.image}" class="modal-image" />

    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      <button class="pill active">Trial</button>
      <button class="pill">Regular</button>
      <button class="pill">Value</button>
    </div>

    <div class="quantity">
      <button class="qty minus">−</button>
      <span class="qty-value">1</span>
      <button class="qty plus">+</button>
    </div>

    <button class="cta">Fill the DogBowl™</button>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  attachModalEvents(modal, overlay);
}

function attachModalEvents(modal, overlay) {
  let qty = 1;
  const qtyEl = modal.querySelector(".qty-value");

  modal.querySelector(".plus").onclick = () => {
    qty++;
    qtyEl.textContent = qty;
  };

  modal.querySelector(".minus").onclick = () => {
    qty--;
    if (qty < 1) qty = 1;
    qtyEl.textContent = qty;
  };

  modal.querySelectorAll(".pill").forEach(btn => {
    btn.onclick = () => {
      modal.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  overlay.onclick = closeModal;
}

function closeModal() {
  document.querySelector(".product-overlay")?.remove();
  document.querySelector(".product-modal")?.remove();
}

/* ---------- INIT ---------- */

renderProducts();
