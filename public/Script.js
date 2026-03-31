document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/match")
    .then(response => response.json())
    .then(data => {
        console.log("matchen:", data);
        // weerContainer.innerHTML = 
        // `<h2>Weer id ${data.id}</h2>
        // <p>Temperatuur: ${data.temperatuur}°C</p>
        // <p>Weer: ${data.neerslag_mm}%</p>
        // <p>Zonuren: ${data.zonuren} uur</p>
        // `;
        // weerContainer.appendChild(weerElement);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/Divisions")
    .then(response => response.json())
    .then(data => {
        console.log("Division:", data);
        // weerContainer.innerHTML = 
        // `<h2>Weer id ${data.id}</h2>
        // <p>Temperatuur: ${data.temperatuur}°C</p>
        // <p>Weer: ${data.neerslag_mm}%</p>
        // <p>Zonuren: ${data.zonuren} uur</p>
        // `;
        // weerContainer.appendChild(weerElement);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/Player")
    .then(response => response.json())
    .then(data => {
        console.log("Players:", data);
        // weerContainer.innerHTML = 
        // `<h2>Weer id ${data.id}</h2>
        // <p>Temperatuur: ${data.temperatuur}°C</p>
        // <p>Weer: ${data.neerslag_mm}%</p>
        // <p>Zonuren: ${data.zonuren} uur</p>
        // `;
        // weerContainer.appendChild(weerElement);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/Region")
    .then(response => response.json())
    .then(data => {
        console.log("Region:", data);
        // weerContainer.innerHTML = 
        // `<h2>Weer id ${data.id}</h2>
        // <p>Temperatuur: ${data.temperatuur}°C</p>
        // <p>Weer: ${data.neerslag_mm}%</p>
        // <p>Zonuren: ${data.zonuren} uur</p>
        // `;
        // weerContainer.appendChild(weerElement);
    });
});
document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/Team")
    .then(response => response.json())
    .then(data => {
        console.log("Teams:", data);
        // weerContainer.innerHTML = 
        // `<h2>Weer id ${data.id}</h2>
        // <p>Temperatuur: ${data.temperatuur}°C</p>
        // <p>Weer: ${data.neerslag_mm}%</p>
        // <p>Zonuren: ${data.zonuren} uur</p>
        // `;
        // weerContainer.appendChild(weerElement);
    });
});