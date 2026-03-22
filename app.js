const PRODUCTS = [
  {
    id: "pbmc",
    name: "Peanut Butter Mint Carob",
    image: "/assets/images/products/pbmc.jpg"
  },
  {
    id: "pumpkin",
    name: "Pumpkin Turmeric",
    image: "/assets/images/products/pumpkin.jpg"
  },
  {
    id: "ginger",
    name: "Peanut Butter Ginger",
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
      <div>
        <strong>${p.name}</strong>
        <br/>
        <button onclick="addToCart('${p.id}')">Add</button>
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
  const el = document.getElementById("cart");
  el.innerHTML = `Items: ${cart.length}`;

  const bowl = document.getElementById("bowlImage");

  if (cart.length === 0) bowl.src = "/assets/images/dogbowl/empty-bowl.png";
  else if (cart.length < 3) bowl.src = "/assets/images/dogbowl/bowl-1.png";
  else bowl.src = "/assets/images/dogbowl/bowl-full.png";
}

function checkout() {
  alert("Checkout coming soon");
}

function scrollToShop() {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}

renderProducts();
updateCart();