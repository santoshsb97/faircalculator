/* date-difference-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const calculateBtn = document.getElementById('calculateBtn');
            const resultContainer = document.getElementById('resultContainer');

            // Output Elements
            const totalDaysEl = document.getElementById('totalDays');
            const textDurationEl = document.getElementById('textDuration');
            const bdYearsEl = document.getElementById('bdYears');
            const bdMonthsEl = document.getElementById('bdMonths');
            const bdDaysEl = document.getElementById('bdDays');
            const altWeeksEl = document.getElementById('altWeeks');

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const els = {
                start: { m: document.getElementById('startMonth'), d: document.getElementById('startDay'), y: document.getElementById('startYear') },
                end: { m: document.getElementById('endMonth'), d: document.getElementById('endDay'), y: document.getElementById('endYear') }
            };

            function populateDropdowns() {
                const currentYear = new Date().getFullYear();
                const addOpts = (select, start, end, selected) => {
                    select.innerHTML = '';
                    for (let i = start; i <= end; i++) {
                        const opt = new Option(i, i);
                        if (i === selected) opt.selected = true;
                        select.add(opt);
                    }
                };
                const addMonths = (select, selected) => {
                    select.innerHTML = '';
                    monthNames.forEach((m, idx) => {
                        const opt = new Option(m, idx);
                        if (idx === selected) opt.selected = true;
                        select.add(opt);
                    });
                };

                addOpts(els.start.y, currentYear - 100, currentYear + 100, currentYear);
                addOpts(els.end.y, currentYear - 100, currentYear + 100, currentYear);
                addMonths(els.start.m, new Date().getMonth());
                addMonths(els.end.m, new Date().getMonth());

                updateDays('start');
                updateDays('end');

                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                setSelects('start', today);
                setSelects('end', tomorrow);
            }

            function updateDays(type) {
                const elSet = els[type];
                const year = parseInt(elSet.y.value);
                const month = parseInt(elSet.m.value);
                const currentDay = parseInt(elSet.d.value) || 1;
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                elSet.d.innerHTML = '';
                for (let i = 1; i <= daysInMonth; i++) {
                    elSet.d.add(new Option(i, i));
                }
                elSet.d.value = currentDay <= daysInMonth ? currentDay : daysInMonth;
            }

            function setSelects(type, date) {
                els[type].m.value = date.getMonth();
                updateDays(type);
                els[type].d.value = date.getDate();
                els[type].y.value = date.getFullYear();
            }

            function getFromSelects(type) {
                return new Date(els[type].y.value, els[type].m.value, els[type].d.value);
            }

            // Search Hide Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Set defaults (Today and Tomorrow)
            // const today = new Date();
            // const tomorrow = new Date(today);
            // tomorrow.setDate(today.getDate() + 1);

            // startDateEl.valueAsDate = today;
            // endDateEl.valueAsDate = tomorrow;

            function calculateDiff() {
                const d1 = getFromSelects('start');
                const d2 = getFromSelects('end');

                if (!d1.getTime() || !d2.getTime()) {
                    alert('Please enter valid dates.');
                    return;
                }

                // Always calculate absolute difference
                let start = d1 < d2 ? d1 : d2;
                let end = d1 < d2 ? d2 : d1;

                // 1. Total Days
                const oneDay = 24 * 60 * 60 * 1000;
                const diffTime = Math.abs(end - start);
                const diffDays = Math.round(diffTime / oneDay);

                // 2. Y/M/D Breakdown
                let years = end.getFullYear() - start.getFullYear();
                let months = end.getMonth() - start.getMonth();
                let days = end.getDate() - start.getDate();

                if (days < 0) {
                    months--;
                    // Days in previous month
                    const copy = new Date(end.getTime());
                    copy.setMonth(end.getMonth() - 1);
                    const daysInPrevMonth = new Date(copy.getFullYear(), copy.getMonth() + 1, 0).getDate();
                    days += daysInPrevMonth;
                }

                if (months < 0) {
                    years--;
                    months += 12;
                }

                // Update UI
                totalDaysEl.textContent = diffDays + " days";
                altWeeksEl.textContent = (diffDays / 7).toFixed(1) + " weeks";

                // Build Text String
                let parts = [];
                if (years > 0) parts.push(years + (years === 1 ? ' year' : ' years'));
                if (months > 0) parts.push(months + (months === 1 ? ' month' : ' months'));
                if (days > 0) parts.push(days + (days === 1 ? ' day' : ' days'));
                if (parts.length === 0) parts.push('0 days'); // Same day

                textDurationEl.textContent = parts.join(', ');

                bdYearsEl.textContent = years;
                bdMonthsEl.textContent = months;
                bdDaysEl.textContent = days;

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            els.start.m.addEventListener('change', () => updateDays('start'));
            els.start.y.addEventListener('change', () => updateDays('start'));
            els.end.m.addEventListener('change', () => updateDays('end'));
            els.end.y.addEventListener('change', () => updateDays('end'));
            calculateBtn.addEventListener('click', calculateDiff);

            populateDropdowns();
        });