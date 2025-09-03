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
// Check for existing task by name (case-insensitive)
function taskExistsByName(name) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const target = (name || '').trim().toLowerCase();
  return tasks.some(t => ((t.name || '').trim().toLowerCase()) === target);
}

function saveTask(name, progress) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  // prevent duplicate task names
  if (taskExistsByName(name)) {
    return false;
  }
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
  return true;
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
  if (taskName) {
    // check duplicate first
    const errorBox = document.getElementById("taskError");
    if (taskExistsByName(taskName)) {
      if (errorBox) {
        errorBox.textContent = "A quest with this name already exists!";
        errorBox.style.display = "block";
      } else {
        alert("A quest with this name already exists!");
      }
    } else {
      const saved = saveTask(taskName, 0);
      if (saved) {
        createTaskCard(taskName, 0);
        updateButtonPosition();
        if (errorBox) errorBox.style.display = "none";
        // Reset & close
        document.getElementById("taskNameInput").value = "";
        document.getElementById("taskPopup").classList.remove("active");
      }
    }
  } else {
    // Reset & close even if name empty
    document.getElementById("taskNameInput").value = "";
    document.getElementById("taskPopup").classList.remove("active");
  }
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


// ===============================
// Mobile hamburger drawer helper
// ===============================
(function() {
  // Create hamburger button inside top-panel if it doesn't exist
  const topPanel = document.querySelector('.top-panel');
  if (!topPanel) return;

  // Only initialize drawer/hamburger on small screens to avoid desktop artifacts
  if (window.innerWidth > 768) return;

  // avoid duplicates
  if (!document.getElementById('menuToggle')) {
    const menuBtn = document.createElement('button');
    menuBtn.id = 'menuToggle';
    menuBtn.className = 'hamburger';
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.innerHTML = '&#9776;'; // hamburger icon
    // insert at the start of topPanel
    topPanel.insertBefore(menuBtn, topPanel.firstChild);

    // add centered mobile title 'BlackBelt' (mobile-only)
    if (!document.querySelector('.top-panel .mobile-title')) {
      const mt = document.createElement('div');
      mt.className = 'mobile-title';
      mt.textContent = 'BlackBelt';
      topPanel.appendChild(mt);
    }

  }

  // build drawer (only once)
  if (!document.getElementById('sideDrawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'sideDrawer';
    drawer.className = 'drawer';
    drawer.innerHTML = `
      <button id="closeDrawer" class="close-drawer" aria-label="Close menu">&times;</button>
      <div class="drawer-content">
        <!-- Filter buttons -->
        <button class="filter-btn" data-filter="all">All</button>
        <button class="filter-btn" data-filter="pending">Pending</button>
        <button class="filter-btn" data-filter="completed">Completed</button>
      </div>
      <!-- footer (volume + help will be moved here) -->
      <div class="drawer-footer" aria-hidden="false">
        <div class="drawer-volume-wrap"></div>
        <div class="drawer-help-wrap"></div>
      </div>
    `;
    document.body.appendChild(drawer);

    // After building drawer, move volume control into footer and clone desktop help button
    (function() {
      const sideDrawer = document.getElementById('sideDrawer');
      if (!sideDrawer) return;
      const footer = sideDrawer.querySelector('.drawer-footer');
      if (!footer) return;

      // move existing volume if present
      const existingVol = document.getElementById('drawerVolume');
      if (existingVol) {
        const volWrap = footer.querySelector('.drawer-volume-wrap');
        volWrap.appendChild(existingVol);
      } else {
        // try to clone main volumeControl if present
        const mainVol = document.getElementById('volumeControl');
        if (mainVol) {
          const cloneVol = mainVol.cloneNode(true);
          cloneVol.id = 'drawerVolume';
          footer.querySelector('.drawer-volume-wrap').appendChild(cloneVol);
          // wire clone to bgMusic if exists
          cloneVol.addEventListener('input', () => {
            if (typeof bgMusic !== 'undefined' && bgMusic) bgMusic.volume = cloneVol.value;
            const mainV = document.getElementById('volumeControl');
            if (mainV) mainV.value = cloneVol.value;
          });
        }
      }

      // clone desktop help button into footer
      const desktopHelp = document.querySelector('.top-panel .help-btn');
      const helpWrap = footer.querySelector('.drawer-help-wrap');
      if (desktopHelp) {
        const helpClone = desktopHelp.cloneNode(true);
        helpClone.id = 'drawerHelpClone';
        helpWrap.appendChild(helpClone);
        helpClone.addEventListener('click', () => {
          const popup = document.getElementById('welcomePopup');
          if (popup) popup.classList.add('active');
          sideDrawer.classList.remove('open');
        });
      } else {
        // fallback help
        const hb = document.createElement('button');
        hb.id = 'drawerHelpClone';
        hb.className = 'help-btn';
        hb.textContent = '?';
        helpWrap.appendChild(hb);
        hb.addEventListener('click', () => {
          const popup = document.getElementById('welcomePopup');
          if (popup) popup.classList.add('active');
          sideDrawer.classList.remove('open');
        });
      }

    })();


    // Wire open/close buttons
    const menuToggle = document.getElementById('menuToggle');
    const closeDrawer = document.getElementById('closeDrawer');
    const sideDrawer = document.getElementById('sideDrawer');

    menuToggle.addEventListener('click', () => {
      sideDrawer.classList.add('open');
      // focus the close button for accessibility
      closeDrawer.focus();
    });
    closeDrawer.addEventListener('click', () => {
      sideDrawer.classList.remove('open');
      menuToggle.focus();
    });

    // Wire filter buttons inside drawer to reuse existing loadTasks logic
    const drawerFilterButtons = sideDrawer.querySelectorAll('.filter-btn');
    drawerFilterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // remove active from all existing filter buttons (both top and drawer)
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // mark clicked as active
        btn.classList.add('active');
        // call existing loadTasks
        if (typeof loadTasks === 'function') {
          loadTasks(btn.dataset.filter);
        }
        // close drawer on selection for mobile UX
        sideDrawer.classList.remove('open');
      });
    });

    // Wire drawer help to trigger existing help popup if present
    const drawerHelp = document.getElementById('drawerHelp');
    if (drawerHelp) {
      drawerHelp.addEventListener('click', () => {
        // Try to open the help/welcome popup if it exists
        const popup = document.getElementById('welcomePopup');
        if (popup) {
          popup.classList.add('active');
        }
        sideDrawer.classList.remove('open');
      });
    }

    // Wire drawer volume to control bgMusic and sync with existing #volumeControl if present
    const drawerVolume = document.getElementById('drawerVolume');
    if (drawerVolume) {
      // set initial based on existing control or bgMusic
      const existingVol = document.getElementById('volumeControl');
      if (existingVol) drawerVolume.value = existingVol.value || 0.5;
      drawerVolume.addEventListener('input', () => {
        if (typeof bgMusic !== 'undefined' && bgMusic) {
          bgMusic.volume = drawerVolume.value;
        }
        const existingVol = document.getElementById('volumeControl');
        if (existingVol) existingVol.value = drawerVolume.value;
      });
    }
  }

  // Keep drawer and button behavior consistent on resize: if desktop view, ensure drawer closed
  window.addEventListener('resize', () => {
    const side = document.getElementById('sideDrawer');
    if (!side) return;
    if (window.innerWidth > 768) {
      side.classList.remove('open');
    }
  });
})();
