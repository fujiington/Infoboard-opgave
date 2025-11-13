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

    let articles = [];
    if (Array.isArray(data.items)) {
      articles = data.items;
    } else if (data.items) {
      articles = [data.items];
    } else {
      container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    if (!articles.length) {
      container.innerHTML = "<p>No news articles found.</p>";
      return;
    }

    let index = 0;

    function showArticle(i) {
      const article = articles[i];
      const title = article.title || "Untitled";
      const description = article.description || article.content || "";
      const link = article.link || article.url || "";
      const pubDate = article.pubDate || article.publishedDate || "";
      const author = article.author || "";

      container.innerHTML = `
        <h2>Nyheder</h2>
        <div class="card fade-in">
          <h3>${link ? `<a href="${link}" target="_blank">${title}</a>` : title}</h3>
          ${pubDate ? `<div class="date"><strong>Udgivet:</strong> ${new Date(pubDate).toLocaleString('da-DK')}</div>` : ''}
          ${author ? `<div class="author"><strong>Forfatter:</strong> ${author}</div>` : ''}
          ${description ? `<div class="description">${description}</div>` : ''}
          <h5>Kilde: DR DK</h5>
        </div>
      `;
    }

    showArticle(index);

    setInterval(() => {
      index = (index + 1) % articles.length;
      showArticle(index);
    }, 30000); // 5 minutes in milliseconds

  } catch (err) {
    console.error("Full error:", err);
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayNews);
} else {
  displayNews();
}
