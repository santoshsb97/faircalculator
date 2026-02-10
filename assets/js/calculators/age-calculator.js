/* age-calculator - Lazy Loaded JavaScript */

/**
         * AGE CALCULATOR MODULE
         */
        const AgeCalc = (() => {

            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            const els = {
                dob: { m: document.getElementById('dobMonth'), d: document.getElementById('dobDay'), y: document.getElementById('dobYear') },
                target: { m: document.getElementById('targetMonth'), d: document.getElementById('targetDay'), y: document.getElementById('targetYear') },
                btn: document.getElementById('calculateBtn'),
                errorBox: document.getElementById('errorBox'),
                errorText: document.getElementById('errorText'),
                resultsArea: document.getElementById('resultsArea'),
                resYears: document.getElementById('resYears'),
                resDetailed: document.getElementById('resDetailed'),
                valMonths: document.getElementById('valMonths'),
                valWeeks: document.getElementById('valWeeks'),
                valDays: document.getElementById('valDays'),
                valHours: document.getElementById('valHours'),
                nextText: document.getElementById('nextBdayText'),
                nextSub: document.getElementById('nextBdaySub')
            };

            // 1. POPULATE DROPDOWNS
            const populateDropdowns = () => {
                const currentYear = new Date().getFullYear();

                const addOpts = (select, start, end, selected = null) => {
                    select.innerHTML = '';
                    for (let i = start; i <= end; i++) {
                        const opt = new Option(i, i);
                        if (i === selected) opt.selected = true;
                        select.add(opt);
                    }
                };

                const addMonths = (select, selected = 0) => {
                    select.innerHTML = '';
                    monthNames.forEach((m, idx) => {
                        const opt = new Option(m, idx);
                        if (idx === selected) opt.selected = true;
                        select.add(opt);
                    });
                };

                // DOB: 1900 -> Current
                addOpts(els.dob.y, 1900, currentYear, 2000);
                // Target: 1900 -> Current + 50
                addOpts(els.target.y, 1900, currentYear + 50, currentYear);

                // Months
                addMonths(els.dob.m, 0); // Jan default
                addMonths(els.target.m, new Date().getMonth());

                // Initial Days
                updateDays('dob');
                updateDays('target');

                // Set Default DOB Day
                els.dob.d.value = 1;
                // Set Default Target Day
                els.target.d.value = new Date().getDate();
            };

            const updateDays = (type) => {
                const elSet = els[type];
                const year = parseInt(elSet.y.value);
                const month = parseInt(elSet.m.value);
                const currentDay = parseInt(elSet.d.value) || 1;

                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Rebuild Day Select
                elSet.d.innerHTML = '';
                for (let i = 1; i <= daysInMonth; i++) {
                    elSet.d.add(new Option(i, i));
                }

                // Restore selection if valid, else clamp
                if (currentDay <= daysInMonth) elSet.d.value = currentDay;
                else elSet.d.value = daysInMonth;
            };

            // 2. VALIDATION
            const validateDateInputs = (birthDate, targetDate) => {
                els.errorBox.style.display = 'none';

                if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) {
                    showError("Invalid date selection.");
                    return false;
                }

                if (birthDate > targetDate) {
                    showError("Date of Birth cannot be in the future relative to the Target Date.");
                    return false;
                }

                return true;
            };

            const showError = (msg) => {
                els.errorText.textContent = msg;
                els.errorBox.style.display = 'flex';
                els.resultsArea.style.display = 'none';
            };

            // 3. PARSE DATES
            const parseDates = () => {
                const dY = parseInt(els.dob.y.value);
                const dM = parseInt(els.dob.m.value);
                const dD = parseInt(els.dob.d.value);

                const tY = parseInt(els.target.y.value);
                const tM = parseInt(els.target.m.value);
                const tD = parseInt(els.target.d.value);

                return {
                    birth: new Date(dY, dM, dD),
                    target: new Date(tY, tM, tD),
                    vals: { dY, dM, dD, tY, tM, tD }
                };
            };

            // 4. CORE AGE CALCULATION
            const calculateAge = (birth, target) => {
                let years = target.getFullYear() - birth.getFullYear();
                let months = target.getMonth() - birth.getMonth();
                let days = target.getDate() - birth.getDate();

                if (days < 0) {
                    months--;
                    // Days in prev month relative to target
                    const copy = new Date(target.getFullYear(), target.getMonth(), 0);
                    days += copy.getDate();
                }
                if (months < 0) {
                    years--;
                    months += 12;
                }
                return { years, months, days };
            };

            // 5. TOTALS CALCULATION
            const calculateTotals = (vals, age) => {
                const utc1 = Date.UTC(vals.dY, vals.dM, vals.dD);
                const utc2 = Date.UTC(vals.tY, vals.tM, vals.tD);

                const msDiff = Math.abs(utc2 - utc1);
                const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));

                // Precise total months
                const totalMonths = (age.years * 12) + age.months;

                return {
                    totalDays: totalDays,
                    totalWeeks: (totalDays / 7).toFixed(1),
                    totalMonths: totalMonths,
                    totalHours: totalDays * 24
                };
            };

            // 6. NEXT BIRTHDAY LOGIC
            const calculateNextBirthday = (birthDate, targetDate) => {
                const currentYear = targetDate.getFullYear();
                const bMonth = birthDate.getMonth();
                const bDay = birthDate.getDate();

                // Check for Feb 29 birth
                const isLeapBorn = (bMonth === 1 && bDay === 29);

                // Initial assumption: birthday is this year
                let nextBdayYear = currentYear;
                let nextBdayMonth = bMonth;
                let nextBdayDay = bDay;

                // Helper to check leap year
                const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

                // If born Feb 29 and current year is NOT leap, set to Feb 28
                if (isLeapBorn && !isLeap(nextBdayYear)) {
                    nextBdayDay = 28;
                }

                let nextBday = new Date(nextBdayYear, nextBdayMonth, nextBdayDay);

                // Check if birthday has passed in target year
                // Compare using time values to be safe, or just Y/M/D comparisons
                // If nextBday < targetDate, we need next year
                // Note: We need to handle "Today" separately in display, so strict less than check

                // Reset time components for clean comparison
                const targetClean = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

                if (nextBday < targetClean) {
                    nextBdayYear++;
                    // Re-check leap year for the NEW year
                    if (isLeapBorn) {
                        nextBdayDay = isLeap(nextBdayYear) ? 29 : 28;
                    }
                    nextBday = new Date(nextBdayYear, nextBdayMonth, nextBdayDay);
                }

                const isToday = (nextBday.getTime() === targetClean.getTime());

                // Diff in days
                const utcNow = Date.UTC(targetClean.getFullYear(), targetClean.getMonth(), targetClean.getDate());
                const utcNext = Date.UTC(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());
                const diffDays = Math.ceil((utcNext - utcNow) / (1000 * 60 * 60 * 24));

                return { isToday, diffDays, date: nextBday };
            };

            // 7. DISPLAY
            const displayResults = (age, totals, nextBday) => {
                els.resYears.textContent = `${age.years} Years`;
                els.resDetailed.textContent = `${age.months} months, ${age.days} days`;

                els.valMonths.textContent = totals.totalMonths.toLocaleString();
                els.valWeeks.textContent = totals.totalWeeks;
                els.valDays.textContent = totals.totalDays.toLocaleString();
                els.valHours.textContent = totals.totalHours.toLocaleString();

                if (nextBday.isToday) {
                    els.nextText.textContent = "Happy Birthday! ‚";
                    els.nextSub.textContent = "It's today!";
                } else {
                    els.nextText.textContent = `${nextBday.diffDays} Days`;
                    els.nextSub.textContent = `until ${nextBday.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                }

                els.resultsArea.style.display = 'block';
                els.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };

            // EXECUTE
            const execute = () => {
                const parsed = parseDates();
                if (!validateDateInputs(parsed.birth, parsed.target)) return;

                const age = calculateAge(parsed.birth, parsed.target);
                const totals = calculateTotals(parsed.vals, age);
                const nextBday = calculateNextBirthday(parsed.birth, parsed.target);

                displayResults(age, totals, nextBday);
            };

            // LISTENERS
            const setupEventListeners = () => {
                [els.dob.y, els.dob.m].forEach(el => el.addEventListener('change', () => updateDays('dob')));
                [els.target.y, els.target.m].forEach(el => el.addEventListener('change', () => updateDays('target')));
                els.btn.addEventListener('click', execute);
            };

            const init = () => {
                populateDropdowns();
                setupEventListeners();
            };

            return { init };
        })();

        document.addEventListener('DOMContentLoaded', AgeCalc.init);