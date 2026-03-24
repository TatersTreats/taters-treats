const PRODUCTS = [
  {
    id: "pumpkin",
    flavor: "Pumpkin & Turmeric",
    image: "/assets/images/products/pumpkin-turmeric-woofle.png"
  },
  {
    id: "pbmc",
    flavor: "Mint & Carob",
    image: "/assets/images/products/peanut-butter-mint-carob-woofle.png"
  },
  {
    id: "ginger",
    flavor: "Peanut Butter & Ginger",
    image: "/assets/images/products/peanut-butter-ginger-woofle.png"
  }
];

const productsEl = document.getElementById("products");
const bowlInner = document.querySelector(".bowl-inner-target");
const bowlItems = document.querySelector(".static-bowl-items");

function renderProducts() {
  productsEl.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" />
      </div>
      <span class="product-flavor">${p.flavor}</span>
    </article>
  `).join("");

  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => launch(card));
  });
}

function launch(card) {
  const img = card.querySelector("img");
  const rect = card.getBoundingClientRect();
  const innerRect = bowlInner.getBoundingClientRect();

  const target = {
    x: innerRect.left + innerRect.width * (0.3 + Math.random() * 0.4),
    y: innerRect.top + innerRect.height * (0.45 + Math.random() * 0.2)
  };

  const flight = document.createElement("img");
  flight.src = img.src;
  flight.className = "woofle-flight";

  document.body.appendChild(flight);

  const start = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  const control = {
    x: (start.x + target.x) / 2,
    y: Math.min(start.y, target.y) - 100
  };

  animate(flight, start, control, target, () => {
    placeFinal(img.src, target);
    flight.remove();
  });
}

function placeFinal(src, target) {
  const innerRect = bowlInner.getBoundingClientRect();

  const item = document.createElement("img");
  item.src = src;
  item.className = "static-bowl-woofle";

  const x = ((target.x - innerRect.left) / innerRect.width) * 100;
  const y = ((target.y - innerRect.top) / innerRect.height) * 100;

  item.style.left = `${x}%`;
  item.style.top = `${y}%`;
  item.style.transform = `translate(-50%, -50%) scale(1.12)`;

  bowlItems.appendChild(item);
}

function animate(el, start, control, end, done) {
  const duration = 620;
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

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `translate(-50%, -50%) scale(${0.85 + eased * 0.25})`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      done();
    }
  }

  requestAnimationFrame(frame);
}

renderProducts();

/* ADDITIONS ONLY — rest of your file unchanged */

.bowl-front-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 45%;
  background: linear-gradient(to top, rgba(0,0,0,0.15), transparent);
  z-index: 3;
  pointer-events: none;
}

/* make resting clearly larger than flight */
.static-bowl-woofle {
  width: 96px;
  height: 96px;
}

/* ensure flight stays smaller */
.woofle-flight {
  width: 42px;
  height: 42px;
}
