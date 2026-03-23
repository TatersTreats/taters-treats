// EXPAND
function toggleCard(card) {
  document.querySelectorAll('.product-card').forEach(c=>{
    if(c!==card) c.classList.remove('active');
  });
  card.classList.toggle('active');
}

// QTY
function changeQty(e, delta) {
  e.stopPropagation();
  let span = e.target.parentElement.querySelector("span");
  let val = parseInt(span.textContent);

  val += delta;
  if(val<1) val=1;
  if(val>9) val=9;

  span.textContent = val;
}

// ADD
function addToBowl(e, btn){
  e.stopPropagation();

  let count = document.getElementById("cartCount");
  count.textContent = parseInt(count.textContent)+1;

  let list = document.getElementById("cartList");
  let li = document.createElement("li");
  li.textContent = "Woofle added";
  list.appendChild(li);
}