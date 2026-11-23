(() => {
  const tab = document.querySelector(".guestbook-tab");
  const dialog = document.getElementById("guestbook");
  const form = dialog.querySelector(".guestbook-form");
  const note = dialog.querySelector("#guestbook-note");
  const canvas = dialog.querySelector(".guestbook-canvas");
  const status = dialog.querySelector(".guestbook-status");
  const entriesList = dialog.querySelector(".guestbook-entries");
  const context = canvas.getContext("2d");
  const publishButton = form.querySelector('button[type="submit"]');
  const moreButton = dialog.querySelector(".guestbook-more");
  const endpoint = "https://michelle-nuccio-guestbook.nucciomichelle99.chatgpt.site/entries";
  let nextBefore = null;
  let loading = false;
  let posting = false;
  let stroke;
  let hasDrawing = false;

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
      const response = await fetch(url);
      if (!response.ok) throw new Error("Public entries could not be loaded.");
      const { entries, nextBefore: nextPage } = await response.json();
      const items = entries.map(entryElement);
      if (before !== null) entriesList.append(...items);
      else entriesList.replaceChildren(...items);
      nextBefore = nextPage;
      moreButton.hidden = nextBefore === null;
    } catch {
      status.textContent = "Public entries could not be loaded.";
    } finally {
      loading = false;
      moreButton.disabled = false;
      if (before === null) publishButton.disabled = false;
    }
  }

  tab.addEventListener("click", () => {
    dialog.showModal();
    status.textContent = "Saved notes and drawings are public.";
    loadEntries();
  });
  moreButton.addEventListener("click", () => loadEntries(nextBefore));

  function clearDrawing() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawing = false;
  }

  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    const { x, y } = point(event);
    canvas.setPointerCapture(event.pointerId);
    stroke = { id: event.pointerId, x, y };
    context.fillStyle = "#080808";
    context.beginPath();
    context.arc(x, y, 1.25, 0, Math.PI * 2);
    context.fill();
    hasDrawing = true;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== stroke?.id) return;
    const { x, y } = point(event);
    context.strokeStyle = "#080808";
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(stroke.x, stroke.y);
    context.lineTo(x, y);
    context.stroke();
    stroke = { id: event.pointerId, x, y };
  });

  canvas.addEventListener("lostpointercapture", () => { stroke = undefined; });
  dialog.querySelector("[data-clear-drawing]").addEventListener("click", clearDrawing);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (publishButton.disabled) return;
    const text = note.value.trim();
    if (!text && !hasDrawing) {
      status.textContent = "Write a note or draw something before posting.";
      return;
    }

    posting = true;
    publishButton.disabled = true;
    status.textContent = "Posting…";
    const entry = { note: text, drawing: hasDrawing ? canvas.toDataURL() : "" };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "This entry could not be posted.");
      entriesList.prepend(entryElement(result));
      note.value = "";
      clearDrawing();
      status.textContent = "Posted to the public guestbook.";
    } catch (error) {
      status.textContent = error.message || "This entry could not be posted.";
    } finally {
      posting = false;
      publishButton.disabled = false;
    }
  });
})();
