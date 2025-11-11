function getCopenhagenTime() {
  const copenhagenTime = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Copenhagen',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return copenhagenTime;
}


const container = document.getElementById("getCopenhagenTime");
if (container) {
  container.textContent = getCopenhagenTime();
} else {
  console.error("Element with id 'getCopenhagenTime' not found!");
}
