(() => {
  // Canvas 09 — Sound Garden engagement poll, restyled for the flower site.
  const root = document.getElementById("sound-garden");
  if (!root) return;

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  const moods = [
    { id: "happy", label: "Happy", color: "#ffd640" },
    { id: "calm", label: "Calm", color: "#20e7ff" },
    { id: "sad", label: "Sad", color: "#7a4dff" },
    { id: "anxious", label: "Anxious", color: "#ffb0e8" },
    { id: "hopeful", label: "Hopeful", color: "#ff9adf" }
  ];

  const demoSubmissions = [
    { mood: "hopeful", songTitle: "Here Comes the Sun", createdAt: 1 },
    { mood: "calm", songTitle: "Dreams", createdAt: 2 },
    { mood: "happy", songTitle: "Dancing Queen", createdAt: 3 },
    { mood: "sad", songTitle: "Blue", createdAt: 4 },
    { mood: "anxious", songTitle: "Running Up That Hill", createdAt: 5 },
    { mood: "hopeful", songTitle: "Heroes", createdAt: 6 },
    { mood: "calm", songTitle: "Space Song", createdAt: 7 }
  ];

  const moodOptions = root.querySelector("#sg-moodOptions");
  const resultsList = root.querySelector("#sg-resultsList");
  const totalVotes = root.querySelector("#sg-totalVotes");
  const garden = root.querySelector("#sg-garden");
  const emptyGarden = root.querySelector("#sg-emptyGarden");
  const pollForm = root.querySelector("#sg-pollForm");
  const songTitleInput = root.querySelector("#sg-songTitle");
  const formMessage = root.querySelector("#sg-formMessage");
  const connectionStatus = root.querySelector("#sg-connectionStatus");
  const statusDot = root.querySelector(".sg-status-dot");
  const flowerTemplate = root.querySelector("#sg-flowerTemplate");
  const submitButton = pollForm.querySelector('button[type="submit"]');

  let database = null;
  let isFirebaseConnected = false;
  let submissions = [];

  function hasRealFirebaseConfig() {
    return (
      firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.startsWith("YOUR_") &&
      firebaseConfig.databaseURL &&
      !firebaseConfig.databaseURL.includes("YOUR_PROJECT")
    );
  }

  function createMoodControls() {
    moods.forEach((mood, index) => {
      const label = document.createElement("label");
      label.className = "sg-mood-option";
      label.style.setProperty("--mood-color", mood.color);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "sg-mood";
      input.value = mood.id;
      input.required = true;
      if (index === 0) input.checked = true;

      const text = document.createElement("span");
      text.textContent = mood.label;

      label.append(input, text);
      moodOptions.append(label);
    });
  }

  function createResultRows() {
    moods.forEach((mood) => {
      const row = document.createElement("div");
      row.className = "sg-result-row";
      row.dataset.mood = mood.id;
      row.style.setProperty("--mood-color", mood.color);
      row.innerHTML = `
        <span>${mood.label}</span>
        <strong class="sg-result-value">0%</strong>
        <div class="sg-result-track" aria-hidden="true">
          <div class="sg-result-fill"></div>
        </div>
      `;
      resultsList.append(row);
    });
  }

  function getStoredDemoSubmissions() {
    try {
      const stored = JSON.parse(localStorage.getItem("soundGardenSubmissions") || "null");
      return Array.isArray(stored) ? stored : demoSubmissions;
    } catch {
      return demoSubmissions;
    }
  }

  function saveDemoSubmissions() {
    localStorage.setItem("soundGardenSubmissions", JSON.stringify(submissions));
  }

  function updateResults() {
    const counts = Object.fromEntries(moods.map((mood) => [mood.id, 0]));
    submissions.forEach((submission) => {
      if (counts[submission.mood] !== undefined) counts[submission.mood] += 1;
    });
    totalVotes.textContent = submissions.length;

    moods.forEach((mood) => {
      const percentage = submissions.length
        ? Math.round((counts[mood.id] / submissions.length) * 100)
        : 0;
      const row = resultsList.querySelector(`[data-mood="${mood.id}"]`);
      row.querySelector(".sg-result-value").textContent = `${percentage}%`;
      row.querySelector(".sg-result-fill").style.width = `${percentage}%`;
    });
  }

  function flowerHeight(index, submission) {
    const titleValue = [...submission.songTitle].reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    );
    return 125 + ((titleValue + index * 23) % 125);
  }

  function renderGarden() {
    garden.querySelectorAll(".sg-flower").forEach((flower) => flower.remove());
    emptyGarden.hidden = submissions.length > 0;

    submissions.slice(-18).forEach((submission, index) => {
      const mood = moods.find((item) => item.id === submission.mood) || moods[0];
      const flower = flowerTemplate.content.firstElementChild.cloneNode(true);
      flower.style.setProperty("--flower-color", mood.color);
      flower.style.setProperty("--flower-height", `${flowerHeight(index, submission)}px`);
      flower.style.animationDelay = `${Math.min(index * 45, 500)}ms`;
      flower.setAttribute(
        "aria-label",
        `${submission.songTitle}, planted for a ${mood.label.toLowerCase()} mood`
      );
      flower.querySelector(".sg-song-tooltip").textContent = submission.songTitle;
      flower.addEventListener("click", () => flower.classList.toggle("is-open"));
      garden.insertBefore(flower, garden.querySelector(".sg-ground"));
    });
  }

  function render() {
    updateResults();
    renderGarden();
  }

  function setConnectionState(connected, label) {
    isFirebaseConnected = connected;
    connectionStatus.textContent = label;
    statusDot.classList.toggle("connected", connected);
  }

  function connectFirebase() {
    if (!hasRealFirebaseConfig() || typeof firebase === "undefined") {
      submissions = getStoredDemoSubmissions();
      setConnectionState(false, "Demo garden");
      render();
      return;
    }

    try {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();

      database.ref(".info/connected").on("value", (snapshot) => {
        setConnectionState(snapshot.val() === true, snapshot.val() ? "Live garden" : "Connecting");
      });

      database.ref("soundGarden/submissions").on(
        "value",
        (snapshot) => {
          const value = snapshot.val() || {};
          submissions = Object.values(value);
          render();
        },
        () => {
          submissions = getStoredDemoSubmissions();
          setConnectionState(false, "Firebase permission error");
          render();
        }
      );
    } catch (error) {
      console.error("Firebase setup error:", error);
      submissions = getStoredDemoSubmissions();
      setConnectionState(false, "Firebase setup needed");
      render();
    }
  }

  async function submitSong(event) {
    event.preventDefault();

    const formData = new FormData(pollForm);
    const mood = formData.get("sg-mood");
    const songTitle = songTitleInput.value.trim().replace(/\s+/g, " ");

    if (!mood || !songTitle) {
      formMessage.textContent = "Choose a mood and enter a song title.";
      return;
    }

    const submission = {
      mood,
      songTitle: songTitle.slice(0, 80),
      createdAt: isFirebaseConnected
        ? firebase.database.ServerValue.TIMESTAMP
        : Date.now()
    };

    submitButton.disabled = true;
    formMessage.textContent = "Planting your song…";

    try {
      if (isFirebaseConnected && database) {
        await database.ref("soundGarden/submissions").push(submission);
      } else {
        submissions.push(submission);
        saveDemoSubmissions();
        render();
      }

      songTitleInput.value = "";
      formMessage.textContent = "Your song is now growing in the garden.";
      garden.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      console.error("Could not save submission:", error);
      formMessage.textContent = "The song could not be planted. Please try again.";
    } finally {
      submitButton.disabled = false;
    }
  }

  createMoodControls();
  createResultRows();
  pollForm.addEventListener("submit", submitSong);
  connectFirebase();
})();
