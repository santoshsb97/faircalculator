/* leap-year-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // UI Elements
            const tabCheck = document.getElementById('tabCheck');
            const tabList = document.getElementById('tabList');
            const checkMode = document.getElementById('checkMode');
            const rangeMode = document.getElementById('rangeMode');
            const btn = document.getElementById('calculateBtn');
            const txtYear = document.getElementById('txtYear');
            const startYear = document.getElementById('startYear');
            const endYear = document.getElementById('endYear');

            const resContainer = document.getElementById('resultContainer');
            const mainResult = document.getElementById('mainResult');
            const subResult = document.getElementById('subResult');
            const leapList = document.getElementById('leapList');

            let isRangeMode = false;

            // Search Hide Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // Initialize defaults
            const currentYear = new Date().getFullYear();
            txtYear.value = currentYear;
            startYear.value = currentYear;
            endYear.value = currentYear + 20;

            // Tabs
            tabCheck.addEventListener('click', () => {
                tabCheck.classList.add('active'); tabList.classList.remove('active');
                checkMode.style.display = 'block'; rangeMode.style.display = 'none';
                btn.textContent = 'Check Leap Year';
                isRangeMode = false;
                resContainer.style.display = 'none';
            });

            tabList.addEventListener('click', () => {
                tabList.classList.add('active'); tabCheck.classList.remove('active');
                rangeMode.style.display = 'block'; checkMode.style.display = 'none';
                btn.textContent = 'Find Leap Years';
                isRangeMode = true;
                resContainer.style.display = 'none';
            });

            function isLeap(y) {
                return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
            }

            function calculate() {
                resContainer.style.display = 'block';
                leapList.style.display = 'none';

                if (!isRangeMode) {
                    const y = parseInt(txtYear.value);
                    if (!y) return;

                    if (isLeap(y)) {
                        mainResult.textContent = 'Yes';
                        mainResult.style.color = '#16a34a'; // Green
                        subResult.textContent = `${y} is a leap year (366 days).`;
                    } else {
                        mainResult.textContent = 'No';
                        mainResult.style.color = '#dc2626'; // Red
                        subResult.textContent = `${y} is not a leap year (365 days).`;
                    }
                } else {
                    const s = parseInt(startYear.value);
                    const e = parseInt(endYear.value);
                    if (!s || !e || s > e) { alert('Invalid range'); return; }

                    let count = 0;
                    let years = [];
                    for (let i = s; i <= e; i++) {
                        if (isLeap(i)) {
                            count++;
                            years.push(i);
                        }
                    }

                    mainResult.textContent = count;
                    mainResult.style.color = '#c2410c';
                    subResult.textContent = `Leap years found between ${s} and ${e}.`;

                    leapList.style.display = 'block';
                    leapList.innerHTML = years.join(', ') || 'None found.';
                }

                if (window.innerWidth < 768) {
                    resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            btn.addEventListener('click', calculate);
        });