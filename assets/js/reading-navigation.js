(() => {
  const inlineNavigation = document.querySelector(".article-navigation-source");
  const desktopRail = document.querySelector(".reading-rail");
  if (!inlineNavigation || !desktopRail) return;

  const panel = desktopRail.querySelector(".reading-panel");
  const tabList = panel.querySelector(".reading-tabs");
  const mobileTrigger = document.querySelector(".reading-trigger");
  const dialog = document.querySelector(".reading-dialog");
  const desktopViewport = matchMedia("(min-width: 1360px)");
  const headingOffset = 120;
  const tabs = [];
  let selectedTab;
  let activeHeadingLink;
  let updateScheduled = false;

  // Reuse the inline links, removing IDs and shortcuts that must stay unique.
  function cloneNavigation(source) {
    const copy = source.cloneNode(true);
    const elements = [copy, ...copy.querySelectorAll("[id], [accesskey]")];
    for (const element of elements) {
      element.removeAttribute("id");
      element.removeAttribute("accesskey");
    }
    return copy;
  }

  function createTab(name, label, sources) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `reading-tab-${name}`;
    button.textContent = label;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `reading-${name}`);

    const content = document.createElement("div");
    content.id = `reading-${name}`;
    content.className = "reading-list";
    content.tabIndex = 0;
    content.setAttribute("role", "tabpanel");
    content.setAttribute("aria-labelledby", button.id);
    for (const source of sources) content.append(cloneNavigation(source));

    const tab = { button, content };
    button.addEventListener("click", () => selectTab(tab));
    tabList.append(button);
    panel.append(content);
    tabs.push(tab);
  }

  function revealCurrentItem() {
    const content = selectedTab.content;
    const currentItem = content.querySelector("[aria-current]");
    if (!currentItem) return;

    const itemBounds = currentItem.getBoundingClientRect();
    const listBounds = content.getBoundingClientRect();
    content.scrollTop += itemBounds.top - listBounds.top - listBounds.height / 2;
  }

  function selectTab(nextTab) {
    selectedTab = nextTab;
    for (const tab of tabs) {
      const selected = tab === nextTab;
      tab.button.setAttribute("aria-selected", String(selected));
      tab.button.tabIndex = selected ? 0 : -1;
      tab.content.hidden = !selected;
    }
    revealCurrentItem();
  }

  function handleTabKeydown(event) {
    const index = tabs.findIndex((tab) => tab.button === event.target);
    if (index < 0) return;

    let nextIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (index + tabs.length - 1) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(tabs[nextIndex]);
    selectedTab.button.focus();
  }

  // One panel moves between the desktop rail and the mobile dialog.
  function openDialog() {
    dialog.append(panel);
    dialog.showModal();
    document.documentElement.classList.add("reading-modal-open");
    revealCurrentItem();
  }

  function restoreDesktopPanel() {
    document.documentElement.classList.remove("reading-modal-open");
    desktopRail.append(panel);
    updateReadingPosition();
  }

  function handleBackdropClick(event) {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const insideDialog =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    if (!insideDialog) dialog.close();
  }

  function handleNavigationClick(event) {
    if (dialog.open && event.target.closest("a[href]")) dialog.close();
  }

  // Both layouts appear after one screen, once the inline navigation has passed.
  function updateVisibility() {
    const pastIntroduction =
      window.scrollY > window.innerHeight && inlineNavigation.getBoundingClientRect().bottom < 0;
    desktopRail.hidden = !desktopViewport.matches || !pastIntroduction;
    mobileTrigger.hidden = desktopViewport.matches || !pastIntroduction;
  }

  function handleViewportChange() {
    if (dialog.open) dialog.close();
    updateReadingPosition();
  }

  function findHeading(link) {
    try {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      return heading ? { link, heading } : null;
    } catch {
      return null; // Ignore malformed fragment identifiers.
    }
  }

  function updateActiveHeading() {
    let currentHeading = headings[0];
    for (const entry of headings) {
      if (entry.heading.getBoundingClientRect().top > headingOffset) break;
      currentHeading = entry;
    }
    if (!currentHeading || currentHeading.link === activeHeadingLink) return;
    activeHeadingLink?.removeAttribute("aria-current");
    activeHeadingLink = currentHeading.link;
    activeHeadingLink.setAttribute("aria-current", "location");
  }

  function keepActiveHeadingVisible() {
    if (
      !activeHeadingLink ||
      desktopRail.hidden ||
      !selectedTab.content.contains(activeHeadingLink)
    )
      return;
    const itemBounds = activeHeadingLink.getBoundingClientRect();
    const listBounds = selectedTab.content.getBoundingClientRect();
    if (itemBounds.top < listBounds.top || itemBounds.bottom > listBounds.bottom) {
      revealCurrentItem();
    }
  }

  function updateReadingPosition() {
    updateScheduled = false;
    // Leave the trigger stable while the modal locks the page.
    if (dialog.open) return;
    updateVisibility();
    updateActiveHeading();
    keepActiveHeadingVisible();
  }

  function scheduleReadingUpdate() {
    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(updateReadingPosition);
  }

  // Initialize tabs before resolving their heading links and binding page events.
  const inlineToc = inlineNavigation.querySelector(":scope > .toc .inner");
  const inlineSeries = inlineNavigation.querySelectorAll(".series-nav");
  if (inlineToc) createTab("toc", panel.dataset.tocLabel, [inlineToc]);
  if (inlineSeries.length) createTab("series", panel.dataset.seriesLabel, inlineSeries);
  if (!tabs.length) return;

  const headings = [...panel.querySelectorAll('#reading-toc a[href^="#"]')]
    .map(findHeading)
    .filter(Boolean);
  selectTab(tabs[0]);
  mobileTrigger.title = tabs.map((tab) => tab.button.textContent).join(" · ");

  tabList.addEventListener("keydown", handleTabKeydown);
  mobileTrigger.addEventListener("click", openDialog);
  dialog.addEventListener("close", restoreDesktopPanel);
  dialog.addEventListener("click", handleBackdropClick);
  panel.addEventListener("click", handleNavigationClick);
  desktopViewport.addEventListener("change", handleViewportChange);
  window.addEventListener("scroll", scheduleReadingUpdate, { passive: true });
  window.addEventListener("resize", scheduleReadingUpdate);
  updateReadingPosition();
})();
