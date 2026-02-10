/* week-calculator - Lazy Loaded JavaScript */

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function populateAllDropdowns() {
    const currentYear = new Date().getFullYear();
    const monthSelectors = document.querySelectorAll('.month-sel');
    const daySelectors = document.querySelectorAll('.day-sel');
    const yearSelectors = document.querySelectorAll('.year-sel');

    yearSelectors.forEach(sel => {
        sel.innerHTML = '';
        for (let i = currentYear - 50; i <= currentYear + 50; i++) {
            const opt = new Option(i, i);
            if (i === currentYear) opt.selected = true;
            sel.add(opt);
        }
    });

    monthSelectors.forEach(sel => {
        sel.innerHTML = '';
        monthNames.forEach((m, idx) => {
            const opt = new Option(m, idx);
            if (idx === new Date().getMonth()) opt.selected = true;
            sel.add(opt);
        });
    });

    // Initial day population
    monthSelectors.forEach(sel => updateDaysForSelect(sel));

    // Set specific defaults
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Diff Tab
    setSelects('diff-start', today);
    setSelects('diff-end', nextWeek);

    // Add Tab
    setSelects('add-start', today);

    document.getElementById('current-week-info').innerHTML = "<i class='fas fa-info-circle'></i> Today: " + today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " &nbsp;|&nbsp; <strong>ISO Week " + getISOWeek(today) + "</strong>";
}

function updateDaysForSelect(monthSel) {
    const row = monthSel.closest('.select-row');
    const yearSel = row.querySelector('.year-sel');
    const daySel = row.querySelector('.day-sel');

    const year = parseInt(yearSel.value);
    const month = parseInt(monthSel.value);
    const currentDay = parseInt(daySel.value) || 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    daySel.innerHTML = '';
    for (let i = 1; i <= daysInMonth; i++) {
        daySel.add(new Option(i, i));
    }
    daySel.value = currentDay <= daysInMonth ? currentDay : daysInMonth;
}

function setSelects(prefix, date) {
    document.getElementById(prefix + '-month').value = date.getMonth();
    updateDaysForSelect(document.getElementById(prefix + '-month'));
    document.getElementById(prefix + '-day').value = date.getDate();
    document.getElementById(prefix + '-year').value = date.getFullYear();
}

function getFromSelects(prefix) {
    const m = parseInt(document.getElementById(prefix + '-month').value);
    const d = parseInt(document.getElementById(prefix + '-day').value);
    const y = parseInt(document.getElementById(prefix + '-year').value);
    return new Date(y, m, d);
}

function getISOWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function switchWTab(tab) {
    document.querySelectorAll('.week-tab-content').forEach(function (el) { el.classList.remove('active') });
    document.querySelectorAll('.week-tab-btn').forEach(function (el) {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
    });

    document.getElementById('wtab-' + tab).classList.add('active');
    var idx = tab === 'diff' ? 0 : 1;
    var activeBtn = document.querySelectorAll('.week-tab-btn')[idx];
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
}

function calcWeekDiff() {
    const d1 = getFromSelects('diff-start');
    const d2 = getFromSelects('diff-end');

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { alert("Invalid dates"); return; }

    var diffTime = Math.abs(d2 - d1);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    var weeks = Math.floor(diffDays / 7);
    var days = diffDays % 7;

    var resStr = weeks + " Week" + (weeks !== 1 ? "s" : "");
    if (days > 0) resStr += " and " + days + " Day" + (days !== 1 ? "s" : "");

    document.getElementById('diff-result-main').innerHTML = resStr;
    document.getElementById('diff-result-details').innerHTML =
        "<strong>Total Days:</strong> " + diffDays + " days<br>" +
        "<strong>Approx. Months:</strong> " + (diffDays / 30.44).toFixed(1) + " months<br>" +
        "<strong>From:</strong> " + d1.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + "<br>" +
        "<strong>To:</strong> " + d2.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    var resContainer = document.getElementById('res-diff');
    resContainer.classList.add('show');

    if (window.innerWidth < 768) {
        resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function calcWeekAdd() {
    const d1 = getFromSelects('add-start');
    if (isNaN(d1.getTime())) { alert("Invalid start date"); return; }
    var num = parseInt(document.getElementById('add-num-weeks').value);
    var op = document.querySelector('input[name="w-op"]:checked').value;

    if (isNaN(num)) num = 0;
    var daysToAdd = num * 7;
    if (op === 'sub') daysToAdd = -daysToAdd;

    var d2 = new Date(d1);
    d2.setDate(d1.getDate() + daysToAdd);

    var opText = op === 'add' ? 'Added' : 'Subtracted';

    document.getElementById('add-result-main').innerHTML = d2.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('add-result-details').innerHTML =
        "<strong>ISO Week Number:</strong> Week " + getISOWeek(d2) + "<br>" +
        "<strong>Starting From:</strong> " + d1.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + "<br>" +
        "<strong>Operation:</strong> " + opText + " " + num + " week" + (num !== 1 ? "s" : "") + " (" + Math.abs(daysToAdd) + " days)";

    var resContainer = document.getElementById('res-add');
    resContainer.classList.add('show');

    if (window.innerWidth < 768) {
        resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

document.querySelectorAll('.month-sel, .year-sel').forEach(sel => {
    sel.addEventListener('change', (e) => {
        const monthSel = e.target.classList.contains('month-sel') ? e.target : e.target.closest('.select-row').querySelector('.month-sel');
        updateDaysForSelect(monthSel);
    });
});

// Search Hide Logic
const searchInput = document.getElementById('searchInput');
const toolContainer = document.getElementById('tool-container');
if (searchInput && toolContainer) {
    searchInput.addEventListener('input', (e) => {
        toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
    });
}

window.addEventListener('load', () => {
    populateAllDropdowns();
    const dT = document.getElementById('tab-btn-diff');
    const aT = document.getElementById('tab-btn-add');
    if (dT) dT.addEventListener('click', () => switchWTab('diff'));
    if (aT) aT.addEventListener('click', () => switchWTab('add'));
    const dC = document.getElementById('calcWeekDiffBtn');
    const aC = document.getElementById('calcWeekAddBtn');
    if (dC) dC.addEventListener('click', calcWeekDiff);
    if (aC) aC.addEventListener('click', calcWeekAdd);
});