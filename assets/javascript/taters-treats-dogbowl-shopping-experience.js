const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin & Turmeric",
    description: "Gentle on sensitive stomachs",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Mint & Carob",
    description: "Freshens breath naturally",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter & Ginger",
    description: "Comforts and settles the tummy",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

const SIZE_OPTIONS = ["Regular", "Value"];
const SIZE_COUNTS = {
  Regular: 1,
  Value: 2
};

const SCROLL_DURATION_MS = 420;
const MODAL_CLOSE_DURATION_MS = 320;
const WOOFLE_FLIGHT_DURATION_MS = 620;
const MODAL_ENTER_DELAY_MS = 70;

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlInnerEl: null,
  bowlItemsLayer: null,
  isOpening: false
};

function initShopIntro() {
  if (!shopEl) return;

  let sectionHead = shopEl.querySelector(".section-head");
  if (!sectionHead) {
    sectionHead = document.createElement("div");
    sectionHead.className = "section-head";
    shopEl.prepend(sectionHead);
  }

  sectionHead.innerHTML = `
    <h2 class="shop-intro-line">Three flavors. Two sizes. One happy dog.</h2>
  `;
}

function renderProducts() {
  if (!productsEl) return;

  productsEl.innerHTML = PRODUCTS.map((product) => `
    <article
      class="product-card"
      data-id="${product.id}"
      tabindex="0"
      role="button"
      aria-label="Open ${product.flavor}"
    >
      <div class="product-image">
        <img src="${product.image}" alt="${product.flavor}" />
      </div>
      <span class="product-flavor">${product.flavor}</span>
    </article>
  `).join("");

  attachCardEvents();
}

function attachCardEvents() {
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => openDetail(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(card);
      }
    });
  });
}

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}

function getShopScrollTarget() {
  if (!shopEl) return window.scrollY;

  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.offsetHeight : 0;

  return Math.max(
    0,
    window.scrollY + shopEl.getBoundingClientRect().top - headerOffset - 10
  );
}

function scrollToShop() {
  return new Promise((resolve) => {
    window.scrollTo({
      top: getShopScrollTarget(),
      behavior: "smooth"
    });

    window.setTimeout(resolve, SCROLL_DURATION_MS);
  });
}

function createModalMarkup(product) {
  return `
    <img src="${product.image}" class="modal-image" alt="${product.flavor}" />
    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      ${SIZE_OPTIONS.map((size, index) => `
        <button class="pill ${index === 0 ? "active" : ""}" data-size="${size}">
          ${size}
        </button>
      `).join("")}
    </div>

    <div class="quantity">
      <button class="qty minus">−</button>
      <span class="qty-value">1</span>
      <button class="qty plus">+</button>
    </div>

    <button class="cta">Fill the DogBowl™</button>
  `;
}

async function openDetail(card) {
  if (!card || state.activeModal || state.isOpening) return;

  const product = getProductById(card.dataset.id);
  if (!product) return;

  state.isOpening = true;

  const overlay = document.createElement("div");
  overlay.className = "product-overlay";

  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.innerHTML = createModalMarkup(product);

  document.body.append(overlay, modal);
  document.body.classList.add("product-detail-open");

  state.activeOverlay = overlay;
  state.activeModal = modal;

  bindModal(modal, overlay, product);

  requestAnimationFrame(() => overlay.classList.add("active"));

  const scrollPromise = scrollToShop();

  setTimeout(() => {
    modal.classList.add("active");
    state.isOpening = false;
  }, MODAL_ENTER_DELAY_MS);

  await scrollPromise;
}

function ensureBowlLayers() {
  if (!bowlFrameEl) return { inner: null, items: null };

  if (!state.bowlInnerEl) {
    let inner = bowlFrameEl.querySelector(".bowl-inner-target");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "bowl-inner-target";
      bowlFrameEl.appendChild(inner);
    }
    state.bowlInnerEl = inner;
  }

  if (!state.bowlItemsLayer) {
    let items = state.bowlInnerEl.querySelector(".static-bowl-items");
    if (!items) {
      items = document.createElement("div");
      items.className = "static-bowl-items";
      state.bowlInnerEl.appendChild(items);
    }
    state.bowlItemsLayer = items;
  }

  return {
    inner: state.bowlInnerEl,
    items: state.bowlItemsLayer
  };
}

