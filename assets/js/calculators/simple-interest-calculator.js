/* simple-interest-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const calculateBtn = document.getElementById('calculateBtn');
            const resultContainer = document.getElementById('resultContainer');
            const errorBox = document.getElementById('errorBox');
            const donutChart = document.getElementById('donutChart');
            const donutText = document.getElementById('donutText');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Calculation Logic
            calculateBtn.addEventListener('click', () => {
                const P = parseFloat(document.getElementById('principal').value);
                const R = parseFloat(document.getElementById('rate').value);
                const T = parseFloat(document.getElementById('timeValue').value);
                const unit = document.getElementById('timeUnit').value;
                const currency = document.getElementById('currency').value;

                if (isNaN(P) || isNaN(R) || isNaN(T) || P <= 0 || T <= 0) {
                    errorBox.style.display = 'block';
                    resultContainer.style.display = 'none';
                    return;
                }
                errorBox.style.display = 'none';

                // Format helper
                const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency });

                // Calculate
                const timeInYears = unit === 'months' ? T / 12 : T;
                const totalInterest = (P * R * timeInYears) / 100;
                const totalAmount = P + totalInterest;

                // Update UI
                document.getElementById('totalAmount').innerText = formatter.format(totalAmount);
                document.getElementById('displayPrincipal').innerText = formatter.format(P);
                document.getElementById('interest').innerText = formatter.format(totalInterest);

                // Chart Animation
                let interestPercent = (totalInterest / totalAmount) * 100;
                if (interestPercent > 100) interestPercent = 100; // Visual clamp

                requestAnimationFrame(() => {
                    donutChart.style.setProperty('--p', `${interestPercent}%`);
                });
                donutText.innerText = `${interestPercent.toFixed(1)}%`;

                // Table Generation
                const tableBody = document.getElementById('breakdownTable');
                tableBody.innerHTML = '';
                const loops = Math.ceil(T);
                const interestPerUnit = (P * R) / (unit === 'years' ? 100 : 1200);

                for (let i = 1; i <= loops; i++) {
                    let accInterest = interestPerUnit * i;
                    let label = `${unit === 'years' ? 'Year' : 'Month'} ${i}`;

                    if (i === loops && T % 1 !== 0) {
                        accInterest = totalInterest; // Precise total for partial last period
                        label = 'End';
                    }

                    const row = `<tr>
                        <td>${label}</td>
                        <td>${formatter.format(P)}</td>
                        <td>${formatter.format(accInterest)}</td>
                        <td><strong>${formatter.format(P + accInterest)}</strong></td>
                    </tr>`;
                    tableBody.innerHTML += row;
                }

                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });