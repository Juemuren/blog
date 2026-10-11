(() => {
  const content = document.querySelector(".post-content");
  if (!content) return;

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.dataset.imageLightbox = "";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = '<img alt="">';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const dragThreshold = 4;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragStart = null;
  let ignoreNextClick = false;
  let lastPointerDistance = null;

  const clampScale = (value) => Math.min(Math.max(value, 1), 5);

  const render = () => {
    lightboxImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    lightbox.classList.toggle("is-zooming", scale > 1);
  };

  const resetTransform = () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    dragStart = null;
    ignoreNextClick = false;
    lastPointerDistance = null;
    render();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open", "is-dragging");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-image-lightbox");
    lightboxImage.removeAttribute("src");
    resetTransform();
  };

  const openLightbox = (image) => {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-image-lightbox");
    resetTransform();
  };

  content.querySelectorAll("img").forEach((image) => {
    if (image.closest("a")) return;
    image.addEventListener("click", () => openLightbox(image));
  });

  lightbox.addEventListener("click", () => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }
    closeLightbox();
  });

  lightbox.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const nextScale = clampScale(scale + (event.deltaY < 0 ? 0.25 : -0.25));
      if (nextScale === 1) {
        offsetX = 0;
        offsetY = 0;
      }
      scale = nextScale;
      render();
    },
    { passive: false },
  );

  lightbox.addEventListener("pointerdown", (event) => {
    if (scale <= 1) return;
    event.preventDefault();
    dragStart = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX,
      offsetY,
      moved: false,
    };
    lightbox.setPointerCapture(event.pointerId);
    lightbox.classList.add("is-dragging");
  });

  lightbox.addEventListener("pointermove", (event) => {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    event.preventDefault();
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    if (Math.hypot(deltaX, deltaY) >= dragThreshold) dragStart.moved = true;
    offsetX = dragStart.offsetX + deltaX;
    offsetY = dragStart.offsetY + deltaY;
    render();
  });

  const finishDrag = (event) => {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    ignoreNextClick = dragStart.moved;
    dragStart = null;
    lightbox.classList.remove("is-dragging");
  };

  lightbox.addEventListener("pointerup", finishDrag);
  lightbox.addEventListener("pointercancel", finishDrag);

  lightbox.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();

      const [firstTouch, secondTouch] = event.touches;
      const distance = Math.hypot(
        firstTouch.clientX - secondTouch.clientX,
        firstTouch.clientY - secondTouch.clientY,
      );

      if (lastPointerDistance) {
        scale = clampScale(scale * (distance / lastPointerDistance));
        if (scale === 1) {
          offsetX = 0;
          offsetY = 0;
        }
        render();
      }

      lastPointerDistance = distance;
    },
    { passive: false },
  );

  lightbox.addEventListener("touchend", () => {
    lastPointerDistance = null;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();
