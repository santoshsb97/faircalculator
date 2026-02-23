const TAX_CONFIG = {
    "2026-27": {
        personalAllowance: 12570,
        taperStart: 100000,
        basicRateLimit: 37700, // Above personal allowance
        basicRate: 0.20,
        higherRate: 0.40,
        additionalRateLimit: 125140,
        additionalRate: 0.45,
        ni: {
            employee: {
                primaryThreshold: 12570,
                upperEarningsLimit: 50270,
                standardRate: 0.08,
                upperRate: 0.02,
                rates: {
                    'A': { standard: 0.08, upper: 0.02 },
                    'B': { standard: 0.0185, upper: 0.02 },
                    'C': { standard: 0, upper: 0 },
                    'J': { standard: 0.02, upper: 0.02 },
                    'H': { standard: 0.08, upper: 0.02 },
                    'M': { standard: 0.08, upper: 0.02 },
                    'Z': { standard: 0.08, upper: 0.02 }
                }
            },
            employer: {
                secondaryThreshold: 5000, // 2025 rule
                rate: 0.15, // 2025 rule
                categories: {
                    'A': 0.15,
                    'B': 0.15,
                    'C': 0.15,
                    'J': 0.15,
                    'H': 0, // Apprentice under 25 (up to UEL)
                    'M': 0, // Under 21 (up to UEL)
                    'Z': 0  // Under 21 (up to UEL)
                }
            }
        },
        nmwHourly: 12.21
    }
};

function calculateTax(income) {
    if (income <= 0) return 0;

    let pa = TAX_CONFIG["2026-27"].personalAllowance;

    // Personal Allowance Taper (Lost £1 for every £2 over £100,000)
    if (income > TAX_CONFIG["2026-27"].taperStart) {
        let reduction = Math.floor((income - TAX_CONFIG["2026-27"].taperStart) / 2);
        pa = Math.max(0, pa - reduction);
    }

    let taxable = Math.max(0, income - pa);
    let tax = 0;

    // 2026-27 Bands (Taxable Income)
    const basicLimit = TAX_CONFIG["2026-27"].basicRateLimit; // 37,700
    const higherLimit = TAX_CONFIG["2026-27"].additionalRateLimit - pa; // Total income limit - PA

    if (taxable <= basicLimit) {
        tax = taxable * 0.20;
    } else if (taxable <= higherLimit) {
        tax = (basicLimit * 0.20) + ((taxable - basicLimit) * 0.40);
    } else {
        tax = (basicLimit * 0.20) +
            ((higherLimit - basicLimit) * 0.40) +
            ((taxable - higherLimit) * 0.45);
    }

    return Math.floor(tax);
}

function calculateEmployeeNI(salary, cat) {
    const config = TAX_CONFIG["2026-27"].ni.employee;
    const rates = config.rates[cat] || config.rates['A'];

    if (salary <= config.primaryThreshold) return 0;

    let ni = 0;
    if (salary <= config.upperEarningsLimit) {
        ni = (salary - config.primaryThreshold) * rates.standard;
    } else {
        ni = (config.upperEarningsLimit - config.primaryThreshold) * rates.standard +
            (salary - config.upperEarningsLimit) * rates.upper;
    }
    return Math.floor(ni);
}

function calculateEmployerNI(salary, cat) {
    const config = TAX_CONFIG["2026-27"].ni.employer;
    let rate = config.categories[cat] ?? 0.15;
    const uel = TAX_CONFIG["2026-27"].ni.employee.upperEarningsLimit;

    // Categories H, M, Z have 0% up to UEL
    if (['H', 'M', 'Z'].includes(cat)) {
        if (salary <= uel) return 0;
        return Math.floor((salary - uel) * 0.15);
    }

    if (salary <= config.secondaryThreshold) return 0;
    return Math.floor((salary - config.secondaryThreshold) * rate);
}

