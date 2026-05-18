// ================================
// STANDINGS
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("standings-body");

  Promise.all([
    fetch("http://localhost:5153/api/match").then(r => r.json()),
    fetch("http://localhost:5153/api/Team").then(r => r.json())
  ])
  .then(([matches, teams]) => {

    const standings = {};

    teams.forEach(team => {
      standings[team.teamId] = {
        team: team.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      };
    });

    matches.forEach(match => {
      const home = match.homeTeamId;
      const away = match.awayTeamId;
      const homeScore = match.homeScore;
      const awayScore = match.awayScore;

      if (!standings[home] || !standings[away]) return;

      standings[home].played++;
      standings[away].played++;
      standings[home].goalsFor += homeScore;
      standings[home].goalsAgainst += awayScore;
      standings[away].goalsFor += awayScore;
      standings[away].goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        standings[home].wins++;
        standings[home].points += 3;
        standings[away].losses++;
      } else if (homeScore < awayScore) {
        standings[away].wins++;
        standings[away].points += 3;
        standings[home].losses++;
      } else {
        standings[home].draws++;
        standings[home].points += 1;
        standings[away].draws++;
        standings[away].points += 1;
      }
    });

    const sorted = Object.values(standings).sort((a, b) => b.points - a.points);

    tbody.innerHTML = "";
    sorted.forEach((team, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td class="team">${team.team}</td>
        <td>${team.played}</td>
        <td>${team.wins}</td>
        <td>${team.draws}</td>
        <td>${team.losses}</td>
        <td>${team.goalsFor}</td>
        <td>${team.goalsAgainst}</td>
        <td>${team.points}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    console.error("Fout bij ophalen data:", error);
    tbody.innerHTML = "<tr><td colspan='9'>Kon data niet laden.</td></tr>";
  });
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
function logoutAdmin() {
  localStorage.removeItem("adminKey");
  localStorage.removeItem("adminEmail");

  window.location.href = "index.html"; // of login page
}