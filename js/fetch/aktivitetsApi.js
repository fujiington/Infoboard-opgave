const API_URL = 'https://iws.itcn.dk/techcollege/schedules?departmentCode=smed';

/* --- Format time --- */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
}

/* --- Fetch Schedule from API --- */
async function fetchSchedule() {
    const content = document.getElementById('content');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP fejl! status: ${response.status}`);
        const data = await response.json();
        displayNextLessons(data);
    } catch (error) {
        content.innerHTML = `
            <div class="error">
                <h2>⚠️ Kunne ikke hente skema</h2>
                <p>${error.message}</p>
                <p style="margin-top: 10px; font-size: 0.9em;">OBS! Kræver VPN adgang udenfor skolens netværk.</p>
            </div>
        `;
        console.error('Fejl ved hentning af skema:', error);
    }
}

/* --- Display Next 20 Lessons --- */
function displayNextLessons(data) {
    const content = document.getElementById('content');

    let scheduleData = data.value || data.data || data.schedules || data.activities || data;
    if (!Array.isArray(scheduleData)) scheduleData = Object.values(data)[0];

    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        content.innerHTML = '<div class="error">Ingen aktiviteter fundet</div>';
        return;
    }

    const now = new Date();

    // Sort all lessons by start time
    scheduleData.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

    // Filter lessons that haven't ended yet
    const upcomingLessons = scheduleData.filter(item => new Date(item.EndDate) > now);

    if (upcomingLessons.length === 0) {
        content.innerHTML = '<h2 class="section-title">🎓 Ingen flere lektioner i dag</h2>';
        return;
    }

    // Take only the next 20 lessons
    const next20 = upcomingLessons.slice(0, 20);

    let html = `<h2 class="section-title">Næste 20 Lektioner</h2>`;
    html += next20.map(item => makeCard(item, now)).join('');
    content.innerHTML = html;
}

/* --- Card Builder --- */
function makeCard(item, now) {
    const start = new Date(item.StartDate);
    const end = new Date(item.EndDate);
    const subject = item.Subject || "Ukendt fag";
    const room = item.Room ? `Lokale: ${item.Room}` : "";
    const team = item.Team ? `Hold: ${item.Team}` : "";

    // Determine status
    let statusText;
    if (now >= start && now <= end) {
        const minutesLeft = Math.max(0, Math.round((end - now) / 60000));
        statusText = `⏱ ${minutesLeft} min tilbage`;
    } else {
        statusText = `Starter kl. ${formatTime(item.StartDate)}`;
    }

    return `
        <div class="schedule-card">
            <div class="schedule-row">
                <div class="schedule-title">${subject}</div>
                ${room ? `<div class="schedule-room">${room}</div>` : ""}
                ${team ? `<div class="schedule-team">${team}</div>` : ""}
                <div class="schedule-status">${statusText}</div>
            </div>
        </div>
    `;
}

/* --- Auto Refresh every minute --- */
document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    setInterval(fetchSchedule, 60 * 1000); // refresh every 60 seconds
});
