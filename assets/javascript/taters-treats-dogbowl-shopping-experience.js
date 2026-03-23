// TOGGLE CARD
function toggleCard(card) {
  document.querySelectorAll('.product-card').forEach(c => {
    if (c !== card) c.classList.remove('active');
  });
  card.classList.toggle('active');
}

// QUANTITY
function changeQty(e, delta) {
  e.stopPropagation();

  const wrap = e.target.closest('.qty-section');
  const display = wrap.querySelector('.qty');

  let val = parseInt(display.textContent);
  val += delta;

  if (val < 1) val = 1;
  if (val > 9) val = 9;

  display.textContent = val;
}

// ADD TO BOWL (basic visual feedback)
function addToBowl(e) {
  e.stopPropagation();

  const countEl = document.getElementById("cartCount");
  let count = parseInt(countEl.textContent);

  count++;
  countEl.textContent = count;

  const list = document.getElementById("cartList");
  const li = document.createElement("li");
  li.textContent = "Woofle added";
  list.appendChild(li);
}