/* compound-interest-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const principalInput = document.getElementById('principal');
            const rateInput = document.getElementById('rate');
            const yearsInput = document.getElementById('years');
            const compoundInput = document.getElementById('compound');
            const contributionInput = document.getElementById('contribution');
            const currencySelect = document.getElementById('currency');
            const exportBtn = document.getElementById('exportBtn');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const futureValueEl = document.getElementById('futureValue');
            const totalPrincipalEl = document.getElementById('totalPrincipal');
            const totalInterestEl = document.getElementById('totalInterest');
            const breakdownTable = document.getElementById('breakdownTable');

            // Chart Elements
            const donutChart = document.getElementById('donutChart');
            const donutPercent = document.getElementById('donutPercent');

            // Global variable to store calculation data for CSV export
            let exportData = [];

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Helper: Format Money
            const formatMoney = (amount) => {
                const currency = currencySelect.value;
                const localeMap = { 'USD': 'en-US', 'EUR': 'de-DE', 'GBP': 'en-GB', 'INR': 'en-IN' };
                return new Intl.NumberFormat(localeMap[currency], {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            };

            // --- CALCULATION FUNCTION ---
            function performCalculation() {
                const P = parseFloat(principalInput.value);
                const annualRate = parseFloat(rateInput.value) / 100;
                const years = parseFloat(yearsInput.value);
                const compoundsPerYear = parseFloat(compoundInput.value);
                const monthlyContribution = parseFloat(contributionInput.value) || 0;

                if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P < 0 || annualRate < 0 || years <= 0) {
                    alert('Please enter valid positive numbers.');
                    return;
                }

                // Logic Initialization
                let currentBalance = P;
                let totalInvested = P;
                exportData = []; // Clear old data
                breakdownTable.innerHTML = '';

                const totalMonths = years * 12;

                // Loop per month
                for (let m = 1; m <= totalMonths; m++) {

                    // 1. Calculate Monthly Interest
                    // Effective Monthly Rate = (1 + r/n)^(n/12) - 1
                    const effectiveMonthlyRate = Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear / 12) - 1;

                    const interestThisMonth = currentBalance * effectiveMonthlyRate;
                    currentBalance += interestThisMonth;

                    // 2. Add Contribution
                    currentBalance += monthlyContribution;
                    totalInvested += monthlyContribution;

                    // 3. Record Yearly Data
                    if (m % 12 === 0) {
                        const year = m / 12;
                        const totalInterestSoFar = currentBalance - totalInvested;

                        // Add to Export Array (Raw Numbers)
                        exportData.push({
                            year: year,
                            invested: totalInvested.toFixed(2),
                            interest: totalInterestSoFar.toFixed(2),
                            balance: currentBalance.toFixed(2)
                        });

                        // Add to HTML Table
                        const row = `
                        <tr>
                            <td>Year ${year}</td>
                            <td>${formatMoney(totalInvested)}</td>
                            <td>${formatMoney(totalInterestSoFar)}</td>
                            <td><strong>${formatMoney(currentBalance)}</strong></td>
                        </tr>
                    `;
                        breakdownTable.innerHTML += row;
                    }
                }

                // --- UPDATE HERO & STATS ---
                const finalBalance = currentBalance;
                const finalInterest = finalBalance - totalInvested;

                futureValueEl.textContent = formatMoney(finalBalance);
                totalPrincipalEl.textContent = formatMoney(totalInvested);
                totalInterestEl.textContent = formatMoney(finalInterest);

                // --- UPDATE DONUT CHART ---
                // Percentage of Interest vs Total
                let interestPercent = (finalInterest / finalBalance) * 100;
                if (interestPercent > 100) interestPercent = 100; // Clamp

                requestAnimationFrame(() => {
                    donutChart.style.setProperty('--p', `${interestPercent}%`); // Set CSS Variable
                });
                donutPercent.textContent = `${interestPercent.toFixed(0)}% Interest`;

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // --- CSV EXPORT FUNCTION ---
            function downloadCSV() {
                if (exportData.length === 0) {
                    alert("Please calculate a scenario first.");
                    return;
                }

                // CSV Header
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Year,Total Invested,Total Interest,Total Balance\n";

                // CSV Rows
                exportData.forEach(row => {
                    csvContent += `${row.year},${row.invested},${row.interest},${row.balance}\n`;
                });

                // Create Download Link
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "compound_interest_schedule.csv");
                document.body.appendChild(link);

                link.click(); // Trigger Download
                document.body.removeChild(link); // Cleanup
            }

            // Listeners
            calculateBtn.addEventListener('click', performCalculation);
            exportBtn.addEventListener('click', downloadCSV);
        });