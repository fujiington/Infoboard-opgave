const API_URL = 'https://iws.itcn.dk/techcollege/schedules?departmentCode=smed';

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    // Force local timezone display
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
}

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

    const todaysClasses = scheduleData.filter(item => {
        const start = new Date(item.StartDate);
        return start.toISOString().split('T')[0] === todayStr;
    });

    // Adjust for timezone offset (UTC -> local)
    const offsetMs = now.getTimezoneOffset() * 60000;

    const currentClasses = todaysClasses.filter(item => {
        const start = new Date(new Date(item.StartDate).getTime() - offsetMs);
        const end = new Date(new Date(item.EndDate).getTime() - offsetMs);
        return now >= start && now <= end;
    });

    todaysClasses.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

    let html = '';

    if (currentClasses.length > 0) {
        html += `<h2 class="section-title">📘 Aktuelle Lektioner</h2>`;
        html += currentClasses.map(item => makeCard(item, true)).join('');
    } else {
        const next = todaysClasses.find(item => new Date(item.StartDate) > now);
        if (next) {
            html += `<h2 class="section-title">⏳ Næste Lektion</h2>`;
            html += makeCard(next, false);
        } else {
            html = `<h2 class="section-title">🎓 Ingen flere lektioner i dag</h2>`;
        }
    }

    content.innerHTML = html;
}

function makeCard(item, isOngoing) {
    const start = new Date(item.StartDate);
    const end = new Date(item.EndDate);
    const now = new Date();
    const minutesLeft = Math.max(0, Math.round((end - now) / 60000));
    const duration = Math.round((end - start) / 60000);

    return `
        <div class="schedule-card ${isOngoing ? 'ongoing' : 'upcoming'}">
            <div class="schedule-header">
                <div class="schedule-title">${item.Subject || 'Intet fag'}</div>
                <div class="schedule-time">${formatTime(item.StartDate)} - ${formatTime(item.EndDate)}</div>
            </div>
            <div class="schedule-details">
                ${item.Room ? `<div><strong>Lokale:</strong> ${item.Room}</div>` : ''}
                ${item.Teacher ? `<div><strong>Lærer:</strong> ${item.Teacher}</div>` : ''}
                ${item.Team ? `<div><strong>Hold:</strong> ${item.Team}</div>` : ''}
                ${item.Note ? `<div><strong>Note:</strong> ${item.Note}</div>` : ''}
                <div class="time-status">
                    ${isOngoing
                        ? `⏱ ${minutesLeft} min tilbage (varighed: ${duration} min)`
                        : `Starter kl. ${formatTime(item.StartDate)}`}
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    setInterval(fetchSchedule, 60 * 1000);
});