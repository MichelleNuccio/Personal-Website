const cvPage = document.querySelector(".cv-page");

const projectGallery = cvPage.querySelector(".project-gallery");
const projectCards = Array.from(projectGallery.querySelectorAll(".project-card"));

const projectDocuments = projectCards.map(card => card.querySelector(".project-document"));
const mobileLayout = window.matchMedia("(max-width: 700px)");
const workspace = cvPage.querySelector(".cv-workspace");
const timeline = workspace.querySelector(".cv-grid-section");
const portfolio = workspace.querySelector(".projects-panel");
const sectionButtons = cvPage.querySelectorAll(".mobile-section-nav button");
let mobileSection = "cv";

function positionProjectCards() {
  const scrollRange = projectGallery.scrollHeight - projectGallery.clientHeight;
  const progress = scrollRange > 0
    ? Math.min(1, Math.max(0, projectGallery.scrollTop / scrollRange))
    : 0;
  const activePosition = progress * (projectCards.length - 1);
  const stageHeight = projectGallery.clientHeight;
  const firstPlaneDistance = projectCards[0].offsetHeight * 0.5 + stageHeight * 0.04;
  const stackedPlaneGap = stageHeight * 0.046;

  projectCards.forEach((card, index) => {
    const offset = index - activePosition;
    const distance = Math.abs(offset);
    const preview = projectDocuments[index];
    const inactive = portfolio.inert || index !== Math.round(activePosition);
    if (preview && preview.inert !== inactive) preview.inert = inactive;
    const tilt = -Math.sign(offset) * Math.min(66, distance * 66);
    const spacing = Math.min(distance, 1) * firstPlaneDistance
      + Math.max(0, distance - 1) * stackedPlaneGap;
    const scale = 1 + offset * 0.055;
    card.style.setProperty("--card-y", `${Math.sign(offset) * spacing}px`);
    card.style.setProperty("--card-tilt", `${tilt}deg`);
    card.style.zIndex = String(100 - Math.round(distance * 10));
    card.style.setProperty("--card-scale", String(scale));
    card.style.setProperty("--card-shade", `${Math.min(7, distance * 2.5)}%`);
    card.style.visibility = "visible";
  });
}

projectGallery.addEventListener("scroll", positionProjectCards, { passive: true });
new ResizeObserver(positionProjectCards).observe(projectGallery);

function updateMobileLayout() {
  const enabled = mobileLayout.matches;
  cvPage.classList.toggle("has-mobile-cube", enabled);
  const showPortfolio = mobileSection === "portfolio";
  timeline.inert = enabled && showPortfolio;
  portfolio.inert = enabled && !showPortfolio;
  cvPage.dataset.section = mobileSection;
  sectionButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.section === mobileSection));
  });
  positionProjectCards();
}

function selectMobileSection(section) {
  if (section === mobileSection) return;
  const outgoing = mobileSection === "cv" ? timeline : portfolio;
  if (section === "portfolio") {
    cvPage.querySelectorAll(".event-dialog[open] .event-dialog-close").forEach(button => button.click());
  }
  if (outgoing.contains(document.activeElement)) {
    Array.from(sectionButtons).find(button => button.dataset.section === section).focus({ preventScroll: true });
  }
  mobileSection = section;
  updateMobileLayout();
}

sectionButtons.forEach(button => {
  button.addEventListener("click", () => selectMobileSection(button.dataset.section));
});

let swipeStart;
workspace.addEventListener("touchstart", event => {
  swipeStart = undefined;
  if (!mobileLayout.matches || event.touches.length !== 1 ||
      event.target.closest("canvas, video, input, select, textarea, .thesis-book-button")) return;
  const { identifier, clientX, clientY } = event.touches[0];
  const preview = mobileSection === "portfolio" ? event.target.closest(".project-document") : null;
  swipeStart = { identifier, clientX, clientY, preview, galleryScrollTop: projectGallery.scrollTop };
}, { passive: true });

