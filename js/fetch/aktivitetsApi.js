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
        displaySchedule(data);
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

/* --- Display Schedule --- */
function displaySchedule(data) {
    const content = document.getElementById('content');

    let scheduleData = data.value || data.data || data.schedules || data.activities || data;
    if (!Array.isArray(scheduleData)) scheduleData = Object.values(data)[0];

    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        content.innerHTML = '<div class="error">Ingen aktiviteter fundet</div>';
        return;
    }

    const now = new Date();
    scheduleData.sort((a,b) => new Date(a.StartDate) - new Date(b.StartDate));

    const todayStr = now.toISOString().split('T')[0];
    const todays = scheduleData.filter(x => x.StartDate.startsWith(todayStr));

    let html = "";

    /* ---------- Ongoing ---------- */
    const ongoing = todays.filter(item => {
        const s = new Date(item.StartDate);
        const e = new Date(item.EndDate);
        return now >= s && now <= e;
    });

    if (ongoing.length > 0) {
        html += `<h2 class="section-title">📘 Igangværende</h2>`;
        html += ongoing.map(item => makeCard(item)).join('');
        content.innerHTML = html;
        return;
    }

    /* ---------- Next Block ---------- */
    const upcoming = todays.filter(item => new Date(item.StartDate) > now);
    if (upcoming.length > 0) {
        const nextStart = new Date(upcoming[0].StartDate).getTime();
        const nextBlock = upcoming.filter(item => new Date(item.StartDate).getTime() === nextStart);

        html += `<h2 class="section-title">Næste Lektioner</h2>`;
        html += nextBlock.map(item => makeCard(item)).join('');
        content.innerHTML = html;
        return;
    }

    html = `<h2 class="section-title">🎓 Ingen flere lektioner i dag</h2>`;
    content.innerHTML = html;
}

/* --- Card Builder --- */
function makeCard(item) {
    const start = new Date(item.StartDate);
    const end = new Date(item.EndDate);
    const now = new Date();
    const minutesLeft = Math.max(0, Math.round((end - now) / 60000));

    const subject = item.Subject || "Ukendt fag";
    const room = item.Room ? `Lokale: ${item.Room}` : "";
    const team = item.Team ? `Hold: ${item.Team}` : "";
    const statusText = now >= start && now <= end ? `⏱ ${minutesLeft} min tilbage` : `Starter kl. ${formatTime(item.StartDate)}`;

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

/* --- Auto Refresh --- */
document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    setInterval(fetchSchedule, 60 * 1000);
});