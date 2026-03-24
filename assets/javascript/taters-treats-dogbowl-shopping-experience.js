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

/* === deterministic bowl slots === */
function getBowlSlot(index) {
  const slots = [
    { x: 0.36, y: 0.70, rotation: -16, scale: 1.06 },
    { x: 0.52, y: 0.60, rotation: 8, scale: 1.08 },
    { x: 0.67, y: 0.70, rotation: 18, scale: 1.04 },
    { x: 0.44, y: 0.82, rotation: -8, scale: 1.02 },
    { x: 0.60, y: 0.82, rotation: 10, scale: 1.03 },
    { x: 0.29, y: 0.59, rotation: -20, scale: 1.01 },
    { x: 0.73, y: 0.59, rotation: 22, scale: 1.01 },
    { x: 0.50, y: 0.73, rotation: -2, scale: 1.05 }
  ];

  return slots[index % slots.length];
}

function getNextBowlTarget() {
  const { inner } = ensureBowlLayers();
  if (!inner) return null;

  const rect = inner.getBoundingClientRect();
  const slot = getBowlSlot(state.nextSlotIndex++);
  
  return {
    viewportX: rect.left + rect.width * slot.x,
    viewportY: rect.top + rect.height * slot.y,
    innerX: slot.x,
    innerY: slot.y,
    rotation: slot.rotation,
    scale: slot.scale
  };
}

function addWoofleToBowl(target, imageSrc) {
  const { items } = ensureBowlLayers();
  if (!items || !target) return;

  const item = document.createElement("img");
  item.className = "static-bowl-woofle";
  item.src = imageSrc;

  item.style.left = `${target.innerX * 100}%`;
  item.style.top = `${target.innerY * 100}%`;
  item.style.transform =
    `translate(-50%, -50%) rotate(${target.rotation}deg) scale(${target.scale})`;

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

    if (t < 1) requestAnimationFrame(frame);
    else onDone();
  }

  requestAnimationFrame(frame);
}

function launchWoofleFromCTA(button, imageSrc, count) {
  const { inner } = ensureBowlLayers();
  if (!button || !inner || count < 1) return;

  const buttonRect = button.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const target = getNextBowlTarget();
    if (!target) return;

    const flight = document.createElement("img");
    flight.className = "woofle-flight";
    flight.src = imageSrc;

    const start = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    };

    const end = {
      x: target.viewportX,
      y: target.viewportY
    };

    const control = {
      x: start.x + (end.x - start.x) * 0.4,
      y: Math.min(start.y, end.y) - 100
    };

    document.body.appendChild(flight);

    animateWoofleArc(
      flight,
      start,
      control,
      end,
      WOOFLE_FLIGHT_DURATION_MS,
      () => {
        addWoofleToBowl(target, imageSrc);
        flight.remove();
      }
    );
  }
}
