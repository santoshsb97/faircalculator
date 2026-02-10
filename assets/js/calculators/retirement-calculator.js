/* retirement-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const calculateBtn = document.getElementById('calculateBtn');
            const currentAge = document.getElementById('currentAge');
            const retirementAge = document.getElementById('retirementAge');
            const currentSavings = document.getElementById('currentSavings');
            const monthlyContribution = document.getElementById('monthlyContribution');
            const returnRate = document.getElementById('returnRate');
            const annualIncome = document.getElementById('annualIncome');

            const resultContainer = document.getElementById('resultContainer');
            const retirementSavingsEl = document.getElementById('retirementSavings');
            const yearsToRetirementEl = document.getElementById('yearsToRetirement');
            const totalContributionsEl = document.getElementById('totalContributions');
            const investmentGrowthEl = document.getElementById('investmentGrowth');
            const yearsLastWillEl = document.getElementById('yearsLastWill');
            const statusMessage = document.getElementById('statusMessage');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Format Helper
            const formatMoney = (amount) => {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
            };

            if (calculateBtn) {
                calculateBtn.addEventListener('click', () => {
                    const currAge = parseFloat(currentAge.value);
                    const retAge = parseFloat(retirementAge.value);
                    const savings = parseFloat(currentSavings.value) || 0;
                    const monthly = parseFloat(monthlyContribution.value) || 0;
                    const rate = parseFloat(returnRate.value) / 100;
                    const income = parseFloat(annualIncome.value);

                    if (isNaN(currAge) || isNaN(retAge) || isNaN(rate) || isNaN(income)) {
                        alert('Please enter valid numbers for all required fields.');
                        return;
                    }

                    if (retAge <= currAge) {
                        alert('Retirement age must be greater than current age.');
                        return;
                    }

                    const years = retAge - currAge;
                    const months = years * 12;
                    const monthlyRate = rate / 12;

                    // Future value of current savings
                    // Formula: PV * (1 + r)^n
                    const FV_savings = savings * Math.pow(1 + monthlyRate, months);

                    // Future value of monthly contributions
                    // Formula: PMT * ((1 + r)^n - 1) / r
                    let FV_contributions = 0;
                    if (monthly > 0) {
                        if (monthlyRate > 0) {
                            FV_contributions = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
                        } else {
                            FV_contributions = monthly * months;
                        }
                    }

                    const totalRetirementSavings = FV_savings + FV_contributions;
                    const totalContributed = savings + (monthly * months);
                    const growth = totalRetirementSavings - totalContributed;

                    // Calculate how long savings will last
                    // Simple Division: Total / Annual Income
                    // (Note: This assumes 0% growth during retirement for safety/simplicity in this basic view)
                    const yearsLast = income > 0 ? totalRetirementSavings / income : 0;

                    // Display results
                    retirementSavingsEl.textContent = formatMoney(totalRetirementSavings);
                    yearsToRetirementEl.textContent = years;
                    totalContributionsEl.textContent = formatMoney(totalContributed);
                    investmentGrowthEl.textContent = formatMoney(growth);
                    yearsLastWillEl.textContent = yearsLast.toFixed(1);

                    // Status message logic
                    statusMessage.className = 'status-box'; // Reset classes
                    if (yearsLast >= 25) {
                        statusMessage.textContent = 'âœ“ Great! Your savings should last throughout retirement.';
                        statusMessage.classList.add('status-success');
                    } else if (yearsLast >= 15) {
                        statusMessage.textContent = 'âš  Your savings might last, but consider increasing contributions.';
                        statusMessage.classList.add('status-warning');
                    } else {
                        statusMessage.textContent = 'âœ— Warning: You may need to save more to meet your income goals.';
                        statusMessage.classList.add('status-danger');
                    }

                    resultContainer.style.display = 'block';

                    if (window.innerWidth < 768) {
                        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
            }
        });