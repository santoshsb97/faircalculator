/* assets/js/data.js */

const calculatorsData = [
    // Finance
    { name: 'Simple Interest', desc: 'Calculate simple interest on loans or savings.', category: 'Finance', icon: 'fa-percent', url: 'calculators/simple-interest-calculator/' },
    { name: 'Compound Interest', desc: 'Calculate compound interest with monthly/yearly additions.', category: 'Finance', icon: 'fa-coins', url: 'calculators/compound-interest-calculator/' },
    { name: 'Amortization Calc', desc: 'Calculate loan amortization schedules.', category: 'Finance', icon: 'fa-table', url: 'calculators/amortization-calculator/' },
    { name: 'GST Calculator', desc: 'Calculate Goods and Services Tax (GST).', category: 'India', type: 'india', icon: 'fa-receipt', url: 'calculators/gst-calculator/' },
    { name: 'Tax Calculator 2026', desc: 'Estimate your income tax liability.', category: 'Finance', type: 'finance', icon: 'fa-file-invoice-dollar', url: 'calculators/income-tax-calculator/' },
    { name: 'Investment Calc', desc: 'Calculate the future value of your investments.', category: 'Finance', icon: 'fa-chart-line', url: 'calculators/investment-calculator/' },
    { name: 'Savings Calculator', desc: 'Calculate how much you can save over time.', category: 'Finance', icon: 'fa-piggy-bank', url: 'calculators/savings-calculator/' },
    { name: 'Loan Calculator', desc: 'Calculate loan payments and total interest.', category: 'Finance', icon: 'fa-hand-holding-usd', url: 'calculators/loan-calculator/' },
    { name: 'Mortgage Calc', desc: 'Calculate your monthly mortgage payments.', category: 'Finance', icon: 'fa-home', url: 'calculators/mortgage-calculator/' },
    { name: 'Discount Calc', desc: 'Calculate the final price after a discount.', category: 'Finance', icon: 'fa-tags', url: 'calculators/discount-calculator/' },
    { name: 'Salary Calculator', desc: 'Calculate your take-home salary.', category: 'Finance', icon: 'fa-money-bill-wave', url: 'calculators/salary-calculator/' },
    { name: 'Retirement Calc', desc: 'Plan for your retirement savings.', category: 'Finance', icon: 'fa-umbrella-beach', url: 'calculators/retirement-calculator/' },
    { name: 'UK Stamp Duty', desc: 'Calculate UK Stamp Duty Land Tax (SDLT) for property purchases.', category: 'Finance', icon: 'fa-home-lg-alt', url: 'calculators/uk-stamp-duty-calculator/' },
    { name: 'Gold Loan', desc: 'Estimate gold loan EMI and loan amount based on current gold value.', category: 'Finance', icon: 'fa-coins', url: 'calculators/gold-loan-calculator/' },
    { name: 'RMD Calculator', desc: 'Calculate Required Minimum Distributions (RMD) using IRS table.', category: 'Finance', icon: 'fa-coins', url: 'calculators/rmd-calculator/' },
    { name: 'UK Salary Sacrifice', desc: 'Calculate take-home pay with pension salary sacrifice in the UK.', category: 'Finance', icon: 'fa-gbp', url: 'calculators/uk-salary-sacrifice-calculator/' },
    { name: 'Tip Calculator', desc: 'Calculate tip amounts and split bills per person.', category: 'Finance', icon: 'fa-receipt', url: 'calculators/tip-calculator/' },
    { name: 'Aus Income Tax', desc: 'Calculate Australian income tax and Medicare levy (1983-2026).', category: 'Finance', icon: 'fa-money-bill-wave', url: 'calculators/australian-income-tax-calculator/' },
    { name: 'Australian GST', desc: 'Calculate 10% Australian GST. Add or remove GST from prices.', category: 'Finance', icon: 'fa-receipt', url: 'calculators/australian-gst-calculator/' },
    { name: 'Sales Tax Calc', desc: 'Calculate state and local sales tax in the US.', category: 'Finance', icon: 'fa-receipt', url: 'calculators/sales-tax-calculator/' },
    { name: 'US Stamp Duty', desc: 'Calculate real estate transfer tax for all 50 US states + DC using 2026 rates.', category: 'Finance', icon: 'fa-file-contract', url: 'calculators/us-stamp-duty-calculator/' },
    { name: 'Margin Calculator', desc: 'Calculate gross profit margin, net profit margin, markup %, and break-even price instantly.', category: 'Finance', icon: 'fa-chart-pie', url: 'calculators/margin-calculator/' },


    // Math
    { name: 'Percentage Calc', desc: 'Calculate percentages, increases, and decreases.', category: 'Math', icon: 'fa-percentage', url: 'calculators/percentage-calculator/' },
    { name: 'Fraction Calc', desc: 'Add, subtract, multiply, and divide fractions.', category: 'Math', icon: 'fa-pizza-slice', url: 'calculators/fraction-calculator/' },
    { name: 'Square Root', desc: 'Calculate the square root of any number.', category: 'Math', icon: 'fa-square-root-alt', url: 'calculators/square-root-calculator/' },
    { name: 'Exponent Calc', desc: 'Calculate the power of a number.', category: 'Math', icon: 'fa-superscript', url: 'calculators/exponent-calculator/' },
    { name: 'Logarithm', desc: 'Calculate log base 10, log base 2, or natural log (ln).', category: 'Math', icon: 'fa-calculator', url: 'calculators/logarithm-calculator/' },
    { name: 'Absolute Value', desc: 'Solve absolute value equations step-by-step.', category: 'Math', icon: 'fa-brackets-curly', url: 'calculators/absolute-value-equation-solver/' },
    { name: 'System of Equations', desc: 'Solve systems of two linear equations with steps and graphs.', category: 'Math', icon: 'fa-project-diagram', url: 'calculators/system-of-equations-solver/' },
    { name: 'Area Calculator', desc: 'Calculate the area of various geometric shapes.', category: 'Math', icon: 'fa-shapes', url: 'calculators/area-calculator/' },
    { name: 'Volume Calculator', desc: 'Calculate the volume of various 3D shapes.', category: 'Math', icon: 'fa-cube', url: 'calculators/volume-calculator/' },
    { name: 'Standard Deviation', desc: 'Calculate population and sample standard deviation, variance, and mean with step-by-step steps.', category: 'Math', icon: 'fa-chart-bar', url: 'calculators/standard-deviation-calculator/' },
    { name: 'LCM Calculator', desc: 'Find the Least Common Multiple (LCM) of numbers using 12 different methods.', category: 'Math', icon: 'fa-calculator', url: 'calculators/lcm-calculator/' },
    { name: 'HCF Calculator', desc: 'Find the Highest Common Factor (HCF) of numbers using 5 different methods.', category: 'Math', icon: 'fa-divide', url: 'calculators/hcf-calculator/' },

    // Health
    { name: 'BMI Calculator', desc: 'Calculate your Body Mass Index.', category: 'Health', icon: 'fa-weight', url: 'calculators/bmi-calculator/' },
    { name: 'Calorie Calculator', desc: 'Estimate daily calorie needs.', category: 'Health', icon: 'fa-utensils', url: 'calculators/calorie-calculator/' },

    // Date
    { name: 'Age Calculator', desc: 'Calculate age in years, months, and days.', category: 'Date', icon: 'fa-birthday-cake', url: 'calculators/age-calculator/' },
    { name: 'Date Difference', desc: 'Calculate duration between two dates.', category: 'Date', icon: 'fa-calendar-minus', url: 'calculators/date-difference-calculator/' },
    { name: 'Time Calc', desc: 'Add or subtract hours, minutes, and seconds.', category: 'Date', icon: 'fa-clock', url: 'calculators/time-calculator/' },
    { name: 'Business Days', desc: 'Calculate working days excluding weekends.', category: 'Date', icon: 'fa-briefcase', url: 'calculators/business-days-calculator/' },
    { name: 'Leap Year', desc: 'Check for leap years and list them.', category: 'Date', icon: 'fa-calendar-check', url: 'calculators/leap-year-calculator/' },
    { name: 'Week Calculator', desc: 'Calculate weeks between dates, add or subtract weeks.', category: 'Date', icon: 'fa-calendar-week', url: 'calculators/week-calculator/' },

    // Converters
    { name: 'Temperature', desc: 'Convert Celsius, Fahrenheit, and Kelvin.', category: 'Converter', icon: 'fa-temperature-high', url: 'calculators/temperature-converter/' },
    { name: 'Number to Words', desc: 'Convert numbers into written words for checks, currency, and legal documents.', category: 'Converter', icon: 'fa-spell-check', url: 'calculators/number-to-words-converter/' },
    { name: 'Subnet Calculator', desc: 'Calculate IP subnets, network addresses, and usable host ranges.', category: 'Converter', icon: 'fa-network-wired', url: 'calculators/subnet-calculator/' },

    // Physics
    { name: 'Frequency Calc', desc: 'Calculate frequency, wavelength, period, and speed.', category: 'Physics', icon: 'fa-wave-square', url: 'calculators/frequency-calculator/' },
    { name: 'Spring Constant', desc: 'Calculate spring force, stiffness (k), and displacement using Hooke\'s Law.', category: 'Physics', icon: 'fa-compress-alt', url: 'calculators/spring-constant-calculator/' },
    { name: 'Wavelength Calc', desc: 'Calculate wavelength using frequency and speed.', category: 'Physics', icon: 'fa-wave-square', url: 'calculators/wavelength-calculator/' },
    { name: 'NZ Income Tax', desc: 'Calculate NZ PAYE, ACC & KiwiSaver for 2025-26.', category: 'Finance', icon: 'fa-money-bill-wave', url: 'calculators/nz-tax-calculator/' },
    { name: 'NZ GST Calc', desc: 'Calculate 15% NZ GST. Add or remove GST instantly.', category: 'Finance', icon: 'fa-receipt', url: 'calculators/nz-gst-calculator/' }
];