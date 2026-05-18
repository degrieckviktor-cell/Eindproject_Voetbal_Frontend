let cachedMatches = [];
function isAdmin() {
  return localStorage.getItem("adminKey") === "footballintel_admin_2026";
}

function getTeamName(id) {
  return teams.find(t => t.id === id)?.name || "Unknown";
}
const originalFetch = window.fetch;

// ================================
// API INTERCEPT
// ================================
window.fetch = function (...args) {
  return originalFetch(...args).then(response => {
    if (args[0].includes("/api/match")) {
      response.clone().json().then(data => {
        cachedMatches = data;
      });
    }
    return response;
  });
};

// ================================
// POPUPS
// ================================
let currentId = null;

function deleteMatchById(id) {
  if (!confirm("Weet je zeker dat je deze match wilt verwijderen?")) return;

  fetch(`http://localhost:5153/api/match/${id}`, {
    method: "DELETE"
  }).then(() => location.reload());
}

function openEdit(id) {
  currentId = id;
  const match = cachedMatches.find(m => m.matchId === id);

  if (!match) return;

  document.getElementById("edit-date").value =
    match.matchDate.split("T")[0];

  document.getElementById("edit-home-score").value =
    match.homeScore;

  document.getElementById("edit-away-score").value =
    match.awayScore;

  document.getElementById("edit-popup").style.display = "flex";
}

function saveEdit() {
  const match = cachedMatches.find(m => m.matchId === currentId);
  if (!match) return;

  fetch(`http://localhost:5153/api/match/${currentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      matchId: currentId,
      matchDate: document.getElementById("edit-date").value,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeScore: parseInt(document.getElementById("edit-home-score").value),
      awayScore: parseInt(document.getElementById("edit-away-score").value)
    })
  }).then(() => location.reload());
}

function closeEdit() {
  document.getElementById("edit-popup").style.display = "none";
}

function addMatch() {
  document.getElementById("match-popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("match-popup").style.display = "none";
}

// ================================
// MATCH RENDERING
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("matches-list");
  if (!container) return;

  const admin = localStorage.getItem("adminKey") === "footballintel_admin_2026";

  Promise.all([
    fetch("http://localhost:5153/api/match").then(r => r.json()),
    fetch("http://localhost:5153/api/Team").then(r => r.json())
  ])
  .then(([matches, teams]) => {
    cachedMatches = matches;

    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.teamId] = team.name;
    });

    matches.forEach(match => {
      const div = document.createElement("div");
      div.classList.add("match");
      div.innerHTML = `
        <div class="match-content">
          <div class="match-teams">
            ${teamMap[match.homeTeamId] ?? "Onbekend"} vs ${teamMap[match.awayTeamId] ?? "Onbekend"}
          </div>
          <div class="match-score">Score: <strong>${match.homeScore} - ${match.awayScore}</strong></div>
          <div class="match-date">📅 ${new Date(match.matchDate).toLocaleDateString('nl-NL')}</div>
        </div>
        ${admin ? `
          <div class="match-actions">
            <button onclick="deleteMatchById(${match.matchId})">🗑️</button>
            <button onclick="openEdit(${match.matchId})">✏️</button>
          </div>
        ` : ""}
      `;
      container.appendChild(div);
    });
  })
  .catch(error => {
    console.error("Fout bij ophalen data:", error);
    container.innerHTML = "<p>Kon data niet laden.</p>";
  });
});

// ================================
// DARK MODE
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const lightCSS = 'Style.css';
  const darkCSS = 'styledark.css';

  const link = document.getElementById('theme-stylesheet');
  const button = document.getElementById('theme-toggle');

  if (!link || !button) return;

  button.addEventListener('click', () => {
    const isDark = link.getAttribute('href') === darkCSS;

    link.setAttribute('href', isDark ? lightCSS : darkCSS);
    button.textContent = isDark ? '☀️' : '🌙';

    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  if (localStorage.getItem('theme') === 'dark') {
    link.setAttribute('href', darkCSS);
    button.textContent = '🌙';
  }
});

function logoutAdmin() {
  localStorage.removeItem("adminKey");
  localStorage.removeItem("adminEmail");

  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("add-match-btn");

  const isAdmin =
    localStorage.getItem("adminKey") === "footballintel_admin_2026";

  if (btn) {
    btn.style.display = isAdmin ? "inline-block" : "none";
  }
});