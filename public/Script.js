document.addEventListener("DOMContentLoaded", ()=>{
    const weerContainer = document.querySelector(".weer");
    fetch("http://localhost:5153/api/artemis")
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