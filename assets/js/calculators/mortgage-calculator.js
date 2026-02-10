/* mortgage-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const homePriceInput = document.getElementById('homePrice');
            const downPaymentInput = document.getElementById('downPayment');
            const loanTermInput = document.getElementById('loanTerm');
            const interestRateInput = document.getElementById('interestRate');
            const propertyTaxInput = document.getElementById('propertyTax');
            const homeInsuranceInput = document.getElementById('homeInsurance');
            const currencySelect = document.getElementById('currency');

            // Table Controls
            const scheduleViewSelect = document.getElementById('scheduleView');
            const exportBtn = document.getElementById('exportBtn');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const monthlyPaymentEl = document.getElementById('monthlyPayment');
            const loanAmountEl = document.getElementById('loanAmount');
            const totalInterestEl = document.getElementById('totalInterest');
            const totalPaidEl = document.getElementById('totalPaid');
            const breakdownTable = document.getElementById('breakdownTable');
            const donutChart = document.getElementById('donutChart');

            // Global Data
            let rawScheduleData = [];

            // Search Hiding Logic
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

            // --- CALCULATION LOGIC ---
            calculateBtn.addEventListener('click', () => {
                const price = parseFloat(homePriceInput.value);
                const down = parseFloat(downPaymentInput.value) || 0;
                const years = parseFloat(loanTermInput.value);
                const rate = parseFloat(interestRateInput.value) / 100;
                const tax = parseFloat(propertyTaxInput.value) || 0;
                const insurance = parseFloat(homeInsuranceInput.value) || 0;

                if (isNaN(price) || isNaN(rate) || price <= 0 || rate < 0) {
                    alert('Please enter valid numbers for home price and interest rate.');
                    return;
                }

                if (down >= price) {
                    alert('Down payment must be less than home price.');
                    return;
                }

                // 1. Calculate Core Numbers
                const loanPrincipal = price - down;
                const monthlyRate = rate / 12;
                const numPayments = years * 12;

                // P&I Calculation
                let monthlyPI;
                if (monthlyRate === 0) {
                    monthlyPI = loanPrincipal / numPayments;
                } else {
                    monthlyPI = loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
                }

                // Escrow Calculation
                const monthlyTax = tax / 12;
                const monthlyIns = insurance / 12;
                const monthlyEscrow = monthlyTax + monthlyIns;
                const totalMonthly = monthlyPI + monthlyEscrow;

                // Totals
                const totalPrincipalInterest = monthlyPI * numPayments;
                const totalInterest = totalPrincipalInterest - loanPrincipal;
                const totalCost = totalPrincipalInterest + (tax * years) + (insurance * years);

                // 2. Generate Data Array
                rawScheduleData = [];
                let balance = loanPrincipal;

                for (let m = 1; m <= numPayments; m++) {
                    const interestPayment = balance * monthlyRate;
                    let principalPayment = monthlyPI - interestPayment;

                    // Fix rounding on last payment
                    if (balance - principalPayment < 0.01) {
                        principalPayment = balance;
                    }

                    balance -= principalPayment;
                    if (balance < 0) balance = 0;

                    rawScheduleData.push({
                        month: m,
                        year: Math.ceil(m / 12),
                        principal: principalPayment,
                        interest: interestPayment,
                        escrow: monthlyEscrow,
                        total: principalPayment + interestPayment + monthlyEscrow,
                        balance: balance
                    });
                }

                // 3. Update UI Summary
                monthlyPaymentEl.textContent = formatMoney(totalMonthly);
                loanAmountEl.textContent = formatMoney(loanPrincipal);
                totalInterestEl.textContent = formatMoney(totalInterest);
                totalPaidEl.textContent = formatMoney(totalCost);

                // 4. Update Donut Chart
                const piPercent = (monthlyPI / totalMonthly) * 100;
                const taxPercent = (monthlyTax / totalMonthly) * 100;

                // Cumulative stops
                const p1 = piPercent;
                const p2 = piPercent + taxPercent;

                donutChart.style.setProperty('--pi', `${p1}%`);
                donutChart.style.setProperty('--tax', `${p2}%`);

                // 5. Render Table
                renderTable();

                resultContainer.style.display = 'block';
                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // --- TABLE RENDER FUNCTION ---
            function renderTable() {
                const viewMode = scheduleViewSelect.value;
                breakdownTable.innerHTML = '';

                if (viewMode === 'monthly') {
                    // Render All Rows
                    rawScheduleData.forEach(row => {
                        const tr = `
                        <tr>
                            <td>Month ${row.month}</td>
                            <td>${formatMoney(row.principal)}</td>
                            <td>${formatMoney(row.interest)}</td>
                            <td>${formatMoney(row.escrow)}</td>
                            <td>${formatMoney(row.total)}</td>
                            <td><strong>${formatMoney(row.balance)}</strong></td>
                        </tr>
                    `;
                        breakdownTable.innerHTML += tr;
                    });
                } else {
                    // Render Aggregate Years
                    let yrP = 0, yrI = 0, yrE = 0, yrT = 0;
                    let currentYear = 1;

                    rawScheduleData.forEach((row, index) => {
                        yrP += row.principal;
                        yrI += row.interest;
                        yrE += row.escrow;
                        yrT += row.total;

                        if (row.month % 12 === 0 || index === rawScheduleData.length - 1) {
                            const tr = `
                            <tr>
                                <td>Year ${currentYear}</td>
                                <td>${formatMoney(yrP)}</td>
                                <td>${formatMoney(yrI)}</td>
                                <td>${formatMoney(yrE)}</td>
                                <td>${formatMoney(yrT)}</td>
                                <td><strong>${formatMoney(row.balance)}</strong></td>
                            </tr>
                        `;
                            breakdownTable.innerHTML += tr;

                            // Reset
                            yrP = 0; yrI = 0; yrE = 0; yrT = 0;
                            currentYear++;
                        }
                    });
                }
            }

            // --- CSV EXPORT ---
            function exportCSV() {
                if (rawScheduleData.length === 0) {
                    alert("Please calculate first.");
                    return;
                }

                const viewMode = scheduleViewSelect.value;
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Period,Principal,Interest,Tax & Insurance,Total Payment,Balance\n";

                if (viewMode === 'monthly') {
                    rawScheduleData.forEach(row => {
                        csvContent += `Month ${row.month},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.escrow.toFixed(2)},${row.total.toFixed(2)},${row.balance.toFixed(2)}\n`;
                    });
                } else {
                    let yrP = 0, yrI = 0, yrE = 0, yrT = 0, yr = 1;
                    rawScheduleData.forEach((row, index) => {
                        yrP += row.principal;
                        yrI += row.interest;
                        yrE += row.escrow;
                        yrT += row.total;

                        if (row.month % 12 === 0 || index === rawScheduleData.length - 1) {
                            csvContent += `Year ${yr},${yrP.toFixed(2)},${yrI.toFixed(2)},${yrE.toFixed(2)},${yrT.toFixed(2)},${row.balance.toFixed(2)}\n`;
                            yrP = 0; yrI = 0; yrE = 0; yrT = 0; yr++;
                        }
                    });
                }

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `mortgage_schedule_${viewMode}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Listeners
            scheduleViewSelect.addEventListener('change', renderTable);
            exportBtn.addEventListener('click', exportCSV);
        });