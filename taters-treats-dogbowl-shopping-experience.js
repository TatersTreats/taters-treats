async function beginCheckout() {
  // HAPTIC: stronger confirmation
  if (navigator.vibrate) {
    navigator.vibrate([30]);
  }

  if (!state.cartItems || !state.cartItems.length) {
    if (cartStatus) {
      cartStatus.textContent = "Add a few Woofles first.";
      window.setTimeout(() => {
        if (cartStatus) cartStatus.textContent = "";
      }, 1400);
    }
    return;
  }

  if (checkoutButton) {
    checkoutButton.disabled = true;
    checkoutButton.textContent = "Opening Checkout...";
  }
  if (cartStatus) cartStatus.textContent = "Preparing secure checkout...";

  try {
    const items = state.cartItems.map((item) => {
      const priceId = PRICE_MAP[item.productId]?.[item.size];
      if (!priceId) {
        throw new Error(`Missing Stripe price for ${item.productId} ${item.size}`);
      }
      return {
        priceId,
        quantity: item.quantity
      };
    });

    const response = await fetch("/api/create-dogbowl-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.url) {
      throw new Error(data?.error || "Checkout failed.");
    }

    window.location.href = data.url;
  } catch (error) {
    if (cartStatus) {
      cartStatus.textContent = error?.message || "Checkout failed.";
      window.setTimeout(() => {
        if (cartStatus) cartStatus.textContent = "";
      }, 2200);
    }
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Checkout";
    }
  }
}
