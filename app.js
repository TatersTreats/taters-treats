const PRODUCTS = [
  {
    id: "pbmc",
    name: "Peanut Butter Mint Carob",
    benefit: "Freshens breath",
    image: "/assets/images/products/pbmc.jpg"
  },
  {
    id: "pumpkin",
    name: "Pumpkin Turmeric",
    benefit: "Supports digestion",
    image: "/assets/images/products/pumpkin.jpg"
  },
  {
    id: "ginger",
    name: "Peanut Butter Ginger",
    benefit: "Soothes the tummy",
    image: "/assets/images/products/ginger.jpg"
  }
];

let cart = [];

function renderProducts() {
  const container = document.getElementById("products");

  PRODUCTS.forEach(p => {
    const el = document.createElement("div");
    el.className = "product";

    el.innerHTML = `
      <img src="${p.image}" />
      <div class="product-info">
        <div class="product-title">${p.name}</div>
        <div class="product-benefit">${p.benefit}</div>
        <button onclick="addToCart('${p.id}')">Add to DogBowl™</button>
      </div>
    `;

    container.appendChild(el);
  });
}

function addToCart(id) {
  cart.push(id);
  updateCart();
}

function updateCart() {
  document.getElementById("cart").innerText = `Items: ${cart.length}`;

  const bowl = document.getElementById("bowlImage");
  const note = document.getElementById("bowlNote");

  if (cart.length === 0) {
    bowl.src = "/assets/images/dogbowl/empty-bowl.png";
    note.innerText = "Your DogBowl™ is waiting.";
  } else if (cart.length <= 2) {
    bowl.src = "/assets/images/dogbowl/bowl-1.png";
    note.innerText = "A good start.";
  } else if (cart.length <= 4) {
    bowl.src = "/assets/images/dogbowl/bowl-2.png";
    note.innerText = "Coming together nicely.";
  } else {
    bowl.src = "/assets/images/dogbowl/bowl-full.png";
    note.innerText = "That’s a full DogBowl™.";
  }
}

function checkout() {
  alert("Checkout coming soon");
}

function scrollToShop() {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}

renderProducts();
updateCart();