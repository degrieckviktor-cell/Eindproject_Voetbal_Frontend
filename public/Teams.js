// ================================
// DROPDOWN LOGIC
// ================================

function toggleDropdown(id) {
  const all = document.querySelectorAll('.dropdown');
  all.forEach(dd => {
    if (dd.id === id) {
      dd.classList.toggle('open');
    } else {
      dd.classList.remove('open');
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('open'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) closeAllDropdowns();
});

// ================================
// POPUP LOGIC
// ================================

function openAddTeamPopup()      { document.getElementById('team-popup').classList.add('active'); }
function openDeleteTeamPopup()   { document.getElementById('delete-team-popup').classList.add('active'); }
function openAddPlayerPopup()    { document.getElementById('player-popup').classList.add('active'); }
function openDeletePlayerPopup() { document.getElementById('delete-player-popup').classList.add('active'); }

function closePopups() {
  document.querySelectorAll('.popup').forEach(p => p.classList.remove('active'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popup').forEach(popup => {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) closePopups();
    });
  });
});

// ================================
// DARK MODE TOGGLE
// ================================

document.addEventListener('DOMContentLoaded', () => {
  const lightCSS = 'style.css';
  const darkCSS  = 'styledark.css';
  const link     = document.getElementById('theme-stylesheet');
  const button   = document.getElementById('theme-toggle');

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

// ================================
// TEAMS DATA
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("teams-list");

  Promise.all([
    fetch("http://localhost:5153/api/Team").then(r => r.json()),
    fetch("http://localhost:5153/api/Player").then(r => r.json()),
    fetch("http://localhost:5153/api/match").then(r => r.json())
  ])
  .then(([teams, players, matches]) => {

    const teamMap = {};
    teams.forEach(team => { teamMap[team.teamId] = team.name; });

    const playersByTeam = {};
    players.forEach(player => {
      if (!playersByTeam[player.teamId]) playersByTeam[player.teamId] = [];
      playersByTeam[player.teamId].push(player);
    });

    const matchesByTeam = {};
    teams.forEach(team => { matchesByTeam[team.teamId] = { played: [], upcoming: [] }; });

    const today = new Date();
    matches.forEach(match => {
      const isPast = new Date(match.matchDate) <= today;
      if (matchesByTeam[match.homeTeamId]) {
        isPast ? matchesByTeam[match.homeTeamId].played.push(match)
               : matchesByTeam[match.homeTeamId].upcoming.push(match);
      }
      if (matchesByTeam[match.awayTeamId]) {
        isPast ? matchesByTeam[match.awayTeamId].played.push(match)
               : matchesByTeam[match.awayTeamId].upcoming.push(match);
      }
    });

    // Vul dropdowns in de popups
    const teamSelects = ['team-division', 'player-team', 'delete-team-select'];
    teams.forEach(team => {
      teamSelects.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const opt = document.createElement('option');
        opt.value = team.teamId;
        opt.textContent = team.name;
        sel.appendChild(opt);
      });
    });

    const delPlayerSel = document.getElementById('delete-player-select');
    players.forEach(player => {
      const opt = document.createElement('option');
      opt.value = player.playerId;
      opt.textContent = player.name;
      delPlayerSel.appendChild(opt);
    });

    // Render teamkaarten
    container.innerHTML = "";
    teams.forEach(team => {
      const card = document.createElement("div");
      card.classList.add("card");

      const playersDiv = document.createElement("div");
      playersDiv.style.display = "none";
      const matchesDiv = document.createElement("div");
      matchesDiv.style.display = "none";

      card.innerHTML = `<strong>${team.name}</strong>`;

      card.addEventListener("click", () => {
        const isOpen = playersDiv.style.display === "block";
        playersDiv.style.display = isOpen ? "none" : "block";
        matchesDiv.style.display = isOpen ? "none" : "block";

        if (!isOpen) {
          playersDiv.innerHTML = '<div class="section-title">Spelers:</div>';
          const teamPlayers = playersByTeam[team.teamId] || [];
          if (teamPlayers.length === 0) {
            playersDiv.innerHTML += '<div class="player">Geen spelers gevonden</div>';
          } else {
            teamPlayers.forEach(p => {
              const el = document.createElement("div");
              el.classList.add("player");
              el.textContent = p.name;
              playersDiv.appendChild(el);
            });
          }

          matchesDiv.innerHTML = '<div class="section-title">Gespeelde wedstrijden:</div>';
          const played = matchesByTeam[team.teamId]?.played || [];
          if (played.length === 0) {
            matchesDiv.innerHTML += '<div class="match played">Geen gespeelde wedstrijden</div>';
          } else {
            played.forEach(m => {
              const el = document.createElement("div");
              el.classList.add("match", "played");
              el.textContent = `${teamMap[m.homeTeamId]} vs ${teamMap[m.awayTeamId]} (${m.homeScore} - ${m.awayScore})`;
              matchesDiv.appendChild(el);
            });
          }

          const upcomingTitle = document.createElement("div");
          upcomingTitle.classList.add("section-title");
          upcomingTitle.textContent = "Komende wedstrijden:";
          matchesDiv.appendChild(upcomingTitle);

          const upcoming = matchesByTeam[team.teamId]?.upcoming || [];
          if (upcoming.length === 0) {
            const el = document.createElement("div");
            el.classList.add("match", "upcoming");
            el.textContent = "Geen komende wedstrijden";
            matchesDiv.appendChild(el);
          } else {
            upcoming.forEach(m => {
              const el = document.createElement("div");
              el.classList.add("match", "upcoming");
              el.textContent = `${teamMap[m.homeTeamId]} vs ${teamMap[m.awayTeamId]} (${new Date(m.matchDate).toLocaleDateString('nl-NL')})`;
              matchesDiv.appendChild(el);
            });
          }
        }
      });

      card.appendChild(playersDiv);
      card.appendChild(matchesDiv);
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Fout bij ophalen data:", error);
    container.innerHTML = "<p>Kon data niet laden.</p>";
  });
});