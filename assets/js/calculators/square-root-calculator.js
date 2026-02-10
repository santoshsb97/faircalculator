/* square-root-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const calculateBtn = document.getElementById('calculateBtn');
    const numberInput = document.getElementById('number');
    const rootType = document.getElementById('rootType');
    const customRoot = document.getElementById('customRoot');
    const customRootGroup = document.getElementById('customRootGroup');

    // Visual Elements
    const visualIndex = document.getElementById('visualIndex');
    const visualRadicand = document.getElementById('visualRadicand');

    // Outputs
    const resultContainer = document.getElementById('resultContainer');
    const resultElement = document.getElementById('result');
    const equationElement = document.getElementById('equation');
    const exponentForm = document.getElementById('exponentForm');

    // Search Hiding Logic
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', (e) => {
            toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
        });
    }

    // --- LIVE UPDATES ---
    function updateVisuals() {
        // Update Radicand
        visualRadicand.textContent = numberInput.value || "x";

        // Update Index
        let index = rootType.value;
        if (index === 'custom') {
            index = customRoot.value || "n";
        }

        // Hide index if square root (standard notation)
        if (index == 2) {
            visualIndex.textContent = "";
        } else {
            visualIndex.textContent = index;
        }
    }

    numberInput.addEventListener('input', updateVisuals);
    customRoot.addEventListener('input', updateVisuals);

    rootType.addEventListener('change', () => {
        if (rootType.value === 'custom') {
            customRootGroup.style.display = 'block';
        } else {
            customRootGroup.style.display = 'none';
        }
        updateVisuals();
    });

    // --- CALCULATE ---
    calculateBtn.addEventListener('click', () => {
        const num = parseFloat(numberInput.value);
        let root = (rootType.value === 'custom') ? parseInt(customRoot.value) : parseInt(rootType.value);

        // Validation
        if (isNaN(num)) {
            alert("Please enter a valid number.");
            return;
        }
        if (isNaN(root) || root < 1) {
            alert("Please enter a valid root index (must be >= 1).");
            return;
        }

        // Logic
        let result;

        // Even Root of Negative Number
        if (num < 0 && root % 2 === 0) {
            resultElement.textContent = "Imaginary";
            equationElement.textContent = "Even roots of negative numbers are not real numbers.";
            exponentForm.textContent = `Result contains 'i' (imaginary unit).`;
            resultContainer.style.display = 'block';
            return;
        }

        // Odd Root of Negative Number
        if (num < 0 && root % 2 !== 0) {
            result = -Math.pow(Math.abs(num), 1 / root);
        } else {
            result = Math.pow(num, 1 / root);
        }

        // Formatting
        let displayResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));

        // Update UI
        resultElement.textContent = displayResult;

        // Equation Text
        let indexStr = (root === 2) ? "" : root;
        equationElement.innerHTML = `${indexStr}√${num} = <strong>${displayResult}</strong>`;

        // Exponent Form Text
        exponentForm.innerHTML = `Exponent Form: ${num}<sup>1/${root}</sup>`;

        resultContainer.style.display = 'block';
        if (window.innerWidth < 768) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Allow Enter key
    document.querySelector('.calculator-form').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateBtn.click();
    });

    // Init Visuals
    updateVisuals();
});