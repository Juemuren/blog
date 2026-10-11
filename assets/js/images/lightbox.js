(() => {
  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const ZOOM_STEP = 0.25;
  const DRAG_THRESHOLD = 4;

  const createState = () => ({
    scale: MIN_SCALE,
    offsetX: 0,
    offsetY: 0,
    drag: null,
    ignoreNextClick: false,
    pinchDistance: null,
  });

  const zoomTo = (state, requestedScale) => {
    const scale = Math.min(Math.max(requestedScale, MIN_SCALE), MAX_SCALE);
    return {
      ...state,
      scale,
      offsetX: scale === MIN_SCALE ? 0 : state.offsetX,
      offsetY: scale === MIN_SCALE ? 0 : state.offsetY,
    };
  };

  const startDrag = (state, { pointerId, clientX, clientY }) => ({
    ...state,
    drag: {
      pointerId,
      x: clientX,
      y: clientY,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      moved: false,
    },
  });

  // Drag transitions are only called for the active pointer.
  const moveDrag = (state, { clientX, clientY }) => {
    const { drag } = state;
    const deltaX = clientX - drag.x;
    const deltaY = clientY - drag.y;
    return {
      ...state,
      offsetX: drag.offsetX + deltaX,
      offsetY: drag.offsetY + deltaY,
      drag: {
        ...drag,
        moved: drag.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD,
      },
    };
  };

  const endDrag = (state) => ({
    ...state,
    ignoreNextClick: state.drag.moved,
    drag: null,
  });

  const pinchTo = (state, distance) => {
    const nextState = state.pinchDistance
      ? zoomTo(state, state.scale * (distance / state.pinchDistance))
      : state;
    return { ...nextState, pinchDistance: distance };
  };

  const getTouchDistance = ([first, second]) =>
    Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

  const isActivePointer = (state, { pointerId }) =>
    state.drag !== null && state.drag.pointerId === pointerId;

  const content = document.querySelector(".post-content");
  const lightbox = document.querySelector("[data-image-lightbox]");
  const lightboxImage = lightbox?.querySelector("img");
  if (!content || !lightbox || !lightboxImage) return;

  let state = createState();

  const render = ({ scale, offsetX, offsetY, drag }) => {
    lightboxImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    lightbox.classList.toggle("is-zooming", scale > MIN_SCALE);
    lightbox.classList.toggle("is-dragging", drag !== null);
  };

  // State transitions return new objects; DOM updates stay at this boundary.
  const setState = (nextState) => {
    state = nextState;
    render(state);
  };

  const setOpen = (isOpen) => {
    lightbox.classList.toggle("is-open", isOpen);
    lightbox.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("has-image-lightbox", isOpen);
    setState(createState());
  };

  const openLightbox = (image) => {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    setOpen(true);
  };

  const closeLightbox = () => {
    lightboxImage.removeAttribute("src");
    setOpen(false);
  };

  const handleClick = () => {
    if (state.ignoreNextClick) {
      setState({ ...state, ignoreNextClick: false });
      return;
    }
    closeLightbox();
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const step = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setState(zoomTo(state, state.scale + step));
  };

  const handlePointerDown = (event) => {
    if (state.scale <= MIN_SCALE) return;
    event.preventDefault();
    lightbox.setPointerCapture(event.pointerId);
    setState(startDrag(state, event));
  };

  const handlePointerMove = (event) => {
    if (!isActivePointer(state, event)) return;
    event.preventDefault();
    setState(moveDrag(state, event));
  };

  const handlePointerEnd = (event) => {
    if (!isActivePointer(state, event)) return;
    setState(endDrag(state));
  };

  const handleTouchMove = (event) => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    setState(pinchTo(state, getTouchDistance(event.touches)));
  };

  const handleTouchEnd = () => {
    setState({ ...state, pinchDistance: null });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  };

  content.querySelectorAll("img").forEach((image) => {
    if (image.closest("a")) return;
    image.addEventListener("click", () => openLightbox(image));
  });

  lightbox.addEventListener("click", handleClick);
  lightbox.addEventListener("wheel", handleWheel, { passive: false });
  lightbox.addEventListener("pointerdown", handlePointerDown);
  lightbox.addEventListener("pointermove", handlePointerMove);
  lightbox.addEventListener("pointerup", handlePointerEnd);
  lightbox.addEventListener("pointercancel", handlePointerEnd);
  lightbox.addEventListener("touchmove", handleTouchMove, { passive: false });
  lightbox.addEventListener("touchend", handleTouchEnd);
  document.addEventListener("keydown", handleKeyDown);
})();
