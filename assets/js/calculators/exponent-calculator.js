/* exponent-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const calculateBtn = document.getElementById('calculateBtn');
            const baseInput = document.getElementById('base');
            const exponentInput = document.getElementById('exponent');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const resultElement = document.getElementById('result');
            const equationElement = document.getElementById('equation');
            const expansionElement = document.getElementById('expansion');
            const sciDisplay = document.getElementById('scientificDisplay');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            calculateBtn.addEventListener('click', () => {
                const base = parseFloat(baseInput.value);
                const exponent = parseFloat(exponentInput.value);

                if (isNaN(base) || isNaN(exponent)) {
                    alert('Please enter valid numbers for both base and exponent.');
                    return;
                }

                // Edge Cases
                if (base === 0 && exponent <= 0) {
                    alert('Result is undefined (0 to negative power or 0^0).');
                    return;
                }

                // Calculation
                const result = Math.pow(base, exponent);

                if (!isFinite(result)) {
                    resultElement.textContent = "Infinity";
                    equationElement.textContent = `${base}^${exponent} = Infinity`;
                    expansionElement.textContent = "Number is too large to display.";
                    sciDisplay.style.display = 'none';
                    resultContainer.style.display = 'block';
                    return;
                }

                // Formatting
                let displayResult;

                // Use scientific notation for very large or very small numbers
                if (Math.abs(result) >= 1e9 || (Math.abs(result) < 1e-4 && result !== 0)) {
                    displayResult = result.toExponential(6);
                } else {
                    // Check if integer
                    if (Number.isInteger(result)) {
                        displayResult = result.toLocaleString('en-US'); // Add commas
                    } else {
                        // Limit decimals
                        displayResult = parseFloat(result.toFixed(8)).toString();
                    }
                }

                // Update UI
                resultElement.textContent = displayResult;

                // Show scientific version separately if standard is shown but long
                if (!displayResult.includes('e') && displayResult.replace(/,/g, '').length > 10) {
                    sciDisplay.textContent = `Scientific: ${result.toExponential(4)}`;
                    sciDisplay.style.display = 'inline-block';
                } else {
                    sciDisplay.style.display = 'none';
                }

                // Generate Steps Text
                let steps = `Equation: ${base}<sup>${exponent}</sup>`;
                let expand = "";

                // Expansion logic for small positive integers
                if (Number.isInteger(exponent) && exponent > 0 && exponent <= 10) {
                    expand = Array(exponent).fill(base).join(" × ");
                    expand = `Expansion: ${expand}`;
                } else if (exponent === 0) {
                    expand = "Any number to the power of 0 is 1.";
                } else if (exponent < 0) {
                    expand = `Negative exponent rule: 1 / ${base}<sup>${Math.abs(exponent)}</sup>`;
                } else if (!Number.isInteger(exponent)) {
                    expand = "Decimal exponent calculation (Roots).";
                }

                equationElement.innerHTML = `${steps} = ${displayResult}`;
                expansionElement.innerHTML = expand;

                resultContainer.style.display = 'block';
                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // Add Enter key support
            document.querySelectorAll('.calculator-form input').forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') calculateBtn.click();
                });
            });
        });