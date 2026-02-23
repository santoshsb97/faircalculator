// --- HCF Logic ---
function parseNumbers(input) {
    if (!input.trim()) return [];
    const parts = input.trim().split(/[\s,;]+/);
    const numbers = [];
    for (let p of parts) {
        const n = Number(p);
        if (isNaN(n) || !Number.isInteger(n) || n <= 0) return null;
        numbers.push(n);
    }
    return numbers;
}

function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { let t = b; b = a % b; a = t; }
    return a || 0;
}

function getFactors(n) {
    const factors = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
    return factors;
}

function getPrimeFactors(n) {
    const factors = [];
    let d = 2;
    let temp = n;
    while (temp % d === 0) { factors.push(d); temp /= d; }
    d = 3;
    while (d * d <= temp) {
        while (temp % d === 0) { factors.push(d); temp /= d; }
        d += 2;
    }
    if (temp > 1) factors.push(temp);
    return factors;
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
}

function getNextPrime(p) {
    let next = p + 1;
    while (!isPrime(next)) next++;
    return next;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function createTable(headers, rows) {
    let html = '<table class="hcf-table"><thead><tr>';
    headers.forEach(h => html += `<th>${escapeHTML(h)}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
        html += '<tr>';
        r.forEach(c => {
            if (typeof c === 'string' && c.includes('<span')) {
                html += `<td>${c}</td>`;
            } else {
                html += `<td>${escapeHTML(c)}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

// --- Methods ---
function euclideanMethod(numbers) {
    if (numbers.length === 2) {
        const steps = [];
        let a = Math.max(numbers[0], numbers[1]);
        let b = Math.min(numbers[0], numbers[1]);
        while (b) {
            let r = a % b;
            let q = Math.floor(a / b);
            steps.push(`${a} = ${b} × ${q} + ${r}`);
            a = b;
            b = r;
        }
        return { hcf: a, steps, isPair: true };
    } else {
        let res = numbers[0];
        const steps = [];
        for (let i = 1; i < numbers.length; i++) {
            const prevRes = res;
            const nextNum = numbers[i];
            res = gcd(res, nextNum);
            steps.push(`GCD(${prevRes}, ${nextNum}) = ${res}`);
        }
        return { hcf: res, steps, isPair: false };
    }
}

function primeFactorization(numbers) {
    const map = {};
    const factorsList = numbers.map(n => {
        const f = getPrimeFactors(n);
        const counts = {};
        f.forEach(p => counts[p] = (counts[p] || 0) + 1);
        return { n, counts, factors: f };
    });

    // Find common primes
    const firstCounts = factorsList[0].counts;
    const commonPrimes = {};
    for (let p in firstCounts) {
        let minPower = firstCounts[p];
        let isCommon = true;
        for (let i = 1; i < factorsList.length; i++) {
            if (!factorsList[i].counts[p]) {
                isCommon = false;
                break;
            }
            minPower = Math.min(minPower, factorsList[i].counts[p]);
        }
        if (isCommon) commonPrimes[p] = minPower;
    }

    let hcf = 1;
    const parts = [];
    for (let p in commonPrimes) {
        hcf *= Math.pow(parseInt(p), commonPrimes[p]);
        parts.push(commonPrimes[p] > 1 ? `${p}<sup>${commonPrimes[p]}</sup>` : p);
    }
    return { hcf, factorsList, commonPrimes, parts };
}

function listingMethod(numbers) {
    const allFactors = numbers.map(n => ({ n, list: getFactors(n) }));
    const firstList = allFactors[0].list;
    const common = firstList.filter(f => allFactors.every(item => item.list.includes(f)));
    return { hcf: Math.max(...common), allFactors, common };
}

function cakeMethod(numbers) {
    let working = [...numbers];
    const primes = [];
    const steps = [];
    let p = 2;
    const MAX_ITERATIONS = 2000;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
        iterations++;
        const allDivisible = working.every(n => n % p === 0);
        if (allDivisible) {
            const before = [...working];
            working = working.map(n => n / p);
            if (steps.length < 50) {
                steps.push({ p, before, after: [...working] });
            }
            primes.push(p);
        } else {
            p = getNextPrime(p);
            if (working.some(n => n <= 1 || p > n)) break;
        }
    }
    const hcf = primes.reduce((a, b) => a * b, 1);
    return { hcf, steps, final: working, primes, isStepCapped: (steps.length >= 50) };
}

// --- Controller ---
function calculateHCF() {
    const error = document.getElementById('hcfError');
    const resultDiv = document.getElementById('hcfResult');
    const stepsDiv = document.getElementById('hcfSteps');
    const stepsContent = document.getElementById('stepsContent');

    error.style.display = 'none';
    const inputVal = document.getElementById('hcfNumbers').value;
    const numbers = parseNumbers(inputVal);
    const method = document.getElementById('hcfMethod').value;

    if (numbers === null) {
        error.textContent = 'Only positive integers are allowed. Please check your input.';
        error.style.display = 'block';
        return;
    }
    if (numbers.length < 2) {
        error.textContent = 'Please enter at least two positive integers.';
        error.style.display = 'block';
        return;
    }
    if (numbers.length > 50) {
        error.textContent = 'Too many numbers. Limit to 50.';
        error.style.display = 'block';
        return;
    }
    if (numbers.some(n => n > 10000000)) {
        error.textContent = 'Numbers too large. Limit to 10,000,000.';
        error.style.display = 'block';
        return;
    }

    let res;
    let html = '';

    try {
        switch (method) {
            case 'euclidean':
                res = euclideanMethod(numbers);
                html = `<div class="hcf-step"><h3><i class="fas fa-microchip"></i> Euclidean Algorithm</h3>`;
                if (res.isPair) {
                    html += `<p>Repeated division until remainder is zero:</p><ul style="line-height:1.8;">`;
                    res.steps.forEach(s => html += `<li>${s}</li>`);
                    html += `</ul><p>The last non-zero remainder is <span class="highlight">${res.hcf}</span>.</p>`;
                } else {
                    html += `<p>Applying GCD iteratively across the set:</p><ul>`;
                    res.steps.forEach(s => html += `<li>${s}</li>`);
                    html += `</ul><p>Final HCF is <span class="highlight">${res.hcf}</span>.</p>`;
                }
                html += `</div>`;
                break;
            case 'prime':
                res = primeFactorization(numbers);
                html = `<div class="hcf-step"><h3><i class="fas fa-atom"></i> Prime Factorization</h3>`;
                const tableRows = res.factorsList.map(item => {
                    return [item.n, item.factors.join(' × ')];
                });
                html += createTable(['Number', 'Prime Factors'], tableRows);
                html += `<p><strong>Common Primes with lowest powers:</strong> `;
                if (res.parts.length) {
                    html += `${res.parts.join(' × ')} = ${res.hcf}</p>`;
                } else {
                    html += `None. HCF = 1</p>`;
                }
                html += `</div>`;
                break;
            case 'listing':
                if (numbers.some(n => n > 100000)) {
                    html = `<div class="hcf-error" style="display:block;">Listing method is slow for numbers > 100,000. Using Prime Factorization instead.</div>`;
                    res = primeFactorization(numbers);
                }
                res = listingMethod(numbers);
                html += `<div class="hcf-step"><h3><i class="fas fa-list-ol"></i> Listing Factors</h3>`;
                res.allFactors.forEach(item => {
                    html += `<p>Factors of ${item.n}: ${item.list.slice(0, 15).join(', ')}${item.list.length > 15 ? '...' : ''}</p>`;
                });
                html += `<p>Common Factors: ${res.common.join(', ')}</p>`;
                html += `<p>Highest Common Factor: <span class="highlight">${res.hcf}</span></p></div>`;
                break;
            case 'cake':
                res = cakeMethod(numbers);
                html = `<div class="hcf-step"><h3><i class="fas fa-layer-group"></i> Cake Method</h3>
                        <p>Divide by factors common to ALL numbers.</p>`;
                if (res.steps.length) {
                    html += createTable(['Step', 'Divisor', 'Remaining numbers'],
                        res.steps.map((s, i) => [i + 1, `<span class="highlight">${s.p}</span>`, s.after.join(', ')]));
                    html += `<p><strong>HCF = ${res.primes.join(' × ')} = ${res.hcf}</strong></p>`;
                } else {
                    html += `<p>No common divisors found (other than 1). HCF = 1</p>`;
                }
                html += `</div>`;
                break;
            default:
                const simpleGcd = numbers.reduce((a, b) => gcd(a, b));
                res = { hcf: simpleGcd };
                html = `<p>Calculation complete using standard formula.</p>`;
        }

        document.getElementById('hcfValue').textContent = res.hcf;
        stepsContent.innerHTML = html;
        resultDiv.style.display = 'block';
        stepsDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {
        error.textContent = 'Computation error: ' + e.message;
        error.style.display = 'block';
    }
}

function clearCalculator() {
    document.getElementById('hcfNumbers').value = '';
    document.getElementById('hcfError').style.display = 'none';
    document.getElementById('hcfResult').style.display = 'none';
    document.getElementById('hcfSteps').style.display = 'none';
}
