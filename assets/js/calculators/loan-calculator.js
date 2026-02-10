/* loan-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', function () {
            // Init UI
            document.getElementById('enableExtraPayments').checked = false;
            document.getElementById('enableFees').checked = false;

            // Toggles
            document.getElementById('enableExtraPayments').addEventListener('change', function () {
                const section = document.getElementById('extraPaymentSection');
                const inputs = section.querySelectorAll('input');
                section.style.display = this.checked ? 'block' : 'none';
                inputs.forEach(i => i.disabled = !this.checked);
            });

            document.getElementById('enableFees').addEventListener('change', function () {
                const section = document.getElementById('feesSection');
                const inputs = section.querySelectorAll('input');
                section.style.display = this.checked ? 'block' : 'none';
                inputs.forEach(i => i.disabled = !this.checked);
            });

            // Freq Buttons
            document.querySelectorAll('.neo-freq-btn[data-frequency]').forEach(btn => {
                btn.addEventListener('click', function () {
                    const group = this.parentElement;
                    group.querySelectorAll('.neo-freq-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    const freq = this.dataset.frequency;
                    document.getElementById('startMonthGroup').style.display = freq === 'onetime' ? 'none' : 'block';
                    document.getElementById('oneTimeMonthGroup').style.display = freq === 'onetime' ? 'block' : 'none';

                    document.getElementById('startMonth').disabled = freq === 'onetime';
                    document.getElementById('oneTimeMonth').disabled = freq !== 'onetime';
                });
            });

            // Toggle Schedule
            document.getElementById('toggleScheduleBtn').addEventListener('click', function () {
                const container = document.getElementById('scheduleContainer');
                const isHidden = container.style.display === 'none' || container.style.display === '';
                container.style.display = isHidden ? 'block' : 'none';
                this.textContent = isHidden ? 'Hide Payment Schedule ▲' : 'View Payment Schedule ▼';
            });

            // Format Currency Input
            ['loanAmount', 'extraPaymentAmount', 'closingCosts', 'otherFees'].forEach(id => {
                const el = document.getElementById(id);
                el.addEventListener('input', function () {
                    this.value = this.value.replace(/[^0-9.]/g, '');
                });
            });

            // Calculate
            document.getElementById('calculateBtn').addEventListener('click', calculateLoan);
            document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
            document.getElementById('scheduleView').addEventListener('change', () => {
                if (window.amortizationSchedule) renderTable(document.getElementById('scheduleView').value);
            });

            // Auto Calc on Load
            calculateLoan();

            function calculateLoan() {
                const principal = parseFloat(document.getElementById('loanAmount').value) || 0;
                const rate = parseFloat(document.getElementById('interestRate').value) || 0;
                const years = parseFloat(document.getElementById('loanTerm').value) || 0;

                if (principal <= 0 || years <= 0) return;

                // Fees
                const feesEnabled = document.getElementById('enableFees').checked;
                const origination = feesEnabled ? (parseFloat(document.getElementById('originationFee').value) || 0) / 100 * principal : 0;
                const closing = feesEnabled ? parseFloat(document.getElementById('closingCosts').value) || 0 : 0;
                const other = feesEnabled ? parseFloat(document.getElementById('otherFees').value) || 0 : 0;
                const totalFees = origination + closing + other;

                // Extra Payments
                const extraEnabled = document.getElementById('enableExtraPayments').checked;
                const extraAmount = extraEnabled ? parseFloat(document.getElementById('extraPaymentAmount').value) || 0 : 0;
                const freqBtn = document.querySelector('.neo-freq-btn.active');
                const freq = freqBtn ? freqBtn.dataset.frequency : 'monthly';
                const startM = parseInt(document.getElementById('startMonth').value) || 1;
                const oneTimeM = parseInt(document.getElementById('oneTimeMonth').value) || 1;

                const monthlyRate = rate / 100 / 12;
                const totalMonths = Math.round(years * 12);

                // Standard Payment
                let monthlyPayment = 0;
                if (monthlyRate === 0) monthlyPayment = principal / totalMonths;
                else monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

                // Generate Schedule
                let balance = principal;
                const schedule = [];
                let totalInterest = 0;
                let totalPaid = 0;
                let actualMonths = 0;

                const today = new Date();

                for (let m = 1; m <= totalMonths * 1.5; m++) {
                    if (balance <= 0.01) break; // Loan paid off

                    const interest = balance * monthlyRate;
                    let principalPart = monthlyPayment - interest;
                    let extra = 0;

                    // Apply Extra
                    if (extraEnabled) {
                        if (freq === 'monthly' && m >= startM) extra = extraAmount;
                        if (freq === 'yearly' && m >= startM && (m - startM) % 12 === 0) extra = extraAmount;
                        if (freq === 'onetime' && m === oneTimeM) extra = extraAmount;
                    }

                    // Don't overpay
                    if (principalPart + extra > balance) {
                        extra = Math.max(0, balance - principalPart);
                        principalPart = balance;
                    } else {
                        principalPart += extra;
                    }

                    balance -= principalPart;
                    if (balance < 0) balance = 0;

                    totalInterest += interest;
                    totalPaid += (interest + principalPart);
                    actualMonths = m;

                    const date = new Date(today.getFullYear(), today.getMonth() + m, 1);

                    schedule.push({
                        number: m,
                        date: date,
                        payment: interest + principalPart,
                        principal: principalPart,
                        interest: interest,
                        balance: balance,
                        extra: extra
                    });
                }

                window.amortizationSchedule = schedule;

                // Update UI
                document.getElementById('monthlyPayment').textContent = '$' + monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('totalPayment').textContent = '$' + (totalPaid + totalFees).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('totalInterest').textContent = '$' + totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                document.getElementById('totalFees').textContent = '$' + totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                // Savings
                const originalInterest = (monthlyPayment * totalMonths) - principal;
                const saved = Math.max(0, originalInterest - totalInterest);
                document.getElementById('interestSaved').textContent = '$' + saved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                const monthsSaved = Math.max(0, totalMonths - actualMonths);
                const yearsSaved = Math.floor(monthsSaved / 12);
                const mSaved = monthsSaved % 12;
                document.getElementById('timeSaved').textContent = (yearsSaved > 0 ? yearsSaved + ' yr ' : '') + mSaved + ' mo';

                document.getElementById('results').style.display = 'block';
                renderTable(document.getElementById('scheduleView').value);
            }

            function renderTable(view) {
                const tbody = document.getElementById('scheduleBody');
                tbody.innerHTML = '';

                if (!window.amortizationSchedule) return;

                const headRow = document.querySelector('#amortizationTable thead tr');

                if (view === 'yearly') {
                    headRow.innerHTML = '<th>Year</th><th>Total Paid</th><th>Principal</th><th>Interest</th><th>Balance</th>';

                    // Aggregate yearly
                    let currentYear = window.amortizationSchedule[0].date.getFullYear();
                    let yPaid = 0, yPrin = 0, yInt = 0, yBal = 0;

                    window.amortizationSchedule.forEach((row, index) => {
                        const rowYear = row.date.getFullYear();
                        if (rowYear !== currentYear) {
                            // Print previous year
                            tbody.innerHTML += `<tr><td>${currentYear}</td><td>$${yPaid.toFixed(2)}</td><td>$${yPrin.toFixed(2)}</td><td>$${yInt.toFixed(2)}</td><td>$${yBal.toFixed(2)}</td></tr>`;
                            currentYear = rowYear;
                            yPaid = 0; yPrin = 0; yInt = 0;
                        }
                        yPaid += row.payment;
                        yPrin += row.principal;
                        yInt += row.interest;
                        yBal = row.balance;

                        // Print last year
                        if (index === window.amortizationSchedule.length - 1) {
                            tbody.innerHTML += `<tr><td>${currentYear}</td><td>$${yPaid.toFixed(2)}</td><td>$${yPrin.toFixed(2)}</td><td>$${yInt.toFixed(2)}</td><td>$${yBal.toFixed(2)}</td></tr>`;
                        }
                    });

                } else {
                    headRow.innerHTML = '<th>Date</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th>';
                    window.amortizationSchedule.forEach(row => {
                        const dateStr = row.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        tbody.innerHTML += `<tr>
                        <td>${dateStr}</td>
                        <td>$${row.payment.toFixed(2)}</td>
                        <td>$${row.principal.toFixed(2)}</td>
                        <td>$${row.interest.toFixed(2)}</td>
                        <td>$${row.balance.toFixed(2)}</td>
                    </tr>`;
                    });
                }
            }

            function downloadCSV() {
                if (!window.amortizationSchedule) return;
                let csv = "Month,Payment,Principal,Interest,Balance\n";
                window.amortizationSchedule.forEach(row => {
                    csv += `${row.number},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'loan_schedule.csv';
                a.click();
            }
        });