(() => {
  // Canvas 10 — Garden Agent: OpenAI chatbot + optional Firebase message sync.
  // Persona stays inside the flower / kindness thesis of this project page.
  const root = document.getElementById("garden-agent");
  if (!root) return;

  // Paste your Firebase web config here (same project as Sound Garden is fine).
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Prefer secrets from garden-agent.local.js (gitignored). Fallback placeholder for public repo.
  const OPENAI_API_KEY =
    (window.GARDEN_AGENT_SECRETS && window.GARDEN_AGENT_SECRETS.openaiApiKey) ||
    "your-openai-api-key-here";
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const CHAT_PATH = "gardenAgent/messages";

  const SYSTEM_PROMPT = [
    "You are Garden Agent, the guide of Michelle's interactive flower website",
    "\"Those Flowers are for you <3\".",
    "You speak gently, poetically but clearly, about daisies (Bellis perennis), kindness,",
    "pollination, seasonal bloom, and the site's canvases:",
    "Signal Bloom, Night Garden, Data Bouquet, M'ama Non M'ama, Temporal Bloom,",
    "Relational Structures, Geospatial Bloom, Daisy Globe, and Sound Garden.",
    "Keep answers concise (2-5 short sentences). Encourage curiosity and care.",
    "If asked something unrelated, gently return to flowers, ecology, or the project."
  ].join(" ");

  const messagesEl = root.querySelector("#ga-messages");
  const inputEl = root.querySelector("#ga-input");
  const sendBtn = root.querySelector("#ga-send");
  const statusEl = root.querySelector("#ga-status");
  const connectionEl = root.querySelector("#ga-connection");

  let database = null;
  let firebaseReady = false;
  let localMessages = [];
  let lastApiCall = 0;
  const MIN_CALL_INTERVAL = 1000;
  let sending = false;

  function hasRealFirebaseConfig() {
    return (
      firebaseConfig.apiKey &&
      !String(firebaseConfig.apiKey).startsWith("YOUR_") &&
      firebaseConfig.databaseURL &&
      !String(firebaseConfig.databaseURL).includes("YOUR_PROJECT")
    );
  }

  function hasRealOpenAIKey() {
    return OPENAI_API_KEY && OPENAI_API_KEY !== "your-openai-api-key-here" && OPENAI_API_KEY.startsWith("sk-");
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setConnection(text, ok) {
    if (!connectionEl) return;
    connectionEl.textContent = text;
    connectionEl.classList.toggle("is-live", !!ok);
    connectionEl.classList.toggle("is-demo", !ok);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function renderMessages(messages) {
    const list = Array.isArray(messages)
      ? messages
      : Object.values(messages || {}).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    messagesEl.innerHTML = "";
    if (!list.length) {
      messagesEl.innerHTML = `
        <div class="ga-message ga-bot">
          <div class="ga-bubble">
            <strong>GARDEN AGENT</strong>
            <p>Hello. I am the guide of this flower field. Ask me about daisies, kindness, bloom seasons, or any canvas in the garden.</p>
          </div>
          <span class="ga-time">ready</span>
        </div>`;
      return;
    }

    list.forEach((message) => {
      const isUser = message.sender === "user";
      const row = document.createElement("div");
      row.className = `ga-message ${isUser ? "ga-user" : "ga-bot"}`;
      row.innerHTML = `
        <div class="ga-bubble">
          <strong>${isUser ? "YOU" : "GARDEN AGENT"}</strong>
          <p>${escapeHtml(message.text || "")}</p>
        </div>
        <span class="ga-time">${formatTime(message.timestamp || Date.now())}</span>`;
      messagesEl.appendChild(row);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function saveMessage(text, sender) {
    const message = { text, sender, timestamp: Date.now() };
    if (firebaseReady && database) {
      await database.ref(CHAT_PATH).push(message);
      return;
    }
    localMessages.push(message);
    try {
      localStorage.setItem("gardenAgentMessages", JSON.stringify(localMessages));
    } catch (_) {}
    renderMessages(localMessages);
  }

  async function getChatGPTResponse(userMessage) {
    if (!hasRealOpenAIKey()) {
      return [
        "I am almost awake, but my OpenAI key is not connected yet.",
        "Add your secret key in js/garden-agent.local.js, then ask me again.",
        "Until then: daisies bloom as small acts of kindness across the garden."
      ].join(" ");
    }

    const now = Date.now();
    const wait = MIN_CALL_INTERVAL - (now - lastApiCall);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastApiCall = Date.now();

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        max_tokens: 220,
        temperature: 0.75
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = data?.error?.message || `${response.status} ${response.statusText}`;
      throw new Error(err);
    }
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Unexpected OpenAI response");
    }
    return data.choices[0].message.content.trim();
  }

  async function sendMessage() {
    if (sending) return;
    const text = inputEl.value.trim();
    if (!text) return;

    sending = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "SENDING…";
    setStatus("Planting your message…");

    try {
      await saveMessage(text, "user");
      inputEl.value = "";
      setStatus("Garden Agent is thinking…");
      const reply = await getChatGPTResponse(text);
      await saveMessage(reply, "bot");
      setStatus("Ready");
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
      await saveMessage(`(system) ${error.message}`, "bot");
    } finally {
      sending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = "SEND";
      inputEl.focus();
    }
  }

  function connectFirebase() {
    if (!hasRealFirebaseConfig() || typeof firebase === "undefined") {
      try {
        localMessages = JSON.parse(localStorage.getItem("gardenAgentMessages") || "[]");
        if (!Array.isArray(localMessages)) localMessages = [];
      } catch (_) {
        localMessages = [];
      }
      setConnection("Demo mode · add Firebase config", false);
      renderMessages(localMessages);
      setStatus(hasRealOpenAIKey() ? "OpenAI ready · Firebase demo" : "Add OpenAI + Firebase keys");
      return;
    }

    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      database = firebase.database();
      firebaseReady = true;

      database.ref(".info/connected").on("value", (snap) => {
        setConnection(snap.val() ? "Live Firebase" : "Connecting…", !!snap.val());
      });

      database.ref(CHAT_PATH).on("value", (snap) => {
        renderMessages(snap.val() || {});
      });

      setStatus(hasRealOpenAIKey() ? "Ready" : "Firebase live · add OpenAI key");
    } catch (error) {
      console.error(error);
      setConnection("Firebase setup needed", false);
      renderMessages([]);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  connectFirebase();
  inputEl.focus();
})();
