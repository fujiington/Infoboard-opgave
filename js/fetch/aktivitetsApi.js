 const API_URL = 'https://iws.itcn.dk/techcollege/schedules?departmentCode=smed';
        
        async function fetchSchedule() {
            const content = document.getElementById('content');
            
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`HTTP fejl! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API data:', data); // Debug
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
        
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('da-DK', options);
        }
        
        function formatTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        }
        
        function displaySchedule(data) {
            const content = document.getElementById('content');
            
            // Håndter forskellige datastrukturer
            let scheduleData = data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Hvis data er et objekt, find array'et
                scheduleData = data.value || data.data || data.schedules || data.activities || Object.values(data)[0];
            }
            
            if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
                content.innerHTML = '<div class="error">Ingen aktiviteter fundet</div>';
                console.log('Data er ikke et array:', data);
                return;
            }
            
            const scheduleHTML = scheduleData.map(item => `
                <div class="schedule-card">
                    <div class="schedule-header">
                        <div class="schedule-title">${item.Subject || 'Intet fag'}</div>
                        <div class="schedule-date">${formatDate(item.StartDate)}</div>
                    </div>
                    <div class="schedule-details">
                        <div class="detail-row">
                            <span class="detail-label">Tidspunkt:</span>
                            <span class="detail-value">
                                <span class="time-badge">${formatTime(item.StartDate)} - ${formatTime(item.EndDate)}</span>
                            </span>
                        </div>
                        ${item.Team ? `
                        <div class="detail-row">
                            <span class="detail-label">Hold:</span>
                            <span class="detail-value">
                                <span class="team-badge">${item.Team}</span>
                            </span>
                        </div>
                        ` : ''}
                        ${item.Education ? `
                        <div class="detail-row">
                            <span class="detail-label">Uddannelse:</span>
                            <span class="detail-value">${item.Education}</span>
                        </div>
                        ` : ''}
                        ${item.Room ? `
                        <div class="detail-row">
                            <span class="detail-label">Lokale:</span>
                            <span class="detail-value">${item.Room}</span>
                        </div>
                        ` : ''}
                        ${item.Teacher ? `
                        <div class="detail-row">
                            <span class="detail-label">Lærer:</span>
                            <span class="detail-value">${item.Teacher}</span>
                        </div>
                        ` : ''}
                        ${item.Note ? `
                        <div class="detail-row">
                            <span class="detail-label">Note:</span>
                            <span class="detail-value">${item.Note}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            content.innerHTML = `<div class="schedule-grid">${scheduleHTML}</div>`;
        }
        
        document.addEventListener('DOMContentLoaded', fetchSchedule);