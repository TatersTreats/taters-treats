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
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}">
      <span>${p.flavor}</span>
    </div>
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
    y: innerRect.top + innerRect.height * (0.4 + Math.random() * 0.3)
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
    y: start.y - 120
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
  item.style.transform = "translate(-50%, -50%) scale(1.1)";

  bowlItems.appendChild(item);
}

function animate(el, start, control, end, done) {
  const duration = 600;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);

    const x =
      (1 - t) * (1 - t) * start.x +
      2 * (1 - t) * t * control.x +
      t * t * end.x;

    const y =
      (1 - t) * (1 - t) * start.y +
      2 * (1 - t) * t * control.y +
      t * t * end.y;

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = `translate(-50%, -50%) scale(${0.8 + t * 0.3})`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      done();
    }
  }

  requestAnimationFrame(frame);
}

renderProducts();