function performComparison() {
    const salary = parseFloat(document.getElementById('annualSalary').value) || 0;
    const sacrifice = parseFloat(document.getElementById('sacrificeAmount').value) || 0;
    const category = document.getElementById('niCategory').value;
    const hours = parseFloat(document.getElementById('weeklyHours').value) || 37.5;

    // Basic Validation
    let valid = true;
    if (salary <= 0) {
        document.getElementById('salaryError').style.display = 'block';
        document.getElementById('groupSalary').classList.add('invalid');
        valid = false;
    } else {
        document.getElementById('salaryError').style.display = 'none';
        document.getElementById('groupSalary').classList.remove('invalid');
    }

    if (sacrifice < 0 || sacrifice > salary) {
        document.getElementById('sacrificeError').textContent = sacrifice > salary ? "Sacrifice cannot exceed salary" : "Invalid amount";
        document.getElementById('sacrificeError').style.display = 'block';
        document.getElementById('groupSacrifice').classList.add('invalid');
        valid = false;
    } else {
        document.getElementById('sacrificeError').style.display = 'none';
        document.getElementById('groupSacrifice').classList.remove('invalid');
    }

    if (!valid) return;

    const adjustedSalary = salary - sacrifice;

    // NMW Check
    const nmwThreshold = TAX_CONFIG["2026-27"].nmwHourly * hours * 52;
    const nmwWarning = document.getElementById('nmwWarning');
    if (adjustedSalary < nmwThreshold) {
        nmwWarning.style.display = 'block';
    } else {
        nmwWarning.style.display = 'none';
    }

    // Calculations - Base
    const taxBase = calculateTax(salary);
    const eniBase = calculateEmployeeNI(salary, category);
    const erniBase = calculateEmployerNI(salary, category);
    const netBase = salary - taxBase - eniBase;

    // Calculations - Sacrifice
    const taxSac = calculateTax(adjustedSalary);
    const eniSac = calculateEmployeeNI(adjustedSalary, category);
    const erniSac = calculateEmployerNI(adjustedSalary, category);
    const netSac = adjustedSalary - taxSac - eniSac;

    // Deltas
    const taxSaved = taxBase - taxSac;
    const eniSaved = eniBase - eniSac;
    const erniSaved = erniBase - erniSac;
    const netReduction = netBase - netSac;
    const totalSaving = taxSaved + eniSaved;

    // UI Update
    const results = document.getElementById('results');
    results.classList.add('show');

    // Summary Cards
    document.getElementById('employeeAnnualSaving').textContent = '£' + (taxSaved + eniSaved).toLocaleString(undefined, { maximumFractionDigits: 0 });
    document.getElementById('employerAnnualSaving').textContent = '£' + erniSaved.toLocaleString(undefined, { maximumFractionDigits: 0 });

    const costPerPound = sacrifice > 0 ? (netReduction / sacrifice) : 0;
    document.getElementById('effectiveCost').innerHTML = `${Math.round(costPerPound * 100)}p <span style="font-size: 0.9rem; font-weight: 400;">per £1 boost</span>`;

    // Comparison Table Numbers (Consistent Formatting)
    const formatCurrency = (val) => '£' + Math.floor(val).toLocaleString();
    const formatDiff = (val) => (val >= 0 ? '+£' : '-£') + Math.abs(Math.floor(val)).toLocaleString();

    document.getElementById('res_gross_base').textContent = formatCurrency(salary);
    document.getElementById('res_gross_sac').textContent = formatCurrency(adjustedSalary);
    document.getElementById('res_gross_diff').textContent = formatDiff(-sacrifice);

    document.getElementById('res_tax_base').textContent = formatCurrency(taxBase);
    document.getElementById('res_tax_sac').textContent = formatCurrency(taxSac);
    document.getElementById('res_tax_diff').textContent = formatDiff(taxSaved);

    document.getElementById('res_eni_base').textContent = formatCurrency(eniBase);
    document.getElementById('res_eni_sac').textContent = formatCurrency(eniSac);
    document.getElementById('res_eni_diff').textContent = formatDiff(eniSaved);

    document.getElementById('res_net_base').textContent = formatCurrency(netBase);
    document.getElementById('res_net_sac').textContent = formatCurrency(netSac);
    document.getElementById('res_net_diff').textContent = formatDiff(-netReduction);

    document.getElementById('res_erni_base').textContent = formatCurrency(erniBase);
    document.getElementById('res_erni_sac').textContent = formatCurrency(erniSac);
    document.getElementById('res_erni_diff').textContent = formatDiff(erniSaved);

    document.getElementById('res_pension_total').textContent = formatCurrency(sacrifice);
    document.getElementById('res_pension_uplift').textContent = '+' + formatCurrency(sacrifice);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper to format inputs
function setupInputFormatting(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
        }
    });
}
setupInputFormatting('annualSalary');
setupInputFormatting('sacrificeAmount');

// Verification Suite
window.verifyUKSalarySacrifice = function () {
    const tests = [
        { name: "Standard (£50k, £5k sac)", salary: 50000, sac: 5000, cat: 'A', expectTaxSaving: 1000, expectENISaving: 400, expectERNISaving: 750 },
        { name: "Taper Zone (£110k, £10k sac)", salary: 110000, sac: 10000, cat: 'A', expectTaxSaving: 6000, expectENISaving: 200, expectERNISaving: 1500 },
        { name: "NI Category C (£40k, £5k sac)", salary: 40000, sac: 5000, cat: 'C', expectTaxSaving: 1000, expectENISaving: 0, expectERNISaving: 750 }
    ];

    console.log("%c Starting Salary Sacrifice Logic Verification V2...", "color: blue; font-weight: bold;");

    tests.forEach(t => {
        const taxBase = calculateTax(t.salary);
        const taxSac = calculateTax(t.salary - t.sac);
        const eniBase = calculateEmployeeNI(t.salary, t.cat);
        const eniSac = calculateEmployeeNI(t.salary - t.sac, t.cat);
        const erniBase = calculateEmployerNI(t.salary, t.cat);
        const erniSac = calculateEmployerNI(t.salary - t.sac, t.cat);

        const ts = taxBase - taxSac;
        const es = eniBase - eniSac;
        const ers = erniBase - erniSac;

        const pass = ts === t.expectTaxSaving && es === t.expectENISaving && ers === t.expectERNISaving;

        if (pass) {
            console.log(`%c [PASS] ${t.name}`, "color: green");
        } else {
            console.error(`[FAIL] ${t.name} | Tax Saving: ${ts} (Exp: ${t.expectTaxSaving}) | ENI Saving: ${es} (Exp: ${t.expectENISaving}) | ERNI Saving: ${ers} (Exp: ${t.expectERNISaving})`);
        }
    });
};