function addWoofleToBowlAt(imageSrc, target) {
  const { inner, items } = ensureBowlLayers();
  if (!items || !inner) return;

  const innerRect = inner.getBoundingClientRect();

  const item = document.createElement("img");
  item.className = "static-bowl-woofle";
  item.src = imageSrc;

  const x = ((target.x - innerRect.left) / innerRect.width) * 100;
  const y = ((target.y - innerRect.top) / innerRect.height) * 100;

  const rotation = -12 + Math.random() * 24;

  item.style.left = `${x}%`;
  item.style.top = `${y}%`;
  item.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1.05)`;

  items.appendChild(item);
}

function animateWoofleArc(flight, start, control, end, duration, onDone) {
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    const x =
      (1 - eased) * (1 - eased) * start.x +
      2 * (1 - eased) * eased * control.x +
      eased * eased * end.x;

    const y =
      (1 - eased) * (1 - eased) * start.y +
      2 * (1 - eased) * eased * control.y +
      eased * eased * end.y;

    flight.style.left = `${x}px`;
    flight.style.top = `${y}px`;
    flight.style.transform = `translate(-50%, -50%) scale(${0.85 + eased * 0.25})`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

function launchWoofleFromCTA(button, imageSrc, count) {
  const { inner } = ensureBowlLayers();
  if (!button || !inner || count < 1) return;

  const buttonRect = button.getBoundingClientRect();
  const innerRect = inner.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;

    const target = {
      x: innerRect.left + innerRect.width * (0.35 + Math.random() * 0.3),
      y: innerRect.top + innerRect.height * (0.5 + Math.random() * 0.15)
    };

    const start = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    };

    const control = {
      x: start.x + (target.x - start.x) * 0.4,
      y: Math.min(start.y, target.y) - 100
    };

    flight.style.left = `${start.x}px`;
    flight.style.top = `${start.y}px`;

    document.body.appendChild(flight);

    setTimeout(() => {
      animateWoofleArc(
        flight,
        start,
        control,
        target,
        WOOFLE_FLIGHT_DURATION_MS,
        () => {
          addWoofleToBowlAt(imageSrc, target);
          flight.remove();
        }
      );
    }, i * 60);
  }
}

function bindModal(modal, overlay, product) {
  let quantity = 1;
  let selectedSize = "Regular";

  const qtyEl = modal.querySelector(".qty-value");
  const plus = modal.querySelector(".plus");
  const minus = modal.querySelector(".minus");
  const pills = modal.querySelectorAll(".pill");
  const cta = modal.querySelector(".cta");

  plus.onclick = () => {
    quantity++;
    qtyEl.textContent = quantity;
  };

  minus.onclick = () => {
    quantity = Math.max(1, quantity - 1);
    qtyEl.textContent = quantity;
  };

  pills.forEach((p) => {
    p.onclick = () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      selectedSize = p.dataset.size;
    };
  });

  cta.onclick = () => {
    const total = (SIZE_COUNTS[selectedSize] || 1) * quantity;
    launchWoofleFromCTA(cta, product.image, total);
    closeModal();
  };

  overlay.onclick = closeModal;
}

function closeModal() {
  if (!state.activeModal) return;

  const modal = state.activeModal;
  const overlay = state.activeOverlay;

  modal.classList.add("closing");
  overlay.classList.remove("active");

  setTimeout(() => {
    modal.remove();
    overlay.remove();
    document.body.classList.remove("product-detail-open");
  }, MODAL_CLOSE_DURATION_MS);

  state.activeModal = null;
  state.activeOverlay = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

initShopIntro();
renderProducts();
