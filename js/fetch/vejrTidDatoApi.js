//her er tids og dato API'et
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



//Her kommer vejr API'et
const vejrurl = "https://api.openweathermap.org/data/2.5/weather?q=Aalborg&appid=4d58d6f0a435bf7c5a52e2030f17682d&units=metric";

async function getWeather() {
  const res = await fetch(vejrurl);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  
  const data = await res.json();
  return data;
}

async function displayWeather() {
  const container = document.getElementById("weather");
  
  if (!container) {
    console.error("Element with id 'weather' not found!");
    return;
  }

  try {
    const data = await getWeather();
    console.log("Full API data:", JSON.stringify(data, null, 2));

    // OpenWeatherMap structure
    const city = data.name || "Unknown";
    const temp = data.main?.temp || "N/A";
    const icon = data.weather?.[0]?.icon || "";
    const windDeg = data.wind?.deg || "N/A";

    container.innerHTML = `
      <div class="card weather-card">
        <h2>${city}</h2>
        ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">` : ''}
        <div class="main-temp">${temp}°C</div>
    `;
  } catch (err) {
    console.error("Full error:", err);
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayWeather);
} else {
  displayWeather();
}
