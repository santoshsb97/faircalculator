/* salary-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const amountInput = document.getElementById('amount');
            const periodInput = document.getElementById('period');
            const hoursPerWeekInput = document.getElementById('hoursPerWeek');
            const daysPerWeekInput = document.getElementById('daysPerWeek');
            const currencySelect = document.getElementById('currency');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const annualResult = document.getElementById('annualResult');
            const monthlyResult = document.getElementById('monthlyResult');
            const biweeklyResult = document.getElementById('biweeklyResult');
            const weeklyResult = document.getElementById('weeklyResult');
            const dailyResult = document.getElementById('dailyResult');
            const hourlyResult = document.getElementById('hourlyResult');
            const donutChart = document.getElementById('donutChart');
            const donutPercent = document.getElementById('donutPercent');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Format Money Helper
            const formatMoney = (amount) => {
                const currency = currencySelect.value;
                const localeMap = { 'USD': 'en-US', 'EUR': 'de-DE', 'GBP': 'en-GB', 'INR': 'en-IN' };
                return new Intl.NumberFormat(localeMap[currency], {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            };

            calculateBtn.addEventListener('click', () => {
                const amount = parseFloat(amountInput.value);
                const period = periodInput.value;
                const hoursPerWeek = parseFloat(hoursPerWeekInput.value);
                const daysPerWeek = parseFloat(daysPerWeekInput.value);

                if (isNaN(amount) || isNaN(hoursPerWeek) || isNaN(daysPerWeek) || amount < 0 || hoursPerWeek <= 0 || daysPerWeek <= 0) {
                    alert('Please enter valid positive numbers.');
                    return;
                }

                // --- CALCULATION LOGIC ---
                // 1. Normalize everything to Annual Salary first
                const weeksPerYear = 52;
                let annualSalary = 0;

                switch (period) {
                    case 'hour':
                        annualSalary = amount * hoursPerWeek * weeksPerYear;
                        break;
                    case 'day':
                        annualSalary = amount * daysPerWeek * weeksPerYear;
                        break;
                    case 'week':
                        annualSalary = amount * weeksPerYear;
                        break;
                    case 'biweek':
                        annualSalary = amount * 26; // 52 / 2
                        break;
                    case 'month':
                        annualSalary = amount * 12;
                        break;
                    case 'year':
                        annualSalary = amount;
                        break;
                }

                // 2. Derive other periods from Annual Salary
                const monthly = annualSalary / 12;
                const biweekly = annualSalary / 26;
                const weekly = annualSalary / weeksPerYear;
                const daily = weekly / daysPerWeek;
                const hourly = weekly / hoursPerWeek;

                // --- UPDATE UI ---
                annualResult.textContent = formatMoney(annualSalary);
                monthlyResult.textContent = formatMoney(monthly);
                biweeklyResult.textContent = formatMoney(biweekly);
                weeklyResult.textContent = formatMoney(weekly);
                dailyResult.textContent = formatMoney(daily);
                hourlyResult.textContent = formatMoney(hourly);

                // --- UPDATE CHART ---
                // Calculate % of year spent working (based on days)
                // Total days in year = 365
                // Working days = daysPerWeek * 52
                const workingDays = daysPerWeek * 52;
                let workPercent = (workingDays / 365) * 100;

                // Clamp
                if (workPercent > 100) workPercent = 100;

                donutChart.style.setProperty('--p', `${workPercent}%`);
                donutPercent.textContent = `${workPercent.toFixed(0)}% Year`;

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });