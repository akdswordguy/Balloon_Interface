const API_URL = "https://script.google.com/macros/s/AKfycbx14AuLZJSQ9qPyGseVV1C97aHY1qmvzidV-A-fgMHsiwbP0srvqi9PIw9zqDgSqxjeWA/exec";

async function fetchBalloons() {
  const res = await fetch(`${API_URL}?action=getPending`);
  const data = await res.json();
  renderBalloons(data);
}

function renderBalloons(balloons) {
  const container = document.getElementById("balloons");
  container.innerHTML = "";

  if (balloons.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No pending balloons 🎉</p>";
    return;
  }

  balloons.forEach(b => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="team">${b.team}</div>
      <div class="location">📍 ${b.lab} – Seat ${b.seat}</div>
      <div class="time">⏱ ${new Date(b.timestamp).toLocaleTimeString()}</div>
      <button onclick="markDelivered(${b.row})">Mark Delivered</button>
    `;

    container.appendChild(card);
  });
}

async function markDelivered(row) {
  await fetch(`${API_URL}?action=markDelivered&row=${row}`, {
    method: "POST"
  });
  fetchBalloons();
}

fetchBalloons();
setInterval(fetchBalloons, 5000);
