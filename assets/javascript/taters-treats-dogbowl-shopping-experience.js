// --- SAME PRODUCTS / CONFIG (UNCHANGED) ---

// (keep everything above bindModal the same)

// -----------------------------
// UPDATED MODAL BIND
// -----------------------------

function bindModal(modal, overlay, product) {
  let quantity = 1;
  let selectedSize = "Regular";

  const valueEl = modal.querySelector(".qty-value");
  const plusButton = modal.querySelector(".qty-plus");
  const minusButton = modal.querySelector(".qty-minus");
  const sizeButtons = modal.querySelectorAll(".pill");
  const ctaButton = modal.querySelector(".cta");

  function updateQuantity() {
    if (valueEl) valueEl.textContent = String(quantity);
  }

  // FIX: prevent modal clicks from bubbling, but allow overlay
  modal.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  plusButton?.addEventListener("click", () => {
    quantity += 1;
    updateQuantity();
  });

  minusButton?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateQuantity();
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      selectedSize = button.dataset.size || "Regular";
    });
  });

  ctaButton?.addEventListener("click", () => {
    const total = (SIZE_COUNTS[selectedSize] || 1) * quantity;
    launchWoofleFromCTA(ctaButton, product.image, total);
    closeModal();
  });

  // FIX: overlay click always closes
  overlay.addEventListener("click", () => {
    closeModal();
  });
}
