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

/* 🔒 Disable native image long-press globally */
(function injectNoImageTouchStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .product-image img {
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
      user-select: none;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
})();

/* --- EXISTING CODE UNCHANGED UNTIL renderProductCard --- */

function renderProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.product = product.id; // ✅ important

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.line} ${product.flavor}" />
    </div>

    <div class="product-body">
      <div class="product-title">
        <span class="product-flavor">${product.flavor}</span>
      </div>

      <p class="product-benefit">${product.benefit}</p>
    </div>
  `;

  return card;
}

/* --- LONG PRESS SYSTEM --- */

function attachLongPressHandlers() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const productId = card.dataset.product;

    let timer = null;

    const start = () => {
      timer = setTimeout(() => {
        openProductDetail(productId);
      }, 400);
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

/* --- TEMP DETAIL HANDLER --- */

function openProductDetail(productId) {
  console.log("OPEN PRODUCT:", productId);

  // future:
  // openBottomSheet(productId)
}

/* --- RENDER --- */

function renderProducts() {
  const productsEl = document.getElementById("products");
  productsEl.innerHTML = "";

  PRODUCTS.forEach(product => {
    productsEl.appendChild(renderProductCard(product));
  });

  attachLongPressHandlers(); // ✅ attach after render
}

/* --- INIT --- */

renderProducts();
