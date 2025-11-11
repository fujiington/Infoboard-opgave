const url = "https://infoskaerm.techcollege.dk/umbraco/api/content/getcanteenmenu/?type=json";

async function getCanteenMenu() {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    // XML → JSON
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");

    function xmlToJson(node) {
      if (node.nodeType === 3) return node.nodeValue.trim();

      const obj = {};
      if (node.attributes && node.attributes.length) {
        obj["@attributes"] = {};
        for (const attr of node.attributes) obj["@attributes"][attr.name] = attr.value;
      }

      for (const child of node.childNodes) {
        if (child.nodeType === 3 && !child.nodeValue.trim()) continue;
        const name = child.nodeName;
        const value = xmlToJson(child);
        if (!value) continue;

        if (obj[name]) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(value);
        } else {
          obj[name] = value;
        }
      }
      if (Object.keys(obj).length === 1 && obj["#text"]) return obj["#text"];
      return obj;
    }

    return xmlToJson(xml);
  }
}

async function displayMenu() {
  const container = document.getElementById("menu");
  
  if (!container) {
    console.error("Element with id 'menu' not found!");
    return;
  }

  try {
    const data = await getCanteenMenu();
    console.log("Full API data:", JSON.stringify(data, null, 2)); // Better logging

    let days = [];
    
    if (Array.isArray(data)) {
      days = data;
    } else if (data.menuDay) {
      days = Array.isArray(data.menuDay) ? data.menuDay : [data.menuDay];
    } else if (data.Days) {
      days = Array.isArray(data.Days) ? data.Days : [data.Days];
    } else {
      container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    if (!days.length) {
      container.innerHTML = "<p>No menu found.</p>";
      return;
    }

    container.innerHTML = days.map(day => {
      const dayName = day.dayName || day.DayName || day.name || "Unknown Day";
      const dishes = day.dish || day.dishes || day.Dish || day.Dishes || [];
      const dishesArray = Array.isArray(dishes) ? dishes : [dishes];
      
      return `
        <div class="card">
          <div class="day">${dayName}</div>
          <div class="dishes">${dishesArray.filter(d => d).join("<br>") || "No dishes"}</div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Full error:", err);
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// kør når DOM er loadet
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayMenu);
} else {
  displayMenu();
}