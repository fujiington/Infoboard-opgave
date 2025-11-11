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
    const country = data.sys?.country || "";
    const temp = data.main?.temp || "N/A";
    const feelsLike = data.main?.feels_like || "N/A";
    const tempMin = data.main?.temp_min || "N/A";
    const tempMax = data.main?.temp_max || "N/A";
    const humidity = data.main?.humidity || "N/A";
    const pressure = data.main?.pressure || "N/A";
    const description = data.weather?.[0]?.description || "N/A";
    const icon = data.weather?.[0]?.icon || "";
    const windSpeed = data.wind?.speed || "N/A";
    const windDeg = data.wind?.deg || "N/A";
    const clouds = data.clouds?.all || "N/A";
    const sunrise = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) : "N/A";
    const sunset = data.sys?.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) : "N/A";

    container.innerHTML = `
      <div class="card weather-card">
        <h2>${city}${country ? `, ${country}` : ''}</h2>
        ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">` : ''}
        <div class="main-temp">${temp}°C</div>
        <div class="description">${description}</div>
        
        <div class="weather-details">
          <div class="detail-item">
            <strong>Feels like:</strong> ${feelsLike}°C
          </div>
          <div class="detail-item">
            <strong>Min/Max:</strong> ${tempMin}°C / ${tempMax}°C
          </div>
          <div class="detail-item">
            <strong>Humidity:</strong> ${humidity}%
          </div>
          <div class="detail-item">
            <strong>Pressure:</strong> ${pressure} hPa
          </div>
          <div class="detail-item">
            <strong>Wind:</strong> ${windSpeed} m/s at ${windDeg}°
          </div>
          <div class="detail-item">
            <strong>Clouds:</strong> ${clouds}%
          </div>
          <div class="detail-item">
            <strong>Sunrise:</strong> ${sunrise}
          </div>
          <div class="detail-item">
            <strong>Sunset:</strong> ${sunset}
          </div>
        </div>
      </div>
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
