// GET: haal alle matches op en toon ze op de pagina
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("matches-list");  // Zoek het HTML-element waar de matches in komen

    if (!container) return;                                      // Stop als het element niet bestaat op deze pagina

    Promise.all([                                                // Wacht tot beide requests klaar zijn
        fetch("http://localhost:5153/api/match").then(r => r.json()),   // Haal alle matches op
        fetch("http://localhost:5153/api/Team").then(r => r.json())     // Haal alle teams op voor de teamnamen
    ])
    .then(([matches, teams]) => {
        const teamMap = {};                                      // Maak een leeg object aan om teams op te slaan
        teams.forEach(team => {
            teamMap[team.teamId] = team.name;                    // Sla elke teamnaam op met het teamId als sleutel
        });

        matches.forEach(match => {
            const div = document.createElement("div");          // Maak een nieuw div element aan voor elke match
            div.classList.add("match");                          // Voeg de CSS klasse "match" toe aan de div
            div.innerHTML = `
            <div class="teams">${teamMap[match.homeTeamId] ?? "Team " + match.homeTeamId} vs ${teamMap[match.awayTeamId] ?? "Team " + match.awayTeamId}</div>
            <div class="score">Score: ${match.homeScore} - ${match.awayScore}</div>
            <div class="date">Datum: ${match.matchDate}</div>
            `;                                                  // Vul de div met de match data
            container.appendChild(div);                          // Voeg de div toe aan de pagina
        });
    })
    .catch(error => {
        console.error("Fout bij ophalen data:", error);          // Toon fout in console als er iets misgaat
        if (container) container.innerHTML = "<p>Kon data niet laden.</p>"; // Toon foutmelding op de pagina
    });
});

// POPUP: open de popup en laad de teams in de dropdowns
function addMatch() {
    fetch("http://localhost:5153/api/Team")                      // Haal alle teams op voor de dropdown menus
        .then(r => r.json())
        .then(teams => {
            const homeSelect = document.getElementById("popup-home");   // Zoek de thuisteam dropdown
            const awaySelect = document.getElementById("popup-away");   // Zoek de uitteam dropdown

            homeSelect.innerHTML = "";                           // Leeg de dropdown voor het geval hij al gevuld was
            awaySelect.innerHTML = "";                           // Leeg de dropdown voor het geval hij al gevuld was

            teams.forEach(team => {
                const option1 = document.createElement("option");       // Maak een optie aan voor de thuisteam dropdown
                option1.value = team.teamId;                     // Sla het teamId op als waarde
                option1.textContent = team.name;                 // Toon de teamnaam in de dropdown
                homeSelect.appendChild(option1);                 // Voeg de optie toe aan de thuisteam dropdown

                const option2 = document.createElement("option");       // Maak een optie aan voor de uitteam dropdown
                option2.value = team.teamId;                     // Sla het teamId op als waarde
                option2.textContent = team.name;                 // Toon de teamnaam in de dropdown
                awaySelect.appendChild(option2);                 // Voeg de optie toe aan de uitteam dropdown
            });

            document.getElementById("match-popup").style.display = "flex"; // Toon de popup
        });
}

// POPUP: sluit de popup
function closePopup() {
    document.getElementById("match-popup").style.display = "none";  // Verberg de popup
}

// POST: verstuur de ingevulde match data naar de backend
function submitMatch() {
    const matchDate = document.getElementById("popup-date").value;          // Haal de ingevulde datum op
    const homeTeamId = parseInt(document.getElementById("popup-home").value); // Haal het gekozen thuisteam ID op
    const awayTeamId = parseInt(document.getElementById("popup-away").value); // Haal het gekozen uitteam ID op
    const homeScore = parseInt(document.getElementById("popup-home-score").value); // Haal de score van het thuisteam op
    const awayScore = parseInt(document.getElementById("popup-away-score").value); // Haal de score van het uitteam op

    if (!matchDate) {                                            // Controleer of een datum ingevuld is
        alert("Vul een datum in.");                              // Toon een foutmelding als de datum ontbreekt
        return;                                                  // Stop de functie
    }

    if (homeTeamId === awayTeamId) {                             // Controleer of het thuis- en uitteam verschillend zijn
        alert("Thuisteam en uitteam mogen niet hetzelfde zijn.");// Toon een foutmelding als ze hetzelfde zijn
        return;                                                  // Stop de functie
    }

    fetch("http://localhost:5153/api/match", {                   // Stuur POST-request naar de match endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({                                   // Zet de ingevulde data om naar JSON
            matchDate: matchDate,                                // Datum van de match
            homeTeamId: homeTeamId,                              // ID van het thuisteam
            awayTeamId: awayTeamId,                              // ID van het uitteam
            homeScore: homeScore,                                // Score van het thuisteam
            awayScore: awayScore                                 // Score van het uitteam
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuwe match aangemaakt:", data);       // Toon de aangemaakte match in de console
            closePopup();                                        // Sluit de popup na het toevoegen
            location.reload();                                   // Herlaad de pagina zodat de nieuwe match zichtbaar is
        });
}

