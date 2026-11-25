(() => {
  const panel = document.getElementById("guestbook");
  const form = panel.querySelector(".guestbook-form");
  const note = panel.querySelector("#guestbook-note");
  const canvas = panel.querySelector(".guestbook-canvas");
  const status = panel.querySelector(".guestbook-status");
  const entriesList = panel.querySelector(".guestbook-entries");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const tools = Array.from(panel.querySelectorAll("[data-tool]"));
  const colour = panel.querySelector('input[type="color"]');
  const size = panel.querySelector("select");
  const undo = panel.querySelector("[data-undo-drawing]");
  const clear = panel.querySelector("[data-clear-drawing]");
  const publicSection = panel.querySelector(".guestbook-public");
  const emptyState = panel.querySelector(".guestbook-empty");
  const history = [];
  let activeTool = "pen";
  const publishButton = form.querySelector('button[type="submit"]');
  const moreButton = panel.querySelector(".guestbook-more");
  const endpoint = "https://michelle-nuccio-guestbook.nucciomichelle99.chatgpt.site/entries";
  let nextBefore = null;
  let loading = false;
  let posting = false;
  let stroke;

  function entryElement(entry) {
    const item = document.createElement("li");
    if (entry.note) {
      const text = document.createElement("p");
      text.textContent = entry.note;
      item.append(text);
    }
    if (entry.drawing?.startsWith("data:image/png;base64,")) {
      const image = document.createElement("img");
      image.src = entry.drawing;
      image.alt = "Guestbook doodle";
      image.loading = "lazy";
      image.decoding = "async";
      item.append(image);
    }
    return item;
  }

  async function loadEntries(before = null) {
    if (loading || (posting && before === null)) return;
    loading = true;
    moreButton.disabled = true;
    if (before === null) publishButton.disabled = true;
    const url = new URL(endpoint);
    if (before !== null) url.searchParams.set("before", before);

    try {
      const response = await fetch(url, { credentials: "omit" });
      if (!response.ok) throw new Error("Public entries could not be loaded.");
      const { entries, nextBefore: nextPage } = await response.json();
      const items = entries.map(entryElement);
      if (before !== null) entriesList.append(...items);
      else entriesList.replaceChildren(...items);
      nextBefore = nextPage;
      moreButton.hidden = nextBefore === null;
      emptyState.hidden = entriesList.children.length > 0;
    } catch {
      status.textContent = "Public entries could not be loaded.";
    } finally {
      loading = false;
      moreButton.disabled = false;
      if (before === null) publishButton.disabled = false;
    }
  }

  function refreshActivePanel() {
    if (panel.inert) return;
    status.textContent = "Notes and drawings are public.";
    loadEntries();
  }

  new MutationObserver(refreshActivePanel).observe(panel, { attributeFilter: ["inert"] });
  refreshActivePanel();
  moreButton.addEventListener("click", () => loadEntries(nextBefore));
  panel.querySelector(".guestbook-jump").addEventListener("click", () => {
    publicSection.querySelector("h3").focus({ preventScroll: true });
    panel.scrollTo({ top: publicSection.offsetTop - 12 });
  });

  tools.forEach((button) => {
    button.addEventListener("click", () => {
      activeTool = button.dataset.tool;
      tools.forEach((tool) => tool.setAttribute("aria-pressed", String(tool === button)));
    });
  });

  function rememberDrawing() {
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > 12) history.shift();
    undo.disabled = false;
  }

  function clearDrawing() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  undo.addEventListener("click", () => {
    if (posting || !history.length) return;
    context.putImageData(history.pop(), 0, 0);
    undo.disabled = history.length === 0;
  });

  clear.addEventListener("click", () => {
    if (posting) return;
    rememberDrawing();
    clearDrawing();
  });

  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (posting || !event.isPrimary || event.button !== 0) return;
    const { x, y } = point(event);
    rememberDrawing();
    canvas.setPointerCapture(event.pointerId);
    stroke = { id: event.pointerId, x, y };
    const erasing = activeTool === "eraser";
    context.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    context.strokeStyle = context.fillStyle = colour.value;
    context.lineWidth = Number(size.value) * (erasing ? 4 : 1);
    context.lineCap = "round";
    context.beginPath();
    context.arc(x, y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== stroke?.id) return;
    const { x, y } = point(event);
    context.beginPath();
    context.moveTo(stroke.x, stroke.y);
    context.lineTo(x, y);
    context.stroke();
    stroke = { id: event.pointerId, x, y };
  });

  canvas.addEventListener("lostpointercapture", () => { stroke = undefined; });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (publishButton.disabled) return;
    const text = note.value.trim();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasDrawing = pixels.some((value, index) => index % 4 === 3 && value !== 0);
    if (!text && !hasDrawing) {
      status.textContent = "Write a note or draw something before posting.";
      return;
    }

    posting = true;
    note.readOnly = true;
    stroke = undefined;
    publishButton.disabled = true;
    status.textContent = "Posting…";
    const entry = { note: text, drawing: hasDrawing ? canvas.toDataURL() : "" };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "This entry could not be posted.");
      entriesList.prepend(entryElement(result));
      emptyState.hidden = true;
      note.value = "";
      clearDrawing();
      history.length = 0;
      undo.disabled = true;
      status.textContent = "Posted to the public guestbook.";
    } catch (error) {
      status.textContent = error.message || "This entry could not be posted.";
    } finally {
      posting = false;
      note.readOnly = false;
      publishButton.disabled = false;
    }
  });
})();
