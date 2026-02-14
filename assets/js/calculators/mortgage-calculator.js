/* mortgage-calculator-FIXED.js */

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT REFS ---
    const calculateBtn = document.getElementById('calculateBtn');
    const inputs = {
        price: document.getElementById('homePrice'),
        down: document.getElementById('downPayment'),
        rate: document.getElementById('interestRate'),
        term: document.getElementById('loanTerm'),
        tax: document.getElementById('propertyTax'),
        ins: document.getElementById('homeInsurance'),
        pmi: document.getElementById('pmi'),
        hoa: document.getElementById('hoaFees')
    };

    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    const resultContainer = document.getElementById('resultContainer');
    const amortizationSection = document.getElementById('amortizationSection');

    // Chart Instance
    let breakdownChart = null;

    // --- INITIALIZATION ---
    initEventListeners();

    // --- EVENT LISTENERS ---
    function initEventListeners() {
        calculateBtn.addEventListener('click', calculateMortgage);

        // Advanced Toggle
        advancedToggle.addEventListener('click', () => {
            advancedOptions.classList.toggle('open');
            const icon = advancedToggle.querySelector('.fa-chevron-down');
            icon.style.transform = advancedOptions.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
        });

        // Dynamic Down Payment Badge
        inputs.down.addEventListener('input', updateDownPaymentBadge);
        inputs.price.addEventListener('input', updateDownPaymentBadge);

        // Print
        document.getElementById('printBtn').addEventListener('click', () => window.print());

        // Amortization Toggles
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderAmortizationTable(currentSchedule, e.target.dataset.view);
            });
        });

        // View Schedule Button
        document.getElementById('viewScheduleBtn').addEventListener('click', () => {
            amortizationSection.style.display = 'block';
            amortizationSection.scrollIntoView({ behavior: 'smooth' });
        });

        // Export CSV
        document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    }

    function updateDownPaymentBadge() {
        const price = parseFloat(inputs.price.value) || 0;
        const down = parseFloat(inputs.down.value) || 0;
        const badge = document.getElementById('downPaymentPercent');

        if (price > 0) {
            const pct = (down / price) * 100;
            badge.textContent = pct.toFixed(1) + '%';
        } else {
            badge.textContent = '--%';
        }
    }

    // --- CALCULATION LOGIC ---
    let currentSchedule = [];

    function calculateMortgage() {
        // 1. Get Values
        const price = parseFloat(inputs.price.value);
        const down = parseFloat(inputs.down.value) || 0;
        const rate = parseFloat(inputs.rate.value);
        const term = parseInt(inputs.term.value);
        const taxYear = parseFloat(inputs.tax.value) || 0;
        const insYear = parseFloat(inputs.ins.value) || 0;
        let pmiMonth = parseFloat(inputs.pmi.value) || 0;
        const hoaMonth = parseFloat(inputs.hoa.value) || 0;

        // 2. Validation
        if (!price || !rate || !term) {
            showError("Please fill in Home Price, Interest Rate, and Loan Term.");
            return;
        }
        if (down >= price) {
            showError("Down Payment cannot be greater than Home Price.");
            return;
        }

        // 3. Auto-Calculate PMI if 0 and < 20% down
        // Default PMI rate ~0.5% of loan amount annually
        const loanAmount = price - down;
        const downPercent = (down / price) * 100;

        if (pmiMonth === 0 && downPercent < 20) {
            // Estimate PMI: 0.5% yearly of loan amount
            pmiMonth = (loanAmount * 0.005) / 12;
            document.getElementById('pmi').value = pmiMonth.toFixed(2); // Update input
        } else if (downPercent >= 20) {
            pmiMonth = 0; // No PMI needed usually
            document.getElementById('pmi').value = 0;
        }

        // 4. Mortgage Formula
        const monthlyRate = (rate / 100) / 12;
        const numPayments = term * 12;

        let monthlyPI = 0;
        if (monthlyRate === 0) {
            monthlyPI = loanAmount / numPayments;
        } else {
            monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        // 5. Generate Schedule to get precise Interest and PMI totals
        currentSchedule = generateSchedule(loanAmount, monthlyRate, monthlyPI, numPayments);

        // Cumulative Totals
        let totalInterest = 0;
        let totalPrincipal = 0;
        let pmiStopMonth = 0;

        const equityTarget = price * 0.20; // 20% equity target to stop PMI

        currentSchedule.forEach((row, idx) => {
            totalInterest += row.interest;
            totalPrincipal += row.principal;
            // PMI stops when down payment + principal paid >= 20% of home price
            if ((down + totalPrincipal) < equityTarget) {
                pmiStopMonth = idx + 1;
            }
        });

        // 6. Lifecycle Components
        const totalTax = taxYear * term;
        const totalIns = insYear * term;
        const totalHOA = hoaMonth * numPayments;
        const totalPMI = pmiMonth * pmiStopMonth;
        const totalLifecycleCost = loanAmount + totalInterest + totalTax + totalIns + totalHOA + totalPMI;

        // Monthly Components (for the header)
        const taxMonth = taxYear / 12;
        const insMonth = insYear / 12;
        const totalMonthly = monthlyPI + taxMonth + insMonth + pmiMonth + hoaMonth;

        // 7. Show Result Container first
        resultContainer.style.display = 'block';

        // 8. Update UI with Total Tenure Data
        updateResults({
            monthly: totalMonthly,
            principal: loanAmount, // Total Principal is the original loan amount
            interest: totalInterest,
            tax: totalTax,
            ins: totalIns,
            pmi: totalPMI,
            hoa: totalHOA,
            totalInterest: totalInterest,
            loanAmount: loanAmount,
            totalCost: totalLifecycleCost,
            payoffDate: new Date(new Date().setMonth(new Date().getMonth() + numPayments))
        });

        // 9. Generate and Render Schedule table
        renderAmortizationTable(currentSchedule, 'yearly');

        // Scroll
        if (window.innerWidth < 850) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function generateSchedule(principal, monthlyRate, monthlyPayment, totalMonths) {
        let balance = principal;
        let schedule = [];

        for (let i = 1; i <= totalMonths; i++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            if (balance < 0) balance = 0;

            schedule.push({
                month: i,
                principal: principalPayment,
                interest: interest,
                balance: balance
            });
        }
        return schedule;
    }

    function updateResults(data) {
        // Main Value
        document.getElementById('monthlyPayment').textContent = formatCurrency(data.monthly);

        // Breakdown Values - Separated P & I
        document.getElementById('valPrincipal').textContent = formatCurrency(data.principal);
        document.getElementById('valInterest').textContent = formatCurrency(data.interest);

        document.getElementById('valTax').textContent = formatCurrency(data.tax);
        document.getElementById('valIns').textContent = formatCurrency(data.ins);

        // PMI & HOA visibility
        const rowPMI = document.getElementById('rowPMI');
        const rowHOA = document.getElementById('rowHOA');

        rowPMI.style.display = data.pmi > 0 ? 'flex' : 'none';
        document.getElementById('valPMI').textContent = formatCurrency(data.pmi);

        rowHOA.style.display = data.hoa > 0 ? 'flex' : 'none';
        document.getElementById('valHOA').textContent = formatCurrency(data.hoa);

        // Summary
        document.getElementById('loanAmount').textContent = formatCurrency(data.loanAmount);
        document.getElementById('totalInterest').textContent = formatCurrency(data.totalInterest);
        document.getElementById('totalCost').textContent = formatCurrency(data.totalCost);
        document.getElementById('payoffDate').textContent = data.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Update Chart
        updateChart(data);
    }

    function updateChart(data) {
        const ctx = document.getElementById('breakdownChart').getContext('2d');

        if (breakdownChart) {
            breakdownChart.destroy();
        }

        breakdownChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest', 'Tax', 'Insurance', 'PMI', 'HOA'],
                datasets: [{
                    data: [data.principal, data.interest, data.tax, data.ins, data.pmi, data.hoa],
                    backgroundColor: ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatCurrency(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    function renderAmortizationTable(schedule, view) {
        const tbody = document.getElementById('scheduleBody');
        tbody.innerHTML = '';

        let dataToRender = [];

        if (view === 'monthly') {
            dataToRender = schedule;
        } else {
            // Group by Year
            let yearly = [];
            let currentYear = 1;
            let yrP = 0, yrI = 0, yrBal = 0;

            schedule.forEach((row, idx) => {
                yrP += row.principal;
                yrI += row.interest;
                yrBal = row.balance;

                if (row.month % 12 === 0 || idx === schedule.length - 1) {
                    yearly.push({
                        label: `Year ${currentYear}`,
                        principal: yrP,
                        interest: yrI,
                        balance: yrBal
                    });
                    yrP = 0; yrI = 0;
                    currentYear++;
                }
            });
            dataToRender = yearly;
        }

        const fragment = document.createDocumentFragment();

        dataToRender.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.label || 'Month ' + row.month}</td>
                <td>${formatCurrency(row.principal)}</td>
                <td>${formatCurrency(row.interest)}</td>
                <td>${formatCurrency(row.balance)}</td>
            `;
            fragment.appendChild(tr);
        });
        tbody.appendChild(fragment);
    }

    function exportToCSV() {
        if (currentSchedule.length === 0) return;

        let csv = "Month,Principal,Interest,Balance\n";
        currentSchedule.forEach(row => {
            csv += `${row.month},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'amortization_schedule.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(num);
    }

    function showError(msg) {
        alert(msg);
    }

});