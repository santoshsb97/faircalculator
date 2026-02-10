/* savings-calculator - Lazy Loaded JavaScript */

let monthlyScheduleData = [];
        const formatCurrency = (amount) => isNaN(amount) ? '$0.00' : '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // --- SEARCH HIDING ---
        const searchInput = document.getElementById('searchInput');
        const toolContainer = document.getElementById('tool-container');
        if (searchInput && toolContainer) {
            searchInput.addEventListener('input', (e) => {
                toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
            });
        }

        // --- CALCULATION ---
        function calculateSavings() {
            const initial = parseFloat(document.getElementById('initial').value) || 0;
            const monthly = parseFloat(document.getElementById('monthly').value) || 0;
            const yearly = parseFloat(document.getElementById('yearly').value) || 0;
            const years = parseFloat(document.getElementById('years').value) || 0;
            const rate = parseFloat(document.getElementById('rate').value) || 0;
            const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
            const compoundValue = document.getElementById('compound').value;

            if (years <= 0 || rate < 0 || taxRate < 0) { alert('Please check your inputs.'); return; }

            const r_annual = rate / 100;
            const r_tax = taxRate / 100;
            const r_afterTax = r_annual * (1 - r_tax);
            const n = compoundValue === 'continuous' ? 36500 : parseInt(compoundValue);
            const totalMonths = years * 12;
            const rate_per_compounding = r_afterTax / n;

            monthlyScheduleData = [];
            let currentBalance = initial;
            let totalPrincipal = initial;
            let totalInterest = 0;
            let cumulativeMonthlyPrincipal = initial;

            monthlyScheduleData.push({ year: 0, month: 0, principal: initial, deposit: 0, interest: 0, balance: initial });

            for (let month = 1; month <= totalMonths; month++) {
                let interestThisMonth = 0;
                let totalDepositsThisMonth = monthly;
                if (month > 0 && month % 12 === 0) totalDepositsThisMonth += yearly;

                currentBalance += totalDepositsThisMonth;
                totalPrincipal += totalDepositsThisMonth;
                cumulativeMonthlyPrincipal += totalDepositsThisMonth;

                for (let i = 0; i < n / 12; i++) {
                    let intPeriod = currentBalance * rate_per_compounding;
                    currentBalance += intPeriod;
                    interestThisMonth += intPeriod;
                }
                totalInterest += interestThisMonth;

                monthlyScheduleData.push({
                    year: Math.ceil(month / 12),
                    month: month,
                    principal: cumulativeMonthlyPrincipal,
                    deposit: totalDepositsThisMonth,
                    interest: interestThisMonth,
                    balance: currentBalance
                });
            }

            // Update UI
            document.getElementById('result-years').textContent = years;
            document.getElementById('total-value').textContent = formatCurrency(currentBalance);
            document.getElementById('total-detail').textContent = `After ${taxRate.toFixed(1)}% tax`;
            document.getElementById('interest-value').textContent = formatCurrency(totalInterest);
            document.getElementById('contributions-value').textContent = formatCurrency(totalPrincipal);

            const contPct = Math.min(100, (totalPrincipal / currentBalance) * 100);
            const intPct = Math.min(100, (totalInterest / currentBalance) * 100);

            document.getElementById('chart-contributions').style.width = contPct + '%';
            document.getElementById('chart-contributions-percent').textContent = contPct.toFixed(1) + '%';
            document.getElementById('chart-interest').style.width = intPct + '%';
            document.getElementById('chart-interest-percent').textContent = intPct.toFixed(1) + '%';

            // Show Monthly by default
            displaySchedule('monthly', document.getElementById('view-monthly'));

            // Mobile: Scroll to results
            if (window.innerWidth < 968) {
                document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // --- SCHEDULE ---
        function displaySchedule(viewType, button) {
            const tbody = document.getElementById('schedule-table-body');
            const thead = document.getElementById('schedule-header-row');
            tbody.innerHTML = '';

            document.querySelectorAll('.schedule-controls button').forEach(btn => btn.classList.remove('active'));
            if (button) button.classList.add('active');

            if (!monthlyScheduleData.length) return;

            if (viewType === 'monthly') {
                thead.innerHTML = '<th>Year</th><th>Month</th><th>Deposit</th><th>Interest</th><th>Principal</th><th>Balance</th>';
                monthlyScheduleData.forEach(row => {
                    if (row.month === 0) return;
                    tbody.innerHTML += `<tr>
                        <td>${row.year}</td><td>${row.month % 12 || 12}</td>
                        <td>${formatCurrency(row.deposit)}</td><td>${formatCurrency(row.interest)}</td>
                        <td>${formatCurrency(row.principal)}</td><td>${formatCurrency(row.balance)}</td>
                    </tr>`;
                });
            } else {
                thead.innerHTML = '<th>Year</th><th>Yearly Deposit</th><th>Yearly Interest</th><th>Total Principal</th><th>Balance</th>';
                let yrData = {};
                monthlyScheduleData.forEach(row => {
                    if (row.month === 0) return;
                    if (!yrData[row.year]) yrData[row.year] = { dep: 0, int: 0, prin: 0, bal: 0 };
                    yrData[row.year].dep += row.deposit;
                    yrData[row.year].int += row.interest;
                    yrData[row.year].prin = row.principal;
                    yrData[row.year].bal = row.balance;
                });
                for (const [yr, data] of Object.entries(yrData)) {
                    tbody.innerHTML += `<tr>
                        <td>${yr}</td><td>${formatCurrency(data.dep)}</td><td>${formatCurrency(data.int)}</td>
                        <td>${formatCurrency(data.prin)}</td><td>${formatCurrency(data.bal)}</td>
                    </tr>`;
                }
            }
        }

        function downloadCSV() {
            if (!monthlyScheduleData.length) { alert("Calculate first!"); return; }
            let csv = "Year,Month,Deposit,Interest,Principal,Balance\n";
            monthlyScheduleData.forEach(r => {
                if (r.month === 0) return;
                csv += `${r.year},${r.month % 12 || 12},${r.deposit.toFixed(2)},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'savings_schedule.csv';
            a.click();
        }

        function toggleFAQ(btn) {
            btn.classList.toggle('open');
            const ans = btn.nextElementSibling;
            ans.classList.toggle('show');
        }

        window.onload = calculateSavings;