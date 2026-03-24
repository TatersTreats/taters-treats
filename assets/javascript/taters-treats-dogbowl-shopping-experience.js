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
const MODAL_CLOSE_DURATION_MS = 260;
const WOOFLE_FLIGHT_DURATION_MS = 520;
const MODAL_ENTER_DELAY_MS = 70;

const productsEl = document.getElementById("products");
const shopEl = document.getElementById("shop") || document.querySelector("#shop");
const bowlFrameEl = document.querySelector(".bowl-frame");

const state = {
  activeOverlay: null,
  activeModal: null,
  bowlInnerEl: null,
  bowlItemsLayer: null,
  nextSlotIndex: 0,
  isOpening: false
};

/* ================= INIT ================= */

function initShopIntro() {
  if (!shopEl) return;

  const existing = shopEl.querySelector(".shop-intro");
  if (!existing) {
    const intro = document.createElement("div");
    intro.className = "shop-intro";
    intro.innerHTML = `<p class="shop-intro-line">Three flavors. Two sizes. One happy dog.</p>`;
    shopEl.prepend(intro);
  }
}

function renderProducts() {
  if (!productsEl) return;

  productsEl.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" />
      </div>
      <span class="product-flavor">${p.flavor}</span>
    </article>
  `).join("");

  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => openDetail(card));
  });
}

/* ================= MODAL ================= */

function createModalMarkup(product) {
  return `
    <img src="${product.image}" class="modal-image" />
    <h2>${product.flavor}</h2>
    <p class="modal-description">${product.description}</p>

    <div class="size-options">
      ${SIZE_OPTIONS.map((s,i)=>`
        <button class="pill ${i===0?'active':''}" data-size="${s}">${s}</button>
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

function openDetail(card) {
  if (state.activeModal || state.isOpening) return;

  const product = PRODUCTS.find(p => p.id === card.dataset.id);
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

  requestAnimationFrame(()=>overlay.classList.add("active"));

  setTimeout(()=>{
    modal.classList.add("active");
    state.isOpening = false;
  }, MODAL_ENTER_DELAY_MS);
}

function closeModal() {
  if (!state.activeModal) return;

  const modal = state.activeModal;
  const overlay = state.activeOverlay;

  modal.classList.add("closing");
  overlay.classList.remove("active");

  setTimeout(()=>{
    modal.remove();
    overlay.remove();
    document.body.classList.remove("product-detail-open");
  }, MODAL_CLOSE_DURATION_MS);

  state.activeModal = null;
  state.activeOverlay = null;
  state.isOpening = false;
}

/* ================= BOWL ================= */

function ensureBowlLayers() {
  if (!bowlFrameEl) return { inner:null, items:null };

  if (!state.bowlInnerEl) {
    state.bowlInnerEl = bowlFrameEl.querySelector(".bowl-inner-target");
  }

  if (!state.bowlItemsLayer) {
    state.bowlItemsLayer = bowlFrameEl.querySelector(".static-bowl-items");
  }

  return {
    inner: state.bowlInnerEl,
    items: state.bowlItemsLayer
  };
}

function getSlot(i) {
  const slots = [
    [0.35,0.7], [0.5,0.6], [0.65,0.7],
    [0.45,0.8], [0.6,0.8], [0.3,0.6],
    [0.7,0.6], [0.5,0.75]
  ];
  return slots[i % slots.length];
}

function addWoofle(target, src) {
  const {items} = ensureBowlLayers();
  if (!items) return;

  const img = document.createElement("img");
  img.className = "static-bowl-woofle";
  img.src = src;

  img.style.left = target.x * 100 + "%";
  img.style.top = target.y * 100 + "%";
  img.style.transform = "translate(-50%,-50%)";

  items.appendChild(img);
}

/* ================= ANIMATION ================= */

function animate(flight, start, control, end, done) {
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime)/WOOFLE_FLIGHT_DURATION_MS,1);
    const e = 1 - Math.pow(1 - t, 3);

    const x = (1-e)*(1-e)*start.x + 2*(1-e)*e*control.x + e*e*end.x;
    const y = (1-e)*(1-e)*start.y + 2*(1-e)*e*control.y + e*e*end.y;

    flight.style.left = x + "px";
    flight.style.top = y + "px";

    if (t<1) requestAnimationFrame(frame);
    else done();
  }

  requestAnimationFrame(frame);
}

function launchWoofleFromCTA(button, src, count) {
  const {inner} = ensureBowlLayers();
  if (!inner) return;

  const rect = inner.getBoundingClientRect();
  const btn = button.getBoundingClientRect();

  for (let i=0;i<count;i++) {

    const slot = getSlot(state.nextSlotIndex++);
    const target = {
      x: rect.left + rect.width * slot[0],
      y: rect.top + rect.height * slot[1]
    };

    const start = {
      x: btn.left + btn.width/2,
      y: btn.top + btn.height/2
    };

    const control = {
      x: (start.x + target.x)/2,
      y: Math.min(start.y,target.y) - 100
    };

    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = src;

    document.body.appendChild(flight);

    animate(flight, start, control, target, ()=>{
      addWoofle({x:slot[0], y:slot[1]}, src);
      flight.remove();
    });
  }
}

/* ================= MODAL BIND ================= */

function bindModal(modal, overlay, product) {
  let qty = 1;
  let size = "Regular";

  const val = modal.querySelector(".qty-value");
  modal.querySelector(".plus").onclick = ()=> val.textContent = ++qty;
  modal.querySelector(".minus").onclick = ()=> val.textContent = qty = Math.max(1, qty-1);

  modal.querySelectorAll(".pill").forEach(p=>{
    p.onclick = ()=>{
      modal.querySelectorAll(".pill").forEach(x=>x.classList.remove("active"));
      p.classList.add("active");
      size = p.dataset.size;
    };
  });

  modal.querySelector(".cta").onclick = ()=>{
    const total = SIZE_COUNTS[size]*qty;
    launchWoofleFromCTA(modal.querySelector(".cta"), product.image, total);
    closeModal();
  };

  overlay.onclick = closeModal;
}

/* ================= START ================= */

document.addEventListener("keydown", e=>{
  if (e.key==="Escape") closeModal();
});

initShopIntro();
renderProducts();
