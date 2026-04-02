document.addEventListener("DOMContentLoaded", ()=>{
    fetch("http://localhost:5153/api/match")
    .then(response => response.json())
    .then(data => {
        console.log("matchen:", data);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    fetch("http://localhost:5153/api/Divisions")
    .then(response => response.json())
    .then(data => {
        console.log("Division:", data);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    fetch("http://localhost:5153/api/Player")
    .then(response => response.json())
    .then(data => {
        console.log("Players:", data);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    fetch("http://localhost:5153/api/Region")
    .then(response => response.json())
    .then(data => {
        console.log("Region:", data);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    fetch("http://localhost:5153/api/Team")
    .then(response => response.json())
    .then(data => {
        console.log("Teams:", data);

    });
});