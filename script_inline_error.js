// ===============================
// Belts with names + colors
// ===============================
const belts = [
  { name: "White Belt", color: "#ffffff" },
  { name: "Blue Belt", color: "#1E3A8A" },
  { name: "Purple Belt", color: "#800080" },
  { name: "Brown Belt", color: "#8B4513" },
  { name: "Black Belt", color: "#000000" }
];

// ===============================
// Button position updater
// ===============================
function updateButtonPosition() {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  const wrapper = document.getElementById("addTaskWrapper");

  if (saved.length > 0) {
    wrapper.classList.add("moved");   // move to corner
  } else {
    wrapper.classList.remove("moved"); // center
  }
}

// ===============================
// Load tasks from localStorage
// ===============================
function loadTasks(filter = "all") {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskContainer = document.getElementById("taskContainer");
  taskContainer.innerHTML = "";

  saved
    .filter(task => filter === "all" || task.status === filter)
    .forEach(task => createTaskCard(task.name, task.progress || 0));

  updateButtonPosition();
}

// ===============================
// Save a new task
// ===============================

// ===============================
// Prevent duplicate quest/task names
// ===============================
function taskExistsByName(name) {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  const target = (name || "").trim().toLowerCase();
  return saved.some(t => (t.name || "").trim().toLowerCase() === target);
}

function saveTask(name, progress) {
  // Prevent duplicate names (case-insensitive, trimmed)
  if (taskExistsByName(name)) {
    return false; // indicate duplicate
  }
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const status = progress >= 100 ? "completed" : "pending";
  tasks.push({ name, progress, status });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  return true;
}

// ===============================
// Update belt progress for a task
// ===============================
function updateTask(name, progress) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.name === name);
  if (task) {
    task.progress = progress;
    task.status = progress >= 100 ? "completed" : "pending";
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


// ===============================
// Delete a task
// ===============================
function deleteTask(name) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(t => t.name !== name);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  updateButtonPosition();
}

// ===============================
// Create the card element
// ===============================
function createTaskCard(taskName, progress = 0) {
  const taskContainer = document.getElementById("taskContainer");

  const card = document.createElement("div");
  card.classList.add("task-card");

  // Title
  const cardTitle = document.createElement("h3");
  cardTitle.textContent = taskName;

  // Progress bar (slider)
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 100;
  slider.value = progress;   // <-- use the exact saved progress
  slider.classList.add("belt-slider");

  // Belt label
  const beltLabel = document.createElement("div");
  const updateLabel = (val) => {
    const percent = parseInt(val, 10);
    const stepSize = 100 / (belts.length - 1);
    const beltIndex = Math.min(
      belts.length - 1,
      Math.floor(percent / stepSize)
    );

    beltLabel.textContent = `${belts[beltIndex].name} – ${percent}%`;
    beltLabel.style.color = belts[beltIndex].color;

    updateTask(taskName, percent); // save exact % back
  };

  // Initialize label correctly on load
  updateLabel(progress);

  // Update when slider moves
  slider.addEventListener("input", () => updateLabel(slider.value));

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "⚔️";
  delBtn.classList.add("delete-btn");

  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    card.remove();
    deleteTask(taskName);
  });

  // Build card
  card.appendChild(cardTitle);
  card.appendChild(slider);
  card.appendChild(beltLabel);
  card.appendChild(delBtn);
  taskContainer.appendChild(card);
}


// ===============================
// Add new task button
// ===============================

// ===============================
// On page load
// ===============================
window.addEventListener("load", () => {
  loadTasks();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadTasks(btn.dataset.filter);
  });
});

// --- Robust help / popup wiring (add near bottom of script.js) ---
(function () {
  const popup = document.getElementById('welcomePopup'); // your popup overlay
  const closeBtn = document.getElementById('closePopup'); // button inside popup
  const dontShowBtn = document.getElementById('dontShowPopup'); // optional second button
  const helpBtn = document.getElementById('helpBtn');

  if (!popup) return; // nothing to do if popup markup missing

  function showPopup() {
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    // focus first focusable element
    if (closeBtn) closeBtn.focus();
  }

  function hidePopup(markVisited = true) {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    if (markVisited) localStorage.setItem('hasVisited', 'true');
  }

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', () => hidePopup(true));
  if (dontShowBtn) dontShowBtn.addEventListener('click', () => hidePopup(true));

  // Clicking overlay (outside content) closes popup
  popup.addEventListener('click', (e) => {
    if (e.target === popup) hidePopup(true);
  });

  // Escape key closes popup
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) hidePopup(true);
  });

  // Help button opens popup (works anytime)
  if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPopup();
    });
  }

  // Show on first visit (if not suppressed)
  window.addEventListener('load', () => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(showPopup, 250); // small delay so layout settles
    }
  });
})();


// Add new task button logic
document.getElementById("addTaskBtn").addEventListener("click", () => {
  document.getElementById("taskPopup").classList.add("active");
});

// Handle save & cancel inside popup
document.getElementById("saveTaskBtn").addEventListener("click", () => {
  const taskName = document.getElementById("taskNameInput").value.trim();
  if (!taskName) {
    return;
  }
  // Check duplicate BEFORE creating the card
  if (taskExistsByName(taskName)) {
    const errorBox = document.getElementById("taskError");
  if (errorBox) {
    errorBox.textContent = "A quest with this name already exists 💀💀!";
    errorBox.style.display = "block";
  }
  return;
  }
  // Save first; only render if saved successfully
  const ok = saveTask(taskName, 0);
  if (ok) {
    createTaskCard(taskName, 0);
    updateButtonPosition();
  }
  // Reset & close
  document.getElementById("taskNameInput").value = "";
  const errorBox = document.getElementById("taskError");
  if (errorBox) errorBox.style.display = "none";
  document.getElementById("taskPopup").classList.remove("active");
});

document.getElementById("cancelTaskBtn").addEventListener("click", () => {
  document.getElementById("taskNameInput").value = "";
  document.getElementById("taskPopup").classList.remove("active");
});

// ===============================
// Background Music Controls
// ===============================
document.addEventListener("DOMContentLoaded", () => {
const bgMusic = document.getElementById("bgMusic");
const volumeControl = document.getElementById("volumeControl");


if (!bgMusic) {
console.error("bgMusic element not found");
return;
}


// Set default volume
bgMusic.volume = volumeControl ? volumeControl.value : 0.5;


// Volume slider control
if (volumeControl) {
volumeControl.addEventListener("input", () => {
bgMusic.volume = volumeControl.value;
});
}


// Autoplay workaround – play after first click anywhere
const unlockAudio = () => {
bgMusic.play().catch(err => {
console.log("Autoplay blocked:", err);
});
document.removeEventListener("click", unlockAudio);
};
document.addEventListener("click", unlockAudio);
});