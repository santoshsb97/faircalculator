/* gold-loan-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', function () {
            // DOM Elements
            const goldWeightInput = document.getElementById('goldWeight');
            const goldPuritySelect = document.getElementById('goldPurity');
            const goldPriceInput = document.getElementById('goldPrice');
            const ltvRatioSlider = document.getElementById('ltvRatio');
            const interestRateInput = document.getElementById('interestRate');
            const loanTermInput = document.getElementById('loanTerm');

            const ltvValueSpan = document.getElementById('ltvValue');
            const goldValueResult = document.getElementById('goldValueResult');
            const loanAmountResult = document.getElementById('loanAmountResult');
            const emiResult = document.getElementById('emiResult');
            const totalInterestResult = document.getElementById('totalInterestResult');

            const toggleButton = document.getElementById('toggleAmortizationButton');
            const exportButton = document.getElementById('exportCsvButton');
            const amortizationSection = document.getElementById('amortizationSection');
            const amortizationTableBody = document.getElementById('amortizationTableBody');

            const TROY_OUNCE_IN_GRAMS = 31.1035;
            let loanData = {};

            function formatCurrency(value) {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            }

            function calculateLoan() {
                const weightGrams = parseFloat(goldWeightInput.value) || 0;
                const purityKarat = parseInt(goldPuritySelect.value);
                const pricePerOunce = parseFloat(goldPriceInput.value) || 0;
                const ltvRatio = parseInt(ltvRatioSlider.value);
                const annualInterestRate = parseFloat(interestRateInput.value) || 0;
                const termMonths = parseInt(loanTermInput.value) || 0;

                ltvValueSpan.textContent = ltvRatio + '%';

                if (weightGrams <= 0 || pricePerOunce <= 0 || termMonths <= 0) {
                    goldValueResult.textContent = formatCurrency(0);
                    loanAmountResult.textContent = formatCurrency(0);
                    emiResult.textContent = formatCurrency(0);
                    totalInterestResult.textContent = formatCurrency(0);
                    loanData = {};
                    amortizationTableBody.innerHTML = '';
                    return;
                }

                const purityDecimal = purityKarat / 24;
                const pureGoldGrams = weightGrams * purityDecimal;
                const pricePerGram = pricePerOunce / TROY_OUNCE_IN_GRAMS;
                const totalGoldValue = pureGoldGrams * pricePerGram;
                const principal = totalGoldValue * (ltvRatio / 100);

                let emi = 0, totalInterest = 0;
                const monthlyRate = annualInterestRate / 100 / 12;

                if (monthlyRate > 0) {
                    const ratePower = Math.pow(1 + monthlyRate, termMonths);
                    emi = principal * monthlyRate * ratePower / (ratePower - 1);
                    totalInterest = (emi * termMonths) - principal;
                } else {
                    emi = principal / termMonths;
                    totalInterest = 0;
                }

                loanData = { principal, emi, termMonths, monthlyRate };

                goldValueResult.textContent = formatCurrency(totalGoldValue);
                loanAmountResult.textContent = formatCurrency(principal);
                emiResult.textContent = formatCurrency(emi);
                totalInterestResult.textContent = formatCurrency(totalInterest);

                generateAmortizationSchedule();
            }

            function generateAmortizationSchedule() {
                amortizationTableBody.innerHTML = '';
                const { principal, emi, termMonths, monthlyRate } = loanData;
                if (!principal) return;

                let balance = principal;
                for (let i = 1; i <= termMonths; i++) {
                    const interestPayment = balance * monthlyRate;
                    const principalPayment = emi - interestPayment;
                    balance -= principalPayment;
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${i}</td>
                        <td>${formatCurrency(principalPayment)}</td>
                        <td>${formatCurrency(interestPayment)}</td>
                        <td>${formatCurrency(emi)}</td>
                        <td>${formatCurrency(Math.max(0, balance))}</td>`;
                    amortizationTableBody.appendChild(row);
                }
            }

            function exportToCsv() {
                if (!loanData.principal) return;
                let csv = "Month,Principal,Interest,Payment,Balance\n";
                const rows = amortizationTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const cols = row.querySelectorAll('td');
                    csv += Array.from(cols).map(c => c.textContent.replace(/[$,]/g, '')).join(',') + "\n";
                });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', 'gold-loan-schedule.csv');
                a.click();
            }

            [goldWeightInput, goldPuritySelect, goldPriceInput, ltvRatioSlider, interestRateInput, loanTermInput].forEach(inp => {
                inp.addEventListener('input', calculateLoan);
            });

            toggleButton.addEventListener('click', () => {
                const isHidden = amortizationSection.style.display !== 'block';
                amortizationSection.style.display = isHidden ? 'block' : 'none';
                toggleButton.textContent = isHidden ? 'Hide Amortization Schedule' : 'Show Amortization Schedule';
            });

            exportButton.addEventListener('click', exportToCsv);

            // Hide tool container on search
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            calculateLoan();
        });