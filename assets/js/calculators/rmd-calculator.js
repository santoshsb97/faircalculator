/**
 * RMD Calculator Logic
 * Compliant with SECURE Act 2.0
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION & DATA ---

    // IRS Uniform Lifetime Table (for Unmarried Owners, Married Owners with Spouses Not >10 Years Younger, and Warried Owners with Spouses >10 Years Younger who are not the sole beneficiary)
    // Source: IRS Publication 590-B (2023 for 2024 Distributions)
    // Age: Distribution Period
    const UNIFORM_LIFETIME_TABLE = {
        72: 27.4,
        73: 26.5,
        74: 25.5,
        75: 24.6,
        76: 23.7,
        77: 22.9,
        78: 22.0,
        79: 21.1,
        80: 20.2,
        81: 19.4,
        82: 18.5,
        83: 17.7,
        84: 16.8,
        85: 16.0,
        86: 15.2,
        87: 14.4,
        88: 13.7,
        89: 12.9,
        90: 12.2,
        91: 11.5,
        92: 10.8,
        93: 10.1,
        94: 9.5,
        95: 8.9,
        96: 8.4,
        97: 7.8,
        98: 7.3,
        99: 6.8,
        100: 6.4,
        101: 6.0,
        102: 5.6,
        103: 5.2,
        104: 4.9,
        105: 4.6,
        106: 4.3,
        107: 4.1,
        108: 3.9,
        109: 3.7,
        110: 3.5,
        111: 3.4,
        112: 3.3,
        113: 3.1,
        114: 3.0,
        115: 2.9,
        116: 2.8,
        117: 2.7,
        118: 2.5,
        119: 2.3,
        120: 2.0
    };

    const ELEMENTS = {
        birthDate: document.getElementById('birthDate'),
        taxYear: document.getElementById('taxYear'),
        accountBalance: document.getElementById('accountBalance'),
        beneficiaryStatus: document.getElementById('beneficiaryStatus'),
        calculateBtn: document.getElementById('calculateBtn'),
        resultContainer: document.getElementById('resultContainer'),
        statusMessage: document.getElementById('statusMessage'),
        rmdAmount: document.getElementById('rmdAmount'),
        userAge: document.getElementById('userAge'),
        distributionFactor: document.getElementById('distributionFactor'),
        balanceDisplay: document.getElementById('balanceDisplay'),
        distributionFactor: document.getElementById('distributionFactor'),
        distributionFactor: document.getElementById('distributionFactor'),
        balanceDisplay: document.getElementById('balanceDisplay'),
        ageInput: document.getElementById('ageInput')
    };

    // Initialize Tax Year Dropdown (Current Year + Future 10 Years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 10; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        ELEMENTS.taxYear.appendChild(option);
    }

    // Initialize Age Dropdown (10 to 120) - Wide range for safety
    for (let i = 10; i <= 120; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === 73) option.selected = true; // Default
        ELEMENTS.ageInput.appendChild(option);
    }

    // --- 2. CORE FUNCTIONS ---

    /*
     * Determines the RMD Start Age based on birth year (SECURE Act 2.0)
     */
    function getRmdStartAge(birthYear) {
        if (birthYear < 1951) return 72; // Actually 70.5 or 72 depending on specific history, but effectively already in RMD
        if (birthYear >= 1951 && birthYear <= 1959) return 73;
        if (birthYear >= 1960) return 75;
        return 73; // Fallback
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    function showError(message) {
        ELEMENTS.resultContainer.style.display = 'block';
        ELEMENTS.statusMessage.className = 'status-box status-danger'; // Assuming simple error styling exists or using inline styles
        ELEMENTS.statusMessage.style.background = '#fee2e2';
        ELEMENTS.statusMessage.style.color = '#991b1b';
        ELEMENTS.statusMessage.style.border = '1px solid #fecaca';
        ELEMENTS.statusMessage.textContent = message;

        // Hide data cards if error
        ELEMENTS.rmdAmount.textContent = '--';
        ELEMENTS.userAge.textContent = '--';
        ELEMENTS.distributionFactor.textContent = '--';
        ELEMENTS.balanceDisplay.textContent = '--';
    }

    function showSuccess(message) {
        ELEMENTS.statusMessage.className = 'status-box status-success';
        ELEMENTS.statusMessage.style.background = '#dcfce7';
        ELEMENTS.statusMessage.style.color = '#166534';
        ELEMENTS.statusMessage.style.border = '1px solid #bbf7d0';
        ELEMENTS.statusMessage.textContent = message;
    }

    function showInfo(message) {
        ELEMENTS.statusMessage.className = 'status-box status-info';
        ELEMENTS.statusMessage.style.background = '#eff6ff';
        ELEMENTS.statusMessage.style.color = '#1e40af';
        ELEMENTS.statusMessage.style.border = '1px solid #dbeafe';
        ELEMENTS.statusMessage.textContent = message;
    }


    // --- 3. MAIN CALCULATION HANDLER ---

    ELEMENTS.calculateBtn.addEventListener('click', () => {
        // Reset Inputs
        ELEMENTS.resultContainer.style.display = 'none';

        // 1. Validate Inputs
        const taxYearVal = parseInt(ELEMENTS.taxYear.value);
        const age = parseInt(ELEMENTS.ageInput.value);
        const balanceVal = parseFloat(ELEMENTS.accountBalance.value);
        const beneficiaryVal = ELEMENTS.beneficiaryStatus.value;

        // Approximate birth year for RMD rule check:
        const birthYear = taxYearVal - age;

        if (isNaN(balanceVal) || balanceVal < 0) {
            alert("Please enter a valid account balance.");
            return;
        }

        const rmdStartAge = getRmdStartAge(birthYear);

        // 3. Logic Check: specific logic for younger spouses not implemented fully yet, blocking to Standard
        if (beneficiaryVal === 'spouse_younger') {
            // For this MVP, we alert user or handle via standard table
            alert("Note: The 'Spouse > 10 Years Younger' calculation requires the Joint Life Expectancy Table which is not yet fully implemented. Using Standard Table for estimation.");
        }


        // 4. Determine RMD Status
        ELEMENTS.resultContainer.style.display = 'block';
        ELEMENTS.balanceDisplay.textContent = formatCurrency(balanceVal);
        ELEMENTS.userAge.textContent = age;

        if (age < rmdStartAge) {
            // No RMD Required
            showInfo(`Good news! You are ${age} years old. RMDs for you do not begin until age ${rmdStartAge}. No distribution is required for ${taxYearVal}.`);
            ELEMENTS.rmdAmount.textContent = "$0.00";
            ELEMENTS.distributionFactor.textContent = "N/A";
            return; // EXIT
        }

        // 5. Get Distribution Factor
        // Cap age at 120 (table max)
        const lookupAge = Math.min(Math.max(age, 72), 120);
        const factor = UNIFORM_LIFETIME_TABLE[lookupAge];

        if (!factor) {
            // Should not happen given logic above, but safety net
            showError("Could not determine distribution factor for this age.");
            return;
        }

        // 6. Calculate RMD
        const rmd = balanceVal / factor;

        // 7. Display Results
        ELEMENTS.rmdAmount.textContent = formatCurrency(rmd);
        ELEMENTS.distributionFactor.textContent = factor;
        showSuccess(`RMD Calculated Successfully for Tax Year ${taxYearVal}.`);

    });

});
