const PRODUCTS = [
  {
    id: "pumpkin",
    line: "WOOFLES™",
    flavor: "Pumpkin Turmeric",
    benefit: "Supports gentle digestion",
    description: "",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rlDywMn3O3R8C2mIqpVZ" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8psJph7ti" },
      value:   { label: "Large",  priceId: "price_1TD3rlDywMn3O3R8fHQICEqm" }
    }
  },
  {
    id: "pbmc",
    line: "WOOFLES™",
    flavor: "Peanut Butter Mint Carob",
    benefit: "Helps freshen breath",
    description: "",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rlDywMn3O3R84BZEFkVl" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8Kw2mxifP" },
      value:   { label: "Large",  priceId: "price_1TD3rkDywMn3O3R8LhNyxt0V" }
    }
  },
  {
    id: "ginger",
    line: "WOOFLES™",
    flavor: "Peanut Butter Ginger",
    benefit: "Helps soothe the tummy",
    description: "",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png",
    defaultSize: "regular",
    sizes: {
      trial:   { label: "Small",  priceId: "price_1TD3rmDywMn3O3R81CgJYyr4" },
      regular: { label: "Medium", priceId: "price_1TD3rlDywMn3O3R8CDw2xmaI" },
      value:   { label: "Large",  priceId: "price_1TD3rkDywMn3O3R8PquAjDEM" }
    }
  }
];

const STORAGE_KEY = "taters_dogbowl_v6";

/* 🔒 Disable image long press */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .product-image img {
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
      user-select: none;
      pointer-events: none;
    }

    .product-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20,18,14,0.35);
      backdrop-filter: blur(6px);
      z-index: 50;
    }

    .product-card {
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .product-card.active {
      position: fixed;
      top: 50%;
      left: 50%;
      width: min(92vw, 420px);
      transform: translate(-50%, -50%) scale(1.05);
      z-index: 60;
      background: white;
      border-radius: 18px;
      box-shadow:
        0 18px 40px rgba(0,0,0,0.18),
        0 6px 14px rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(style);
})();

/* --- PRODUCT RENDER --- */

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
  productsEl.innerHTML = "";

  PRODUCTS.forEach(product => {
    productsEl.appendChild(renderProductCard(product));
  });

  attachLongPressHandlers();
}

/* --- LONG PRESS → EXPAND --- */

function attachLongPressHandlers() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const productId = card.dataset.product;

    let timer = null;

    const start = () => {
      timer = setTimeout(() => {
        openProductDetail(card, productId);
      }, 350);
    };

    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    card.addEventListener("touchstart", start);
    card.addEventListener("touchend", cancel);
    card.addEventListener("touchmove", cancel);
    card.addEventListener("touchcancel", cancel);
  });
}

/* --- OPEN / CLOSE --- */

function openProductDetail(card, productId) {
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

  document.querySelectorAll(".product-card.active").forEach(card => {
    card.classList.remove("active");
  });

  document.querySelectorAll(".product-overlay").forEach(el => el.remove());
}

/* --- INIT --- */

renderProducts();