// DELETE: verwijder de eerste match - wordt aangeroepen via de knop in de HTML
function deleteMatch() {
    fetch("http://localhost:5153/api/match")                     // Haal eerst alle matches op om een geldig ID te vinden
        .then(response => response.json())
        .then(matches => {
            const id = matches[0].matchId;                       // Pak het ID van de eerste match
            fetch(`http://localhost:5153/api/match/${id}`, {     // Stuur DELETE-request met het ID in de URL
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {                           // Controleer of het verwijderen gelukt is
                        console.log("Match verwijderd met MatchId:", id);
                        location.reload();                       // Herlaad de pagina zodat de verwijderde match verdwijnt
                    }
                });
        });
}

// PUT: pas een bestaande match aan
function updateMatch() {
    fetch("http://localhost:5153/api/match")                     // Haal eerst alle matches op om een geldig ID te vinden
        .then(response => response.json())
        .then(matches => {
            const id = matches[0].matchId;                       // Pak het ID van de eerste match
            fetch(`http://localhost:5153/api/match/${id}`, {     // Stuur PUT-request met het ID in de URL
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({                           // Stuur de aangepaste match data mee
                    matchId: id,                                 // ID moet meegegeven worden bij PUT
                    matchDate: "2025-06-05",
                    homeTeamId: 1,
                    awayTeamId: 3,
                    homeScore: 2,
                    awayScore: 1
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Match aangepast:", data);
                    location.reload();                           // Herlaad de pagina zodat de aanpassing zichtbaar is
                });
        });
}

// ================================
// DIVISIONS
// ================================

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5153/api/Divisions")
        .then(response => response.json())
        .then(data => {
            console.log("Divisions:", data);
        });
});

function addDivision() {
    fetch("http://localhost:5153/api/Divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Divisie A",
            regionId: 1
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuwe divisie aangemaakt:", data);
        });
}

function deleteDivision() {
    fetch("http://localhost:5153/api/Divisions")
        .then(response => response.json())
        .then(divisions => {
            const id = divisions[0].divisionId;
            fetch(`http://localhost:5153/api/Divisions/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Divisie verwijderd met DivisionId:", id);
                    }
                });
        });
}

function updateDivision() {
    fetch("http://localhost:5153/api/Divisions")
        .then(response => response.json())
        .then(divisions => {
            const id = divisions[0].divisionId;
            fetch(`http://localhost:5153/api/Divisions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    divisionId: id,
                    name: "Divisie A - Aangepast",
                    regionId: 2
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Divisie aangepast:", data);
                });
        });
}

// ================================
// PLAYERS
// ================================

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5153/api/Player")
        .then(response => response.json())
        .then(data => {
            console.log("Players:", data);
        });
});

function addPlayer() {
    fetch("http://localhost:5153/api/Player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Jan Janssen",
            age: 25,
            teamId: 1
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuwe speler aangemaakt:", data);
        });
}

function deletePlayer() {
    fetch("http://localhost:5153/api/Player")
        .then(response => response.json())
        .then(players => {
            const id = players[0].playerId;
            fetch(`http://localhost:5153/api/Player/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Speler verwijderd met PlayerId:", id);
                    }
                });
        });
}

function updatePlayer() {
    fetch("http://localhost:5153/api/Player")
        .then(response => response.json())
        .then(players => {
            const id = players[0].playerId;
            fetch(`http://localhost:5153/api/Player/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId: id,
                    name: "Jan Pietersen",
                    age: 26,
                    teamId: 2
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Speler aangepast:", data);
                });
        });
}

// ================================
// REGIONS
// ================================

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5153/api/Region")
        .then(response => response.json())
        .then(data => {
            console.log("Regions:", data);
        });
});

function addRegion() {
    fetch("http://localhost:5153/api/Region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Noord-Vlaanderen"
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuwe regio aangemaakt:", data);
        });
}

function deleteRegion() {
    fetch("http://localhost:5153/api/Region")
        .then(response => response.json())
        .then(regions => {
            const id = regions[0].regionId;
            fetch(`http://localhost:5153/api/Region/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Regio verwijderd met RegionId:", id);
                    }
                });
        });
}

function updateRegion() {
    fetch("http://localhost:5153/api/Region")
        .then(response => response.json())
        .then(regions => {
            const id = regions[0].regionId;
            fetch(`http://localhost:5153/api/Region/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    regionId: id,
                    name: "Oost-Vlaanderen"
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Regio aangepast:", data);
                });
        });
}

// ================================
// TEAMS
// ================================

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5153/api/Team")
        .then(response => response.json())
        .then(data => {
            console.log("Teams:", data);
        });
});

function addTeam() {
    fetch("http://localhost:5153/api/Team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "FC Voorbeeld",
            divisionId: 1
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuw team aangemaakt:", data);
        });
}

function deleteTeam() {
    fetch("http://localhost:5153/api/Team")
        .then(response => response.json())
        .then(teams => {
            const id = teams[0].teamId;
            fetch(`http://localhost:5153/api/Team/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Team verwijderd met TeamId:", id);
                    }
                });
        });
}

function updateTeam() {
    fetch("http://localhost:5153/api/Team")
        .then(response => response.json())
        .then(teams => {
            const id = teams[0].teamId;
            fetch(`http://localhost:5153/api/Team/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: id,
                    name: "FC Voorbeeld Aangepast",
                    divisionId: 2
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Team aangepast:", data);
                });
        });
}