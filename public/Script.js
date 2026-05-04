// ================================
// MATCHES
// ================================

// GET: haal alle matches op
document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5153/api/match")
        .then(response => response.json())
        .then(data => {
            console.log("Matches:", data);
        });
});

// POST: voeg een nieuwe match toe - wordt aangeroepen via de knop in de HTML
function addMatch() {
    fetch("http://localhost:5153/api/match", {                  // Stuur POST-request naar de match endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({                                  // Stuur de nieuwe match data mee
            matchDate: "2025-06-01",                            // Datum van de match
            homeTeamId: 1,                                      // ID van het thuisteam
            awayTeamId: 2,                                      // ID van het uitteam
            homeScore: 0,                                       // Score thuisteam
            awayScore: 0                                        // Score uitteam
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Nieuwe match aangemaakt:", data);      // Toon de aangemaakte match in de console
        });
}

// DELETE: verwijder de eerste match - wordt aangeroepen via de knop in de HTML
function deleteMatch() {
    fetch("http://localhost:5153/api/match")                    // Haal eerst alle matches op om een geldig ID te vinden
        .then(response => response.json())
        .then(matches => {
            const id = matches[0].matchId;                      // Pak het ID van de eerste match
            fetch(`http://localhost:5153/api/match/${id}`, {    // Stuur DELETE-request met het ID in de URL
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {                          // Controleer of het verwijderen gelukt is
                        console.log("Match verwijderd met MatchId:", id);
                    }
                });
        });
}

// PUT: pas een bestaande match aan
function updateMatch() {
    fetch("http://localhost:5153/api/match")                    // Haal eerst alle matches op om een geldig ID te vinden
        .then(response => response.json())
        .then(matches => {
            const id = matches[0].matchId;                      // Pak het ID van de eerste match
            fetch(`http://localhost:5153/api/match/${id}`, {    // Stuur PUT-request met het ID in de URL
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({                          // Stuur de aangepaste match data mee
                    matchId: id,                                // ID moet meegegeven worden bij PUT
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
                });
        });
}

// ================================
// DIVISIONS
// ================================

// GET: haal alle divisies op
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

// GET: haal alle spelers op
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

// GET: haal alle regio's op
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

// GET: haal alle teams op
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