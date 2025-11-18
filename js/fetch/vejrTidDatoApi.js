document.addEventListener("DOMContentLoaded", () => {
  // --- Time & Date API ---
  function getCopenhagenTime() {
    return new Date().toLocaleString('da-DK', {
      timeZone: 'Europe/Copenhagen',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function updateCopenhagenTime() {
    const container = document.getElementById("getCopenhagenTime");
    if (container) container.textContent = getCopenhagenTime();
  }

  function getCopenhagenDate() {
    return new Date().toLocaleDateString('da-DK', {
      timeZone: 'Europe/Copenhagen',
      day: '2-digit',
      year: 'numeric',
      month: '2-digit'
    });
  }

  function updateCopenhagenDate() {
    const container = document.getElementById("getCopenhagenDate");
    if (container) container.textContent = getCopenhagenDate();
  }

  // Initialize & update every second
  updateCopenhagenTime();
  updateCopenhagenDate();
  setInterval(updateCopenhagenTime, 1000);
  setInterval(updateCopenhagenDate, 1000);
});
