function handleLogin() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");
  const btn = document.getElementById("btn-login");

  if (!email || !password) {
    errorMsg.textContent = "❌ Vul alle velden in.";
    errorMsg.classList.add("visible");
    return;
  }

  errorMsg.classList.remove("visible");
  btn.textContent = "Bezig met inloggen…";
  btn.classList.add("loading");

  fetch("http://localhost:5153/api/Admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Ongeldige inloggegevens");
    return response.json();
  })
  .then(data => {
    console.log("Admin ingelogd:", data);

    localStorage.setItem("adminKey", "footballintel_admin_2026");
    localStorage.setItem("adminEmail", email);

    document.getElementById("success-overlay").classList.add("visible");

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1600);
  })
  .catch(() => {
    errorMsg.textContent = "❌ Ongeldig e-mailadres of wachtwoord";
    errorMsg.classList.add("visible");

    btn.textContent = "Inloggen";
    btn.classList.remove("loading");

    document.getElementById("password").value = "";
    document.getElementById("password").focus();

    // Rickroll popup
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      z-index: 99999; display: flex; align-items: center;
      justify-content: center; flex-direction: column; gap: 16px;
      animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: #1a1a1a; border: 1px solid rgba(216,90,48,0.4);
        border-radius: 20px; padding: 32px; max-width: 560px; width: 90%;
        text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.6);
      ">
        <p style="font-family:'Space Grotesk',sans-serif; font-size:1.2rem;
          color:#fff; margin-bottom: 20px;">🎵 Verkeerd wachtwoord...</p>

        <div style="position:relative; padding-bottom:56.25%; height:0;">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
        </div>

        <button onclick="this.closest('[data-rickroll]').remove()" style="
          margin-top: 20px; padding: 10px 28px;
          background: linear-gradient(135deg, #D85A30, #EF9F27);
          border: none; border-radius: 10px; color: #fff;
          font-family:'Space Grotesk',sans-serif; font-size:0.95rem;
          font-weight:600; cursor:pointer;
        ">Sluiten</button>
      </div>
    `;

    overlay.setAttribute("data-rickroll", "");
    document.body.appendChild(overlay);
  });
}

// Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});

// toggle password
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("toggle-pw").addEventListener("click", () => {
    const pw = document.getElementById("password");
    const btn = document.getElementById("toggle-pw");

    if (pw.type === "password") {
      pw.type = "text";
      btn.textContent = "🙈";
    } else {
      pw.type = "password";
      btn.textContent = "👁️";
    }
  });

  // button click
  document.getElementById("btn-login").addEventListener("click", handleLogin);

  // theme toggle
  const lightCSS = 'Style.css';
  const darkCSS = 'styledark.css';
  const link = document.getElementById('theme-stylesheet');
  const toggle = document.getElementById('theme-toggle');

  toggle.addEventListener('click', () => {
    const isDark = link.getAttribute('href') === darkCSS;
    link.setAttribute('href', isDark ? lightCSS : darkCSS);
    toggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  if (localStorage.getItem('theme') === 'dark') {
    link.setAttribute('href', darkCSS);
    toggle.textContent = '🌙';
  }
});