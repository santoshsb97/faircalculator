/* percentage-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const calcModeSelect = document.getElementById('calcMode');
            const inputsContainer = document.getElementById('inputsContainer');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const mainResultEl = document.getElementById('mainResult');
            const resultLabelEl = document.getElementById('resultLabel');
            const formulaDisplayEl = document.getElementById('formulaDisplay');
            const stepDisplayEl = document.getElementById('stepDisplay');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // CONFIGURATION: 12 MODES
            const modes = {
                "1": { // What is X% of Y?
                    labels: ['Percentage (%)', 'Of Number (Y)'],
                    placeholders: ['e.g., 30', 'e.g., 200'],
                    calculate: (p, y) => (p / 100) * y,
                    formula: (p, y) => `(${p} / 100) × ${y}`,
                    label: "Result"
                },
                "2": { // X is what % of Y?
                    labels: ['Number (X)', 'Of Number (Y)'],
                    placeholders: ['e.g., 40', 'e.g., 160'],
                    calculate: (x, y) => (x / y) * 100,
                    formula: (x, y) => `(${x} / ${y}) × 100`,
                    label: "Percentage",
                    suffix: "%"
                },
                "3": { // Percentage Increase
                    labels: ['Original Value', 'New Value'],
                    placeholders: ['e.g., 50', 'e.g., 65'],
                    calculate: (oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100,
                    formula: (oldVal, newVal) => `((${newVal} - ${oldVal}) / ${oldVal}) × 100`,
                    label: "Increase",
                    suffix: "%"
                },
                "4": { // Percentage Decrease
                    labels: ['Original Value', 'New Value'],
                    placeholders: ['e.g., 80', 'e.g., 60'],
                    calculate: (oldVal, newVal) => ((oldVal - newVal) / oldVal) * 100,
                    formula: (oldVal, newVal) => `((${oldVal} - ${newVal}) / ${oldVal}) × 100`,
                    label: "Decrease",
                    suffix: "%"
                },
                "5": { // Percentage Difference
                    labels: ['Value 1', 'Value 2'],
                    placeholders: ['e.g., 100', 'e.g., 120'],
                    calculate: (v1, v2) => {
                        const diff = Math.abs(v1 - v2);
                        const avg = (v1 + v2) / 2;
                        return (diff / avg) * 100;
                    },
                    formula: (v1, v2) => `|${v1} - ${v2}| / ((${v1} + ${v2})/2) × 100`,
                    label: "Difference",
                    suffix: "%"
                },
                "6": { // Add Percentage (Tax)
                    labels: ['Number', 'Add %'],
                    placeholders: ['e.g., 150', 'e.g., 20'],
                    calculate: (num, p) => num * (1 + (p / 100)),
                    formula: (num, p) => `${num} × (1 + ${p}/100)`,
                    label: "Total Amount"
                },
                "7": { // Subtract Percentage (Discount)
                    labels: ['Number', 'Subtract %'],
                    placeholders: ['e.g., 200', 'e.g., 15'],
                    calculate: (num, p) => num * (1 - (p / 100)),
                    formula: (num, p) => `${num} × (1 - ${p}/100)`,
                    label: "Discounted Price"
                },
                "8": { // Reverse (Find Original from Inclusive)
                    labels: ['Final Value', 'Included % (Tax)'],
                    placeholders: ['e.g., 121', 'e.g., 10'],
                    calculate: (val, p) => val / (1 + (p / 100)),
                    formula: (val, p) => `${val} / (1 + ${p}/100)`,
                    label: "Original Value"
                },
                "9": { // Fraction to Percentage
                    labels: ['Numerator (Top)', 'Denominator (Bottom)'],
                    placeholders: ['e.g., 3', 'e.g., 4'],
                    calculate: (n, d) => (n / d) * 100,
                    formula: (n, d) => `(${n} / ${d}) × 100`,
                    label: "Percentage",
                    suffix: "%"
                },
                "10": { // Percent of Percent
                    labels: ['First %', 'Second %'],
                    placeholders: ['e.g., 50', 'e.g., 20'],
                    calculate: (p1, p2) => (p1 / 100) * (p2 / 100) * 100,
                    formula: (p1, p2) => `(${p1}% × ${p2}%)`,
                    label: "Combined Percent",
                    suffix: "%"
                },
                "11": { // Original Price (Before Sale/Discount)
                    labels: ['Sale Price', 'Discount % Was'],
                    placeholders: ['e.g., 80', 'e.g., 20'],
                    calculate: (sale, d) => sale / (1 - (d / 100)),
                    formula: (sale, d) => `${sale} / (1 - ${d}/100)`,
                    label: "Original Price"
                },
                "12": { // Profit Margin
                    labels: ['Cost', 'Revenue (Sale Price)'],
                    placeholders: ['e.g., 100', 'e.g., 150'],
                    calculate: (cost, rev) => ((rev - cost) / rev) * 100,
                    formula: (cost, rev) => `(${rev} - ${cost}) / ${rev} × 100`,
                    label: "Margin",
                    suffix: "%"
                }
            };

            // --- 1. RENDER INPUTS ---
            function renderInputs() {
                const mode = calcModeSelect.value;
                const config = modes[mode];

                inputsContainer.innerHTML = `
                <div class="input-wrapper" style="margin:0;">
                    <label class="input-header">${config.labels[0]}</label>
                    <input type="number" id="inputA" class="input-field" placeholder="${config.placeholders[0]}" step="any">
                </div>
                <div class="input-wrapper" style="margin:0;">
                    <label class="input-header">${config.labels[1]}</label>
                    <input type="number" id="inputB" class="input-field" placeholder="${config.placeholders[1]}" step="any">
                </div>
            `;
                resultContainer.style.display = 'none';
            }

            // --- 2. CALCULATION LOGIC ---
            calculateBtn.addEventListener('click', () => {
                const mode = calcModeSelect.value;
                const config = modes[mode];

                const valA = parseFloat(document.getElementById('inputA').value);
                const valB = parseFloat(document.getElementById('inputB').value);

                if (isNaN(valA) || isNaN(valB)) {
                    alert('Please enter valid numbers.');
                    return;
                }

                // Division by Zero check
                if ((mode === "2" || mode === "9" || mode === "12") && valB === 0) {
                    alert('Cannot divide by zero.'); return;
                }
                if ((mode === "3" || mode === "4") && valA === 0) {
                    alert('Original value cannot be zero for % change.'); return;
                }

                const result = config.calculate(valA, valB);
                let resultString = parseFloat(result.toFixed(2));

                // Add suffix
                if (config.suffix) {
                    resultString += config.suffix;
                    // Add '+' sign for positive increase/change if applicable
                    if ((mode === "3" || mode === "12") && result > 0) resultString = '+' + resultString;
                }

                // Update UI
                mainResultEl.textContent = resultString;
                resultLabelEl.textContent = config.label;
                formulaDisplayEl.textContent = config.formula(valA, valB);
                stepDisplayEl.textContent = `${config.formula(valA, valB)} = ${resultString}`;

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // Listeners
            calcModeSelect.addEventListener('change', renderInputs);

            // Init
            renderInputs();
        });