workspace.addEventListener("touchmove", event => {
  const start = swipeStart;
  if (!start?.preview || !mobileLayout.matches || event.touches.length !== 1) return;
  const touch = event.touches[0];
  if (touch.identifier !== start.identifier) return;
  const dx = touch.clientX - start.clientX;
  const dy = start.clientY - touch.clientY;

  if (!start.scrollsGallery) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
    const atEdge = (scroller, direction) => direction < 0
      ? scroller.scrollTop <= 1
      : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if (Math.abs(dy) <= Math.abs(dx) || !event.cancelable ||
        !atEdge(start.preview, dy) || atEdge(projectGallery, dy)) {
      start.preview = null;
      return;
    }
    start.scrollsGallery = true;
  }

  if (event.cancelable) event.preventDefault();
  projectGallery.scrollTop = start.galleryScrollTop + dy;
}, { passive: false });

workspace.addEventListener("touchcancel", () => { swipeStart = undefined; }, { passive: true });
workspace.addEventListener("touchend", event => {
  if (!swipeStart || !mobileLayout.matches) return;
  const start = swipeStart;
  swipeStart = undefined;
  if (start.scrollsGallery) return;
  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.identifier);
  if (!touch) return;
  const dx = touch.clientX - start.clientX;
  const dy = touch.clientY - start.clientY;
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;

  if (event.cancelable) event.preventDefault();
  if (mobileSection === "cv") {
    if (dx < 0) selectMobileSection("portfolio");
  } else if (dx > 0) {
    selectMobileSection("cv");
  }
}, { passive: false });

mobileLayout.addEventListener("change", updateMobileLayout);
updateMobileLayout();

const thesisBook = projectGallery.querySelector(".thesis-book-button");
let bookYaw = 26;
let bookPitch = 10;
let bookDrag;

function rotateThesisBook(yaw, pitch = bookPitch) {
  bookYaw = yaw;
  bookPitch = Math.max(-30, Math.min(30, pitch));
  thesisBook.style.setProperty("--book-yaw", `${bookYaw}deg`);
  thesisBook.style.setProperty("--book-pitch", `${bookPitch}deg`);
}

thesisBook.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  bookDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: bookYaw, pitch: bookPitch };
  thesisBook.setPointerCapture(event.pointerId);
  thesisBook.classList.add("is-dragging");
});

thesisBook.addEventListener("pointermove", (event) => {
  if (event.pointerId !== bookDrag?.id) return;
  rotateThesisBook(
    bookDrag.yaw + (event.clientX - bookDrag.x) * 0.8,
    bookDrag.pitch - (event.clientY - bookDrag.y) * 0.3
  );
});

thesisBook.addEventListener("lostpointercapture", (event) => {
  if (event.pointerId !== bookDrag?.id) return;
  bookDrag = undefined;
  thesisBook.classList.remove("is-dragging");
});

thesisBook.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  rotateThesisBook(bookYaw + (event.key === "ArrowRight" ? 30 : -30));
});

thesisBook.addEventListener("click", (event) => {
  if (event.detail === 0) rotateThesisBook(bookYaw + 180);
});

const eventTriggerGroups = new Map();
document.querySelectorAll(".event-trigger").forEach((projectTrigger) => {
  const dialogId = projectTrigger.getAttribute("aria-controls");
  if (!eventTriggerGroups.has(dialogId)) {
    eventTriggerGroups.set(dialogId, {
      dialog: document.getElementById(dialogId),
      triggers: []
    });
  }
  eventTriggerGroups.get(dialogId).triggers.push(projectTrigger);
});

