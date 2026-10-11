(() => {
  const inlineNavigation = document.querySelector(".article-navigation-source");
  const desktopRail = document.querySelector(".reading-rail");
  if (!inlineNavigation || !desktopRail) return;

  const mobileTrigger = document.querySelector(".reading-trigger");
  const dialog = document.querySelector(".reading-dialog");
  const headingOffset = 120;
  const panels = [desktopRail, dialog];
  let activeHeading;
  let updateScheduled = false;

  // Hugo renders both panels. Tab names synchronize selection across layouts.
  function selectTab(name) {
    for (const panel of panels) {
      for (const button of panel.querySelectorAll('[role="tab"]')) {
        const selected = button.dataset.tab === name;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        document.getElementById(button.getAttribute("aria-controls")).hidden =
          !selected;
      }
      revealCurrentItem(panel);
    }
  }

  function revealCurrentItem(panel) {
    const list = panel.querySelector(".reading-list:not([hidden])");
    const item = list.querySelector("[aria-current]");
    if (!item) return;
    const itemBounds = item.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    list.scrollTop += itemBounds.top - listBounds.top - listBounds.height / 2;
  }

  function handleTabClick(event) {
    const button = event.target.closest('[role="tab"]');
    if (button) selectTab(button.dataset.tab);
  }

  function handleTabKeydown(event) {
    const buttons = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    let nextIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % buttons.length;
        break;
      case "ArrowLeft":
        nextIndex = (index + buttons.length - 1) % buttons.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(buttons[nextIndex].dataset.tab);
    buttons[nextIndex].focus();
  }

  // The dialog owns its content permanently; opening it only changes visibility.
  function openDialog() {
    dialog.showModal();
    document.documentElement.classList.add("reading-modal-open");
    revealCurrentItem(dialog);
  }

  function handleDialogClose() {
    document.documentElement.classList.remove("reading-modal-open");
    updateReadingPosition();
  }

  function handleDialogClick(event) {
    if (event.target.closest("a[href]")) {
      dialog.close();
      return;
    }
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const insideDialog =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    if (!insideDialog) dialog.close();
  }

  // Wait until the reader has passed both the first screen and inline navigation.
  function updateVisibility() {
    const pastIntroduction =
      window.scrollY > window.innerHeight &&
      inlineNavigation.getBoundingClientRect().bottom < 0;
    desktopRail.hidden = !pastIntroduction;
    mobileTrigger.hidden = !pastIntroduction;
  }

  // Group both panels' links by their target heading to keep highlights in sync.
  function collectHeadings() {
    const headings = new Map();
    for (const link of document.querySelectorAll(
      '.reading-list[id$="-toc"] a[href^="#"]',
    )) {
      let heading;
      try {
        heading = document.getElementById(
          decodeURIComponent(link.hash.slice(1)),
        );
      } catch {
        continue;
      }
      if (!heading) continue;
      if (!headings.has(heading)) headings.set(heading, { heading, links: [] });
      headings.get(heading).links.push(link);
    }
    return [...headings.values()];
  }

  function updateActiveHeading() {
    let currentHeading = headings[0];
    for (const entry of headings) {
      if (entry.heading.getBoundingClientRect().top > headingOffset) break;
      currentHeading = entry;
    }
    if (!currentHeading || currentHeading === activeHeading) return;
    for (const link of activeHeading?.links ?? [])
      link.removeAttribute("aria-current");
    for (const link of currentHeading.links)
      link.setAttribute("aria-current", "location");
    activeHeading = currentHeading;
  }

  function keepActiveHeadingVisible() {
    if (!desktopRail.getClientRects().length) return;
    const list = desktopRail.querySelector(".reading-list:not([hidden])");
    const item = list.querySelector('[aria-current="location"]');
    if (!item) return;
    const itemBounds = item.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (
      itemBounds.top < listBounds.top ||
      itemBounds.bottom > listBounds.bottom
    ) {
      revealCurrentItem(desktopRail);
    }
  }

  function updateReadingPosition() {
    updateScheduled = false;
    if (dialog.open) {
      // CSS hides the dialog in wide layouts; close it to release focus and scroll lock.
      if (getComputedStyle(dialog).display !== "none") return;
      dialog.close();
    }
    updateVisibility();
    updateActiveHeading();
    keepActiveHeadingVisible();
  }

  function scheduleReadingUpdate() {
    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(updateReadingPosition);
  }

  const headings = collectHeadings();
  for (const panel of panels) {
    const tabList = panel.querySelector(".reading-tabs");
    tabList.addEventListener("click", handleTabClick);
    tabList.addEventListener("keydown", handleTabKeydown);
  }
  mobileTrigger.addEventListener("click", openDialog);
  dialog.addEventListener("close", handleDialogClose);
  dialog.addEventListener("click", handleDialogClick);
  window.addEventListener("scroll", scheduleReadingUpdate, { passive: true });
  window.addEventListener("resize", scheduleReadingUpdate);
  updateReadingPosition();
})();
