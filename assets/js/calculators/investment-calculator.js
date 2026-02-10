/* investment-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const initialInput = document.getElementById('initialInvestment');
            const rateInput = document.getElementById('returnRate');
            const yearsInput = document.getElementById('investmentYears');
            const contribAmountInput = document.getElementById('contribAmount');
            const contribFreqInput = document.getElementById('contribFreq');
            const currencySelect = document.getElementById('currency');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const finalValueEl = document.getElementById('finalValue');
            const totalContribEl = document.getElementById('totalContributions');
            const totalReturnsEl = document.getElementById('totalReturns');
            const breakdownTable = document.getElementById('breakdownTable');
            const growthChart = document.getElementById('growthChart');

            // Search Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Format Helper
            const formatMoney = (amount) => {
                const currency = currencySelect.value;
                const localeMap = { 'USD': 'en-US', 'EUR': 'de-DE', 'GBP': 'en-GB', 'INR': 'en-IN' };
                return new Intl.NumberFormat(localeMap[currency], {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            };

            calculateBtn.addEventListener('click', () => {
                const initial = parseFloat(initialInput.value) || 0;
                const rate = parseFloat(rateInput.value) / 100;
                const years = parseFloat(yearsInput.value);
                const contribAmount = parseFloat(contribAmountInput.value) || 0;
                const frequency = contribFreqInput.value;

                if (isNaN(initial) || isNaN(rate) || isNaN(years) || years <= 0) {
                    alert('Please enter valid positive numbers for rate and years.');
                    return;
                }

                // --- CALCULATION LOGIC ---
                let currentBalance = initial;
                let totalInvested = initial;
                let chartData = [];

                breakdownTable.innerHTML = '';
                growthChart.innerHTML = '';

                const totalMonths = years * 12;
                const monthlyRate = rate / 12;

                // Loop Month by Month
                for (let m = 1; m <= totalMonths; m++) {

                    // 1. Apply Investment Return (Compounded Monthly)
                    const interest = currentBalance * monthlyRate;
                    currentBalance += interest;

                    // 2. Add Additional Contribution based on Frequency
                    let amountToAdd = 0;

                    if (frequency === 'monthly') {
                        amountToAdd = contribAmount;
                    }
                    else if (frequency === 'quarterly') {
                        // Add on months 3, 6, 9, 12...
                        if (m % 3 === 0) amountToAdd = contribAmount;
                    }
                    else if (frequency === 'annually') {
                        // Add on month 12, 24...
                        if (m % 12 === 0) amountToAdd = contribAmount;
                    }
                    else if (frequency === 'weekly') {
                        // Approximation: 52 weeks / 12 months = ~4.33 weeks per month
                        amountToAdd = (contribAmount * 52) / 12;
                    }

                    currentBalance += amountToAdd;
                    totalInvested += amountToAdd;

                    // 3. Record Yearly Data
                    if (m % 12 === 0) {
                        const year = m / 12;
                        const totalProfit = currentBalance - totalInvested;

                        // Add Row
                        const row = `
                        <tr>
                            <td>Year ${year}</td>
                            <td>${formatMoney(totalInvested)}</td>
                            <td>${formatMoney(totalProfit)}</td>
                            <td><strong>${formatMoney(currentBalance)}</strong></td>
                        </tr>
                    `;
                        breakdownTable.innerHTML += row;

                        // Push Data for Chart
                        chartData.push({ year, invested: totalInvested, profit: totalProfit, total: currentBalance });
                    }
                }

                // --- RESULTS ---
                const finalProfit = currentBalance - totalInvested;

                finalValueEl.textContent = formatMoney(currentBalance);
                totalContribEl.textContent = formatMoney(totalInvested);
                totalReturnsEl.textContent = formatMoney(finalProfit);

                // --- DRAW CHART ---
                const maxVal = chartData[chartData.length - 1].total;

                chartData.forEach(data => {
                    const heightPercent = (data.total / maxVal) * 100;
                    const profitHeightPercent = (data.profit / data.total) * 100;

                    const bar = document.createElement('div');
                    bar.className = 'chart-bar';
                    bar.style.height = `${heightPercent}%`;
                    bar.title = `Year ${data.year}: ${formatMoney(data.total)}`;

                    // Profit Overlay
                    const profitDiv = document.createElement('div');
                    profitDiv.className = 'bar-interest';
                    profitDiv.style.height = `${profitHeightPercent}%`;

                    bar.appendChild(profitDiv);
                    growthChart.appendChild(bar);
                });

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });