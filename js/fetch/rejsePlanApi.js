const rejsePlanUrl = "https://www.rejseplanen.dk/api/nearbyDepartureBoard?accessId=5b71ed68-7338-4589-8293-f81f0dc92cf2&originCoordLat=57.048731&originCoordLong=9.968186&format=json";

async function getDepartures() {
  const res = await fetch(rejsePlanUrl);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  
  const data = await res.json();
  return data;
}

async function displayDepartures() {
  const container = document.getElementById("departures");
  
  if (!container) {
    console.error("Element with id 'departures' not found!");
    return;
  }

  try {
    const data = await getDepartures();
    console.log("Full API data:", JSON.stringify(data, null, 2));

    // Check different possible data structures for Rejseplanen API
    let departures = [];
    
    if (Array.isArray(data)) {
      departures = data;
    } else if (data.Departure) {
      departures = Array.isArray(data.Departure) ? data.Departure : [data.Departure];
    } else if (data.departures) {
      departures = Array.isArray(data.departures) ? data.departures : [data.departures];
    } else if (data.DepartureBoard && data.DepartureBoard.Departure) {
      departures = Array.isArray(data.DepartureBoard.Departure) ? data.DepartureBoard.Departure : [data.DepartureBoard.Departure];
    } else {
      // If structure is completely different, show raw data
      container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    if (!departures.length) {
      container.innerHTML = "<p>No departures found.</p>";
      return;
    }

    container.innerHTML = departures.map(dep => {
      // Common Rejseplanen API properties
      const name = dep.name || dep.line || dep.trainName || "Unknown";
      const time = dep.time || dep.rtTime || dep.scheduledTime || "";
      const date = dep.date || "";
      const direction = dep.direction || dep.finalStop || "";
      const stop = dep.stop || dep.stopName || "";
      const track = dep.track || dep.rtTrack || "";
      const type = dep.type || "";
      
      return `
        <div class="card">
          <h3>${name} ${type ? `(${type})` : ''}</h3>
          ${stop ? `<div class="stop"><strong>Stop:</strong> ${stop}</div>` : ''}
          ${time ? `<div class="time"><strong>Time:</strong> ${time}</div>` : ''}
          ${date ? `<div class="date"><strong>Date:</strong> ${date}</div>` : ''}
          ${direction ? `<div class="direction"><strong>Direction:</strong> ${direction}</div>` : ''}
          ${track ? `<div class="track"><strong>Track:</strong> ${track}</div>` : ''}
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Full error:", err);
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayDepartures);
} else {
  displayDepartures();
}