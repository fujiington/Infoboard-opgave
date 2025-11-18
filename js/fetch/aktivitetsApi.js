const API_URL = 'https://iws.itcn.dk/techcollege/schedules?departmentCode=smed';

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
                <p style="margin-top: 10px; font-size: 0.9em;">
                    OBS! Kræver VPN adgang udenfor skolens netværk.
                </p>
            </div>
        `;
        console.error('Fejl ved hentning af skema:', error);
    }
}

/* --- Format time --- */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
}

/* --- Display Function (kun én næste lektion) --- */
function displaySchedule(data) {
    const content = document.getElementById('content');

    let scheduleData = data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        scheduleData = data.value || data.data || data.schedules || data.activities || Object.values(data)[0];
    }

    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        content.innerHTML = '<div class="error">Ingen aktiviteter fundet</div>';
        return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Sorter
    scheduleData.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

    // Gruppér på dag
    const groupedByDay = {};
    scheduleData.forEach(item => {
        const day = new Date(item.StartDate).toISOString().split('T')[0];
        if (!groupedByDay[day]) groupedByDay[day] = [];
        groupedByDay[day].push(item);
    });

    const todaysClasses = groupedByDay[todayStr] || [];

    const currentClasses = todaysClasses.filter(item => {
        const start = new Date(item.StartDate);
        const end = new Date(item.EndDate);
        return now >= start && now <= end;
    });

    const upcomingToday = todaysClasses.filter(item => new Date(item.StartDate) > now);

    let html = '';

    /* --- 1) Igangværende lektion --- */
    if (currentClasses.length > 0) {
        html += `<h2 class="section-title">📘 Aktuel Lektion</h2>`;
        html += makeCard(currentClasses[0], true);   // kun én
    }

    /* --- 2) Næste lektion senere i dag --- */
    else if (upcomingToday.length > 0) {
        const nextLesson = upcomingToday[0];  // kun én
        html += `<h2 class="section-title">Næste Lektion</h2>`;
        html += makeCard(nextLesson, false);
    }

    /* --- 3) Hvis ingen tilbage i dag → vis i morgen --- */
    else {
        const futureDays = Object.keys(groupedByDay).filter(day => day > todayStr).sort();
        if (futureDays.length > 0) {
            const nextDay = futureDays[0];
            const firstNextDayLesson = groupedByDay[nextDay][0];
            html += `<h2 class="section-title">I Morgen</h2>`;
            html += makeCard(firstNextDayLesson, false);
        } else {
            html = `<h2 class="section-title">🎓 Ingen kommende lektioner</h2>`;
        }
    }

    content.innerHTML = html;
}

/* --- Card Builder --- */
function makeCard(item, isOngoing) {
    const start = new Date(item.StartDate);
    const end = new Date(item.EndDate);
    const now = new Date();
    const minutesLeft = Math.max(0, Math.round((end - now) / 60000));

    const colorMap = [
        { pattern: /GRAFISK TEKNIKER/i, color: "#E38B29" },
        { pattern: /MEDIE GRAFIKER/i, color: "#C44536" },
        { pattern: /WEB UDVIKLER/i, color: "#2E4057" }
    ];
    const accentObj = colorMap.find(entry => entry.pattern.test((item.Team || "").trim()));
    const accent = accentObj ? accentObj.color : "#293646";

    const subject = item.Subject || 'Intet fag';
    const room = item.Room ? `Lokale: ${item.Room}` : '';
    const team = item.Team ? `Hold: ${item.Team}` : '';
    const statusText = isOngoing
        ? `⏱ ${minutesLeft} min tilbage`
        : `Starter kl. ${formatTime(item.StartDate)}`;

    return `
        <div class="schedule-card ${isOngoing ? 'ongoing' : 'upcoming'}">
            <div class="schedule-row">
                <div class="schedule-accent" style="background:${accent};"></div>
                <div class="schedule-title">${subject}</div>
                ${room ? `<div class="schedule-room">${room}</div>` : ''}
                ${team ? `<div class="schedule-team">${team}</div>` : ''}
                <div class="schedule-status">${statusText}</div>
            </div>
        </div>
    `;
}

/* --- Auto Refresh --- */
document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    setInterval(fetchSchedule, 60000);
});