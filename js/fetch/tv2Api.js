const url = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.dr.dk%2Fnyheder%2Fservice%2Ffeeds%2Fallenyheder%23";

async function getNews() {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  
  const data = await res.json();
  return data;
}

async function displayNews() {
  const container = document.getElementById("news");
  
  if (!container) {
    console.error("Element with id 'news' not found!");
    return;
  }

  try {
    const data = await getNews();
    console.log("Full API data:", JSON.stringify(data, null, 2));

    // RSS2JSON typically returns data.items
    let articles = [];
    
    if (Array.isArray(data)) {
      articles = data;
    } else if (data.items) {
      articles = Array.isArray(data.items) ? data.items : [data.items];
    } else if (data.feed && data.feed.items) {
      articles = Array.isArray(data.feed.items) ? data.feed.items : [data.feed.items];
    } else {
      // If structure is completely different, show raw data
      container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    if (!articles.length) {
      container.innerHTML = "<p>No news articles found.</p>";
      return;
    }

    container.innerHTML = articles.map(article => {
      const title = article.title || "Untitled";
      const description = article.description || article.content || "";
      const link = article.link || article.url || "";
      const pubDate = article.pubDate || article.publishedDate || "";
      const author = article.author || "";
      const thumbnail = article.thumbnail || article.enclosure?.link || "";
      
      return `
        <div class="card">
          ${thumbnail ? `<img src="${thumbnail}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 4px;">` : ''}
          <h3>${link ? `<a href="${link}" target="_blank">${title}</a>` : title}</h3>
          ${pubDate ? `<div class="date"><strong>Published:</strong> ${new Date(pubDate).toLocaleString('da-DK')}</div>` : ''}
          ${author ? `<div class="author"><strong>Author:</strong> ${author}</div>` : ''}
          ${description ? `<div class="description">${description}</div>` : ''}
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
  document.addEventListener('DOMContentLoaded', displayNews);
} else {
  displayNews();
}