let cachedMatches = [];
const originalFetch = window.fetch;

// API Intercept om data op te slaan voor gebruik in de UI
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
// EDIT POPUP
// ================================

let currentId = null;

function deleteMatchById(id) {
  if (!confirm("Weet je zeker dat je deze match wilt verwijderen?")) return;
  fetch(`http://localhost:5153/api/match/${id}`, { method: "DELETE" })
    .then(() => location.reload());
}

function openEdit(id) {
  currentId = id;
  const match = cachedMatches.find(m => m.matchId === id);
  document.getElementById("edit-date").value = match.matchDate.split("T")[0];
  document.getElementById("edit-home-score").value = match.homeScore;
  document.getElementById("edit-away-score").value = match.awayScore;
  document.getElementById("edit-popup").style.display = "flex";
}

function saveEdit() {
  const match = cachedMatches.find(m => m.matchId === currentId);
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

function closeEdit() { document.getElementById("edit-popup").style.display = "none"; }
function addMatch() { document.getElementById("match-popup").style.display = "flex"; }
function closePopup() { document.getElementById("match-popup").style.display = "none"; }

// ================================
// MATCH KAARTEN HERSTRUCTUREREN
// ================================

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const listContainer = document.getElementById("matches-list");
    const matchDivs = listContainer.querySelectorAll(".match");

    matchDivs.forEach((div, index) => {
      const match = cachedMatches[index];
      if (!match) return;

      div.innerHTML = `
        <div class="match-content">
          <div class="match-teams">${match.homeTeamName || 'Barcelona'} vs ${match.awayTeamName || 'Real Madrid'}</div>
          <div class="match-score">Score: <strong>${match.homeScore} - ${match.awayScore}</strong></div>
          <div class="match-date">📅 ${new Date(match.matchDate).toLocaleDateString('nl-NL')}</div>
        </div>
        <div class="match-actions">
          <button class="btn-delete" onclick="deleteMatchById(${match.matchId})" title="Verwijderen">🗑️</button>
          <button onclick="openEdit(${match.matchId})" title="Bewerken">✏️</button>
        </div>
      `;
    });
  }, 500);
});

// ================================
// DARK MODE TOGGLE
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const lightCSS = 'Style.css';
  const darkCSS  = 'styledark.css';

  const link   = document.getElementById('theme-stylesheet');
  const button = document.getElementById('theme-toggle');

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