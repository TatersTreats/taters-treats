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

const STORAGE_KEY = "taters_dogbowl_v6";

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
  } catch {
    return [];
  }
}

function saveBowl() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bowl));
}

function getProduct(productId) {
  return PRODUCTS.find((p) => p.id === productId);
}

function getSelectedSizeKey(productId) {
  const active = document.querySelector(`.pill-btn[data-product="${productId}"].active`);
  return active ? active.dataset.size : null;
}

function getSelectedQuantity(productId) {
  const el = document.getElementById(`qty-${productId}`);
  return Number(el?.textContent || "1") || 1;
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
      width: min(100%, 540px);
      aspect-ratio: 1;
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
    }

    .dogbowl-stage__treat {
      position: absolute;
      width: clamp(44px, 10vw, 74px);
      transform: translate(-50%, -50%);
    }

    @media (max-width: 640px) {
      .dogbowl-stage {
        width: 82px;
        border-radius: 0;
      }

      .dogbowl-stage__background {
        display: none;
      }

      .dogbowl-stage__treat {
        width: clamp(18px, 5vw, 26px);
      }
    }
  `;
  document.head.appendChild(style);
}

function ensureDogBowlStage() {
  if (!bowlFrameEl) return;

  injectDogBowlStyles();

  bowlFrameEl.innerHTML = `
    <div class="dogbowl-stage" id="dogbowlStage">
      <img class="dogbowl-stage__background" src="${DOGBOWL_BACKGROUND_IMAGE}" />
      <img class="dogbowl-stage__bowl" id="dogbowlBowlLayer" src="${DOGBOWL_BOWL_IMAGE}" />
      <div class="dogbowl-stage__treat-layer" id="dogbowlTreatLayer"></div>
    </div>
  `;

  dogbowlTreatLayerEl = document.getElementById("dogbowlTreatLayer");
}

function renderDogBowlLayered() {
  if (!dogbowlTreatLayerEl) return;

  dogbowlTreatLayerEl.innerHTML = "";

  bowl.forEach((item, i) => {
    const product = getProduct(item.productId);
    if (!product) return;

    const treat = document.createElement("img");
    treat.className = "dogbowl-stage__treat";
    treat.src = product.image;
    treat.style.left = `${50 + (i % 3) * 10}%`;
    treat.style.top = `${60 - Math.floor(i / 3) * 8}%`;

    dogbowlTreatLayerEl.appendChild(treat);
  });
}

function addToBowl(productId) {
  const sizeKey = getSelectedSizeKey(productId);
  const quantity = getSelectedQuantity(productId);
  const product = getProduct(productId);

  if (!sizeKey) return;

  const key = bowlKey(productId, sizeKey);
  const existing = bowl.find((i) => i.key === key);

  if (existing) {
    existing.quantity += quantity;
  } else {
    bowl.push({
      key,
      productId,
      sizeKey,
      quantity,
      priceId: product.sizes[sizeKey].priceId
    });
  }

  saveBowl();
  renderBowl();

  if (window.innerWidth < 768) {
    cartStatusEl.textContent = "Added to bowl.";
  }
}

function renderProducts() {
  productsEl.innerHTML = "";
  PRODUCTS.forEach((product) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <div class="product-card">
        <img src="${product.image}">
        <div>${product.flavor}</div>
        <button class="add-button" data-add="${product.id}">Add</button>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

function renderBowl() {
  cartCountEl.textContent = bowl.length;
  renderDogBowlLayered();
}

document.addEventListener("click", (e) => {
  if (e.target.matches(".add-button")) {
    addToBowl(e.target.dataset.add);
  }
});

ensureDogBowlStage();
renderProducts();
renderBowl();