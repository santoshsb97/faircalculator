/* temperature-converter - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const convertBtn = document.getElementById('convertBtn');
            const tempValue = document.getElementById('tempValue');
            const fromUnit = document.getElementById('fromUnit');
            const toUnit = document.getElementById('toUnit');
            const resultContainer = document.getElementById('resultContainer');
            const resultValue = document.getElementById('resultValue');
            const conversionFormula = document.getElementById('conversionFormula');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Auto-convert on input change
            const performConversion = () => {
                const value = parseFloat(tempValue.value);
                const from = fromUnit.value;
                const to = toUnit.value;

                if (isNaN(value)) {
                    resultContainer.style.display = 'none';
                    return;
                }

                let result;
                let formula = '';

                // Convert to Celsius first (Base Unit)
                let celsius;
                if (from === 'celsius') {
                    celsius = value;
                } else if (from === 'fahrenheit') {
                    celsius = (value - 32) * 5 / 9;
                } else if (from === 'kelvin') {
                    celsius = value - 273.15;
                }

                // Convert from Celsius to target unit
                if (to === 'celsius') {
                    result = celsius;
                    // Formatting formula text
                    if (from === 'fahrenheit') formula = `(${value}°F − 32) × 5/9 = ${result.toFixed(2)}°C`;
                    else if (from === 'kelvin') formula = `${value}K − 273.15 = ${result.toFixed(2)}°C`;
                    else formula = `${value}°C = ${result.toFixed(2)}°C`;
                } else if (to === 'fahrenheit') {
                    result = (celsius * 9 / 5) + 32;
                    if (from === 'celsius') formula = `(${value}°C × 9/5) + 32 = ${result.toFixed(2)}°F`;
                    else if (from === 'kelvin') formula = `(${value}K − 273.15) × 9/5 + 32 = ${result.toFixed(2)}°F`;
                    else formula = `${value}°F = ${result.toFixed(2)}°F`;
                } else if (to === 'kelvin') {
                    result = celsius + 273.15;
                    if (from === 'celsius') formula = `${value}°C + 273.15 = ${result.toFixed(2)}K`;
                    else if (from === 'fahrenheit') formula = `(${value}°F − 32) × 5/9 + 273.15 = ${result.toFixed(2)}K`;
                    else formula = `${value}K = ${result.toFixed(2)}K`;
                }

                const unitSymbol = to === 'celsius' ? '°C' : to === 'fahrenheit' ? '°F' : 'K';
                resultValue.textContent = `${parseFloat(result.toFixed(2))} ${unitSymbol}`;
                conversionFormula.textContent = formula;
                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            };

            // Listeners
            convertBtn.addEventListener('click', performConversion);
            tempValue.addEventListener('input', performConversion); // Live conversion
            fromUnit.addEventListener('change', performConversion);
            toUnit.addEventListener('change', performConversion);

            // Enter key support
            tempValue.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performConversion();
            });
        });