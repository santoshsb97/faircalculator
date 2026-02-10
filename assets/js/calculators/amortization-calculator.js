/* amortization-calculator - Lazy Loaded JavaScript */

(function () {
            // Scope to widget ID to prevent conflicts
            const scope = document.getElementById('amortization-calculator-pro-v8');
            const toolContainer = scope; // For search hiding
            const searchInput = document.getElementById('searchInput');

            // Logic to hide tool when searching
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    if (e.target.value.trim().length > 0) {
                        toolContainer.style.display = 'none';
                    } else {
                        toolContainer.style.display = 'block';
                    }
                });
            }

            // --- CALCULATOR LOGIC ---
            if (!scope) return;

            const form = scope.querySelector('#amortization-form');
            const resultDiv = scope.querySelector('#result-summary');
            const scheduleSection = scope.querySelector('#schedule-section');
            const scheduleBody = scope.querySelector('#schedule-table tbody');
            const exportCsvBtn = scope.querySelector('#exportCsvBtn');
            const faqItems = scope.querySelectorAll('.faq-item');

            let lastCalculatedSchedule = [];
            const moneyFormat = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

            form.addEventListener('submit', calculateAndDisplay);
            exportCsvBtn.addEventListener('click', exportToCsv);

            // FAQ Accordion
            faqItems.forEach(item => {
                item.querySelector('.faq-question').addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    faqItems.forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                });
            });

            function calculateAndDisplay(event) {
                if (event) event.preventDefault();

                const loanAmount = parseFloat(scope.querySelector('#loanAmount').value);
                const annualRate = parseFloat(scope.querySelector('#interestRate').value);
                const loanTermYears = parseFloat(scope.querySelector('#loanTerm').value);
                const frequencySelect = scope.querySelector('#paymentFrequency');
                const periodsPerYear = parseInt(frequencySelect.value);
                const frequencyText = frequencySelect.options[frequencySelect.selectedIndex].text;
                const extraPerPeriod = parseFloat(scope.querySelector('#extraPerPayment').value) || 0;
                const oneTimeExtra = parseFloat(scope.querySelector('#oneTimeExtra').value) || 0;

                if (isNaN(loanAmount) || isNaN(annualRate) || isNaN(loanTermYears) || loanAmount <= 0 || annualRate < 0 || loanTermYears <= 0) {
                    resultDiv.innerHTML = "<div style='color:red; margin-top:10px;'>Please enter valid positive numbers.</div>";
                    scheduleSection.style.display = 'none';
                    return;
                }

                // 1. Standard Scenario
                const periodicRate = (annualRate / 100) / periodsPerYear;
                const standardPeriods = loanTermYears * periodsPerYear;
                const standardPayment = calculatePayment(loanAmount, periodicRate, standardPeriods);
                const standardSchedule = generateSchedule(loanAmount, periodicRate, standardPayment, 0, 0);
                const standardTotalInterest = standardSchedule.reduce((acc, row) => acc + row.interest, 0);

                // 2. Extra Scenario
                const extraSchedule = generateSchedule(loanAmount, periodicRate, standardPayment, extraPerPeriod, oneTimeExtra);
                lastCalculatedSchedule = extraSchedule;

                const extraTotalInterest = extraSchedule.reduce((acc, row) => acc + row.interest, 0);
                const interestSaved = standardTotalInterest - extraTotalInterest;
                const yearsSaved = (standardSchedule.length - extraSchedule.length) / periodsPerYear;
                const totalPaid = loanAmount + extraTotalInterest;

                // 3. Display Results
                let savingsHTML = '';
                if (interestSaved > 1.00) {
                    savingsHTML = `<div id="result-savings">You'll save ${moneyFormat(interestSaved)} in interest and pay off your loan ${yearsSaved.toFixed(1)} years sooner!</div>`;
                }

                resultDiv.innerHTML = `
                Your ${frequencyText.split(' (')[0]} Payment: <span id="result-value">${moneyFormat(standardPayment)}</span>
                ${savingsHTML}
                <table class="result-table">
                  <tbody>
                    <tr><td>Principal Amount</td><td>${moneyFormat(loanAmount)}</td></tr>
                    <tr><td>Total Interest</td><td>${moneyFormat(extraTotalInterest)}</td></tr>
                    <tr style="font-weight:bold; border-top:2px solid #ddd;"><td>Total Cost of Loan</td><td>${moneyFormat(totalPaid)}</td></tr>
                  </tbody>
                </table>
            `;

                displaySchedule(extraSchedule);
            }

            function calculatePayment(amount, rate, periods) {
                if (rate === 0) return amount / periods;
                const numerator = rate * Math.pow(1 + rate, periods);
                const denominator = Math.pow(1 + rate, periods) - 1;
                return amount * (numerator / denominator);
            }

            function generateSchedule(amount, rate, standardPayment, extraPerPeriod, oneTimeExtra) {
                const schedule = [];
                let balance = amount;
                let period = 0;
                let isOneTimePaid = false;

                while (balance > 0.01 && period < 10000) {
                    period++;
                    const interest = balance * rate;
                    let currentPayment = standardPayment;
                    let principal = currentPayment - interest;
                    let extra = extraPerPeriod;

                    if (!isOneTimePaid && oneTimeExtra > 0) {
                        extra += oneTimeExtra;
                        isOneTimePaid = true;
                    }

                    if (balance + interest <= currentPayment + extra) {
                        const totalNeeded = balance + interest;
                        principal = balance;
                        extra = Math.max(0, totalNeeded - currentPayment - interest);
                        if (totalNeeded < currentPayment) { currentPayment = totalNeeded; extra = 0; }
                    }

                    balance -= (principal + extra);

                    schedule.push({
                        period: period,
                        payment: currentPayment + extra,
                        principal: principal,
                        interest: interest,
                        extra: extra,
                        balance: Math.max(0, balance)
                    });
                }
                return schedule;
            }

            function displaySchedule(schedule) {
                const scheduleRows = schedule.map(row => `
                <tr>
                    <td>${row.period}</td>
                    <td>${moneyFormat(row.payment)}</td>
                    <td>${moneyFormat(row.principal)}</td>
                    <td>${moneyFormat(row.interest)}</td>
                    <td>${moneyFormat(row.extra)}</td>
                    <td>${moneyFormat(row.balance)}</td>
                </tr>
            `).join('');

                scheduleBody.innerHTML = scheduleRows;
                scheduleSection.style.display = 'block';
            }

            function exportToCsv() {
                if (lastCalculatedSchedule.length === 0) {
                    alert("Please calculate a schedule first.");
                    return;
                }
                const headers = ['Period', 'Total Payment', 'Principal', 'Interest', 'Extra', 'Ending Balance'];
                const rows = lastCalculatedSchedule.map(row => [
                    row.period, row.payment.toFixed(2), row.principal.toFixed(2),
                    row.interest.toFixed(2), row.extra.toFixed(2), row.balance.toFixed(2)
                ]);

                const csvContent = [headers, ...rows].map(e => `"${e.join('","')}"`).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "amortization_schedule.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })();