(() => {
  const source = document.querySelector(".article-navigation-source");
  const rail = document.querySelector(".reading-rail");
  if (!source || !rail) return;
  const panel = rail.querySelector(".reading-panel");
  const tabs = panel.querySelector(".reading-tabs");
  const trigger = document.querySelector(".reading-trigger");
  const dialog = document.querySelector(".reading-dialog");
  const wide = matchMedia("(min-width: 1360px)");
  const entries = [];
  const toc = source.querySelector(":scope > .toc .inner");
  const series = source.querySelectorAll(".series-nav");

  // Build the extra navigation from the existing article links.
  function addTab(name, label, nodes) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `reading-tab-${name}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `reading-${name}`);
    button.textContent = label;
    const content = document.createElement("div");
    content.id = `reading-${name}`;
    content.className = "reading-list";
    content.setAttribute("role", "tabpanel");
    content.setAttribute("aria-labelledby", button.id);
    content.tabIndex = 0;
    for (const node of nodes) {
      const copy = node.cloneNode(true);
      for (const item of [
        copy,
        ...copy.querySelectorAll("[id], [accesskey]"),
      ]) {
        item.removeAttribute("id");
        item.removeAttribute("accesskey");
      }
      content.append(copy);
    }
    tabs.append(button);
    panel.append(content);
    entries.push({ button, content });
    button.addEventListener("click", () => selectTab(button));
  }

  function revealCurrent() {
    const content = entries.find(({ content }) => !content.hidden)?.content;
    const current = content?.querySelector("[aria-current]");
    if (current) {
      const itemBox = current.getBoundingClientRect();
      const listBox = content.getBoundingClientRect();
      content.scrollTop += itemBox.top - listBox.top - listBox.height / 2;
    }
  }

  function selectTab(selected) {
    for (const { button, content } of entries) {
      const active = button === selected;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      content.hidden = !active;
    }
    revealCurrent();
  }

  if (toc) addTab("toc", panel.dataset.tocLabel, [toc]);
  if (series.length) addTab("series", panel.dataset.seriesLabel, series);
  if (!entries.length) return;
  selectTab(entries[0].button);
  trigger.textContent = entries
    .map(({ button }) => button.textContent)
    .join(" · ");

  tabs.addEventListener("keydown", (event) => {
    const index = entries.findIndex(
      ({ button }) => button === document.activeElement,
    );
    if (index < 0) return;
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % entries.length;
    if (event.key === "ArrowLeft")
      next = (index + entries.length - 1) % entries.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = entries.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectTab(entries[next].button);
    entries[next].button.focus();
  });

  // Move one panel between the desktop rail and the native modal dialog.
  trigger.addEventListener("click", () => {
    dialog.append(panel);
    dialog.showModal();
    document.documentElement.classList.add("reading-modal-open");
    revealCurrent();
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("reading-modal-open");
    rail.append(panel);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientY < rect.top ||
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  panel.addEventListener("click", (event) => {
    if (event.target.closest("a[href]") && dialog.open) dialog.close();
  });
  function updateVisibility() {
    // Match top-link's one-screen threshold and wait until the inline navigation has passed.
    const pastIntroduction =
      window.scrollY > window.innerHeight &&
      source.getBoundingClientRect().bottom < 0;
    rail.hidden = !wide.matches || !pastIntroduction;
    trigger.hidden = wide.matches;
  }

  function updateLayout() {
    if (dialog.open) dialog.close();
    updateVisibility();
  }
  wide.addEventListener("change", updateLayout);
  updateLayout();

  // Track the heading nearest the top of the reading area.
  const links = [...panel.querySelectorAll('#reading-toc a[href^="#"]')];
  const headings = links
    .map((link) => {
      let id;
      try {
        id = decodeURIComponent(link.hash.slice(1));
      } catch {
        return null;
      }
      const heading = document.getElementById(id);
      return heading ? { link, heading } : null;
    })
    .filter(Boolean);
  let pending = false;
  let activeLink;
  function updateReadingPosition() {
    pending = false;
    updateVisibility();
    let active = headings[0];
    for (const item of headings) {
      if (item.heading.getBoundingClientRect().top > 120) break;
      active = item;
    }
    if (!active || active.link === activeLink) return;
    activeLink?.removeAttribute("aria-current");
    activeLink = active.link;
    activeLink.setAttribute("aria-current", "location");
    const content = activeLink.closest(".reading-list");
    if (wide.matches && !content.hidden) {
      const itemBox = activeLink.getBoundingClientRect();
      const listBox = content.getBoundingClientRect();
      if (itemBox.top < listBox.top || itemBox.bottom > listBox.bottom)
        revealCurrent();
    }
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateReadingPosition);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateReadingPosition);
  updateReadingPosition();
})();
