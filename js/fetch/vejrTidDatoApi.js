document.addEventListener("DOMContentLoaded", () => {
  const timeContainer = document.getElementById("getCopenhagenTime");

  function updateCopenhagenTime() {
    const now = new Date();
    const options = {
      timeZone: "Europe/Copenhagen",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    // Brug tabular-nums via CSS for at undgå hop
    timeContainer.textContent = now.toLocaleTimeString("da-DK", options);
  }

  // Initial opdatering
  updateCopenhagenTime();

  // Opdater hvert sekund
  setInterval(updateCopenhagenTime, 1000);
});