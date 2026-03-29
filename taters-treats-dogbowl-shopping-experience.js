
// UPDATED: Woofle flight uses SAME modal image (no spawn)

function launchWoofleFromCTA(sourceEl, imageSrc, count) {
  if (!sourceEl || !bowlFrameEl || count < 1) return;

  const sourceRect = sourceEl.getBoundingClientRect();

  const flight = sourceEl;

  flight.style.position = "fixed";
  flight.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
  flight.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
  flight.style.transform = "translate(-50%, -50%) scale(1)";
  flight.style.zIndex = "90";
  flight.style.pointerEvents = "none";

  document.body.appendChild(flight);

  const targetPoint = createBowlTarget(0);
  if (!targetPoint) return;

  const bowlRect = bowlFrameEl.getBoundingClientRect();

  const endLeft = bowlRect.left + targetPoint.xPx;
  const endTop = bowlRect.top + targetPoint.yPx;

  requestAnimationFrame(() => {
    flight.style.transition = `
      left 620ms cubic-bezier(0.2, 0.8, 0.2, 1),
      top 620ms cubic-bezier(0.2, 0.8, 0.2, 1),
      transform 620ms cubic-bezier(0.2, 0.8, 0.2, 1)
    `;

    flight.style.left = `${endLeft}px`;
    flight.style.top = `${endTop}px`;
    flight.style.transform = "translate(-50%, -50%) scale(0.75)";
  });

  setTimeout(() => {
    addWoofleToBowl(imageSrc, targetPoint);
    flight.remove();
  }, 620);
}