const triggerHighlights = new WeakMap();
eventTriggerGroups.forEach(({ dialog: projectDialog, triggers: projectTriggers }) => {
  const projectDialogClose = projectDialog.querySelector(".event-dialog-close");
  const groupTriggers = new Set(projectTriggers);
  projectTriggers.forEach((trigger) => {
    const top = parseFloat(trigger.style.getPropertyValue("--event-top"));
    const bottom = top + parseFloat(trigger.style.getPropertyValue("--event-height"));

    trigger.parentElement.querySelectorAll(".event-trigger:has(.event-trigger-symbol)").forEach((marked) => {
      const markedTop = parseFloat(marked.style.getPropertyValue("--event-top"));
      const markedBottom = markedTop + parseFloat(marked.style.getPropertyValue("--event-height"));
      if (markedTop >= top - 0.00001 && markedBottom <= bottom + 0.00001) {
        groupTriggers.add(marked);
      }
    });
  });

  function highlightGroup(active) {
    groupTriggers.forEach((trigger) => {
      if (!triggerHighlights.has(trigger)) triggerHighlights.set(trigger, new Set());
      const dialogs = triggerHighlights.get(trigger);
      if (active) dialogs.add(projectDialog);
      else dialogs.delete(projectDialog);
      trigger.classList.toggle("event-trigger-highlighted", dialogs.size > 0);
    });
  }

  let activeTrigger = projectTriggers[0];
  let projectDialogPinned = false;
  let projectDialogHideTimer = 0;
  let projectDialogOpenedByHover = false;
  let suppressProjectTriggerFocus = false;

  function positionProjectDialog() {
    const triggerBounds = activeTrigger.getBoundingClientRect();
    const dialogBounds = projectDialog.getBoundingClientRect();
    const padding = 16;
    const gap = 12;
    const left = Math.max(
      padding,
      Math.min(triggerBounds.left, window.innerWidth - dialogBounds.width - padding)
    );
    const belowTop = triggerBounds.bottom + gap;
    const top = belowTop + dialogBounds.height <= window.innerHeight - padding
      ? belowTop
      : Math.max(padding, triggerBounds.top - dialogBounds.height - gap);

    projectDialog.style.left = `${left}px`;
    projectDialog.style.top = `${top}px`;
  }

  function showProjectDialog(openedByHover = false, trigger = activeTrigger) {
    window.clearTimeout(projectDialogHideTimer);
    activeTrigger = trigger;
    projectDialogOpenedByHover = openedByHover;
    if (!projectDialog.open) {
      projectDialog.show();
    }
    positionProjectDialog();
    projectTriggers.forEach((projectTrigger) => {
      projectTrigger.setAttribute("aria-expanded", "true");
    });
    highlightGroup(true);
  }

  function closeProjectDialog() {
    window.clearTimeout(projectDialogHideTimer);
    projectDialogPinned = false;
    projectDialogOpenedByHover = false;
    suppressProjectTriggerFocus = true;
    if (projectDialog.open) {
      projectDialog.close();
    }
    projectTriggers.forEach((projectTrigger) => {
      projectTrigger.setAttribute("aria-expanded", "false");
    });
    highlightGroup(false);
    window.setTimeout(() => {
      suppressProjectTriggerFocus = false;
    }, 0);
  }

  function hideProjectDialog() {
    window.clearTimeout(projectDialogHideTimer);
    projectDialogHideTimer = window.setTimeout(() => {
      if (
        projectDialogPinned
        || projectTriggers.some((projectTrigger) => projectTrigger.matches(":hover"))
        || projectDialog.matches(":hover")
        || (
          !projectDialogOpenedByHover
          && (
            projectTriggers.includes(document.activeElement)
            || projectDialog.contains(document.activeElement)
          )
        )
      ) {
        return;
      }

      closeProjectDialog();
    }, 200);
  }

  projectTriggers.forEach((projectTrigger) => {
    projectTrigger.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        showProjectDialog(true, projectTrigger);
      }
    });
    projectTrigger.addEventListener("pointerleave", hideProjectDialog);
    projectTrigger.addEventListener("focus", () => {
      if (!suppressProjectTriggerFocus) {
        showProjectDialog(false, projectTrigger);
      }
    });
    projectTrigger.addEventListener("blur", (event) => {
      if (!projectTriggers.includes(event.relatedTarget) && !projectDialog.contains(event.relatedTarget)) {
        hideProjectDialog();
      }
    });
    projectTrigger.addEventListener("click", () => {
      projectDialogPinned = !projectDialogPinned;
      if (projectDialogPinned) {
        showProjectDialog(false, projectTrigger);
      } else {
        closeProjectDialog();
      }
    });
  });
  projectDialog.addEventListener("pointerenter", () => {
    window.clearTimeout(projectDialogHideTimer);
  });
  projectDialog.addEventListener("pointerleave", hideProjectDialog);
  projectDialog.addEventListener("focusin", () => {
    window.clearTimeout(projectDialogHideTimer);
  });
  projectDialog.addEventListener("focusout", (event) => {
    if (!projectTriggers.includes(event.relatedTarget) && !projectDialog.contains(event.relatedTarget)) {
      hideProjectDialog();
    }
  });
  projectDialog.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      projectDialogOpenedByHover = false;
    }
  });
  projectDialogClose.addEventListener("click", closeProjectDialog);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDialog.open) {
      event.preventDefault();
      closeProjectDialog();
    }
  });
});
