/* time-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const startMonth = document.getElementById('startMonth');
            const startDay = document.getElementById('startDay');
            const startYear = document.getElementById('startYear');
            const startTime = document.getElementById('startTime');
            const opEl = document.getElementById('operation');
            const hrsEl = document.getElementById('durHours');
            const minEl = document.getElementById('durMinutes');
            const secEl = document.getElementById('durSeconds');
            const btn = document.getElementById('calculateBtn');
            const resContainer = document.getElementById('resultContainer');
            const resTime = document.getElementById('resultTime');
            const resDate = document.getElementById('resultDate');

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            function populateDropdowns() {
                const now = new Date();
                const currentYear = now.getFullYear();

                // Populate Year
                for (let i = currentYear - 50; i <= currentYear + 50; i++) {
                    const opt = new Option(i, i);
                    if (i === currentYear) opt.selected = true;
                    startYear.add(opt);
                }

                // Populate Month
                monthNames.forEach((m, idx) => {
                    const opt = new Option(m, idx);
                    if (idx === now.getMonth()) opt.selected = true;
                    startMonth.add(opt);
                });

                updateDays();

                // Set initial day
                startDay.value = now.getDate();

                // Set initial time
                const h = String(now.getHours()).padStart(2, '0');
                const m = String(now.getMinutes()).padStart(2, '0');
                startTime.value = `${h}:${m}`;
            }

            function updateDays() {
                const year = parseInt(startYear.value);
                const month = parseInt(startMonth.value);
                const currentDay = parseInt(startDay.value) || 1;
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                startDay.innerHTML = '';
                for (let i = 1; i <= daysInMonth; i++) {
                    startDay.add(new Option(i, i));
                }
                startDay.value = currentDay <= daysInMonth ? currentDay : daysInMonth;
            }

            // Search Hide Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            function calculateTime() {
                const hStart = parseInt(startTime.value.split(':')[0] || 0);
                const mStart = parseInt(startTime.value.split(':')[1] || 0);

                const d = new Date(startYear.value, startMonth.value, startDay.value, hStart, mStart);

                if (isNaN(d.getTime())) { alert('Please enter valid start date/time'); return; }

                const h = parseInt(hrsEl.value || 0);
                const m = parseInt(minEl.value || 0);
                const s = parseInt(secEl.value || 0);

                const totalMs = (h * 3600 + m * 60 + s) * 1000;

                let newTimeMs;
                if (opEl.value === 'add') {
                    newTimeMs = d.getTime() + totalMs;
                } else {
                    newTimeMs = d.getTime() - totalMs;
                }

                const newDate = new Date(newTimeMs);

                // Format Output
                const timeStr = newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = newDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                resTime.textContent = timeStr;
                resDate.textContent = dateStr;

                resContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            startMonth.addEventListener('change', updateDays);
            startYear.addEventListener('change', updateDays);
            btn.addEventListener('click', calculateTime);

            populateDropdowns();
        });