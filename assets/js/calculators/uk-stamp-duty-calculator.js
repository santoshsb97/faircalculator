(function () {
  // SDLT rates configuration (2025-2026)
  var RATES = {
    standard: [
      { min: 0, max: 125000, rate: 0 },
      { min: 125000, max: 250000, rate: 2 },
      { min: 250000, max: 925000, rate: 5 },
      { min: 925000, max: 1500000, rate: 10 },
      { min: 1500000, max: Infinity, rate: 12 }
    ],
    firstTimeBuyer: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 500000, rate: 5 }
    ],
    additionalPropertySurchargePct: 5,
    nonUKResidentSurchargePct: 2
  };

  // Toggle checkbox visual state and enforce mutual exclusivity (hard-disable)
  function toggleCheckbox(id) {
    var card = document.getElementById(id + 'Card');
    var checkbox = document.getElementById(id);

    if (checkbox.checked) {
      card.classList.add('active');
      if (id === 'firstTimeBuyer') {
        // Disable Additional Property
        var addProp = document.getElementById('additionalProperty');
        var addCard = document.getElementById('additionalPropertyCard');
        addProp.checked = false;
        addProp.disabled = true;
        addCard.classList.remove('active');
        addCard.style.opacity = '0.5';
        addCard.style.cursor = 'not-allowed';
      } else if (id === 'additionalProperty') {
        // Disable First Time Buyer
        var ftb = document.getElementById('firstTimeBuyer');
        var ftbCard = document.getElementById('firstTimeBuyerCard');
        ftb.checked = false;
        ftb.disabled = true;
        ftbCard.classList.remove('active');
        ftbCard.style.opacity = '0.5';
        ftbCard.style.cursor = 'not-allowed';
      }
    } else {
      card.classList.remove('active');
      // Re-enable the other option (if allowed by other rules e.g. price)
      if (id === 'firstTimeBuyer') {
        var addProp = document.getElementById('additionalProperty');
        var addCard = document.getElementById('additionalPropertyCard');
        addProp.disabled = false;
        addCard.style.opacity = '1';
        addCard.style.cursor = 'pointer';
      } else if (id === 'additionalProperty') {
        // Only re-enable FTB if price <= 500k
        var priceRaw = document.getElementById('purchasePrice').value;
        var price = parseInt(priceRaw.replace(/[^0-9]/g, '') || '0', 10);
        checkFTBValidation(price);
      }
    }
  }

  // Max price safeguard to protect layout
  var MAX_PRICE = 100000000;

  // Format input with commas and check FTB eligibility
  function formatInput(input) {
    var raw = input.value.replace(/[^0-9]/g, '');
    if (!raw) {
      input.value = '';
      checkFTBValidation(0);
      return;
    }
    var n = parseInt(raw, 10);

    // Sanity Check: Max £100m to prevent UI break
    if (n > MAX_PRICE) {
      n = MAX_PRICE;
    }

    input.value = n.toLocaleString('en-GB');
    checkFTBValidation(n);
  }

  // Check FTB Eligibility for properties > 500k
  function checkFTBValidation(price) {
    var ftbCheckbox = document.getElementById('firstTimeBuyer');
    var ftbCard = document.getElementById('firstTimeBuyerCard');
    var warning = document.getElementById('ftb-warning');
    var addProp = document.getElementById('additionalProperty');

    if (price > 500000) {
      // If price > 500k, FTB is always disabled
      if (!ftbCheckbox.disabled || ftbCheckbox.checked) {
        if (ftbCheckbox.checked) {
          ftbCheckbox.checked = false;
          ftbCard.classList.remove('active');
          if (warning) {
            warning.style.display = 'block';
            // Auto hide warning after 5 seconds
            setTimeout(function () { warning.style.display = 'none'; }, 5000);
          }
        }
        ftbCheckbox.disabled = true;
        ftbCard.style.opacity = '0.5';
        ftbCard.style.cursor = 'not-allowed';
        ftbCard.title = 'Not available for properties over £500,000';
      }
    } else {
      // Price allows FTB, but check if Additional Property is selected
      if (!addProp.checked) {
        if (ftbCheckbox.disabled) {
          ftbCheckbox.disabled = false;
          ftbCard.style.opacity = '1';
          ftbCard.style.cursor = 'pointer';
          ftbCard.title = '';
          if (warning) warning.style.display = 'none';
        }
      }
    }
  }

  // Calculate SDLT
  function calculateSDLT() {
    var priceRaw = document.getElementById('purchasePrice').value;
    var price = parseFloat(priceRaw.replace(/[^0-9]/g, ''));

    if (isNaN(price) || price <= 0) {
      showError();
      return;
    }

    if (price > MAX_PRICE) {
      alert('Please enter a value up to £100,000,000');
      return;
    }

    hideError();
    showLoading();

    setTimeout(function () {
      var isFTB = document.getElementById('firstTimeBuyer').checked;
      var hasAdditional = document.getElementById('additionalProperty').checked;
      var isNonUK = document.getElementById('nonUKResident').checked;

      var baseTax = 0;
      var breakdown = [];

      // Apply tax bands
      function applyBands(bands, rateType) {
        for (var i = 0; i < bands.length; i++) {
          var b = bands[i];
          if (price > b.min) {
            var taxable = Math.min(price, b.max) - b.min;
            if (taxable > 0) {
              var tax = taxable * (b.rate / 100);
              breakdown.push({
                min: b.min,
                max: b.max === Infinity ? 'Above' : b.max,
                rate: b.rate,
                taxableAmount: taxable,
                tax: tax,
                type: rateType
              });
              baseTax += tax;
            }
          }
        }
      }

      // Decide which bands to use
      if (isFTB && price <= 500000) {
        applyBands(RATES.firstTimeBuyer, 'First-Time Buyer Rate');
      } else {
        applyBands(RATES.standard, 'Standard Rate');
      }

      // Calculate surcharges
      var additionalSurcharge = 0;
      var nonUKSurcharge = 0;
      if (hasAdditional) {
        additionalSurcharge = price * (RATES.additionalPropertySurchargePct / 100);
      }
      if (isNonUK) {
        nonUKSurcharge = price * (RATES.nonUKResidentSurchargePct / 100);
      }

      var totalSurcharges = additionalSurcharge + nonUKSurcharge;
      var totalTax = baseTax + totalSurcharges;
      var effectiveRate = (totalTax / price) * 100;

      displayResults(price, baseTax, totalTax, totalSurcharges, additionalSurcharge, nonUKSurcharge, effectiveRate, breakdown, isFTB && price <= 500000);

      // Comparison Logic
      if (document.getElementById('enableComparison').checked) {
        var altTax = 0;
        var altTitle = "";
        var isFTB_alt = isFTB;
        var hasAdditional_alt = hasAdditional;

        if (isFTB) {
          // Compare with non-FTB
          isFTB_alt = false;
          altTitle = "If you were NOT a First-Time Buyer";
        } else if (hasAdditional) {
          // Compare with non-additional
          hasAdditional_alt = false;
          altTitle = "If this were NOT an additional property";
        } else {
          // Compare with FTB (if price <= 500k) or Additional (if price > 500k)
          if (price <= 500000) {
            isFTB_alt = true;
            altTitle = "If you WERE a First-Time Buyer";
          } else {
            hasAdditional_alt = true;
            altTitle = "If this WERE an additional property";
          }
        }

        var altBaseTax = 0;
        var altBands = (isFTB_alt && price <= 500000) ? RATES.firstTimeBuyer : RATES.standard;
        for (var j = 0; j < altBands.length; j++) {
          var ab = altBands[j];
          if (price > ab.min) {
            altBaseTax += (Math.min(price, ab.max) - ab.min) * (ab.rate / 100);
          }
        }
        var altSurcharge = (hasAdditional_alt ? (price * 0.05) : 0) + (isNonUK ? (price * 0.02) : 0);
        altTax = Math.floor(altBaseTax + altSurcharge);

        document.getElementById('comparisonSection').style.display = 'block';
        document.getElementById('currentTotalTax').textContent = '£' + Math.floor(totalTax).toLocaleString('en-GB');
        document.getElementById('currentSummary').textContent = (isFTB ? "First-Time Buyer" : "") + (hasAdditional ? " (+Surcharge)" : "") || "Standard Purchase";
        document.getElementById('altTotalTax').textContent = '£' + altTax.toLocaleString('en-GB');
        document.getElementById('altSummary').textContent = altTitle;

        var diff = Math.floor(totalTax) - altTax;
        var absDiff = Math.abs(diff);
        document.getElementById('taxDifference').textContent = '£' + absDiff.toLocaleString('en-GB');

        var diffCard = document.getElementById('taxDifference').parentElement;
        if (diff > 0) {
          document.getElementById('diffLabel').textContent = "Potential Savings";
          diffCard.style.background = "#eff6ff";
          diffCard.style.borderColor = "#bfdbfe";
          document.getElementById('taxDifference').style.color = "#1e40af";
          document.getElementById('diffLabel').style.color = "#1e40af";
        } else if (diff < 0) {
          document.getElementById('diffLabel').textContent = "Extra Cost";
          diffCard.style.background = "#fff1f2";
          diffCard.style.borderColor = "#fecdd3";
          document.getElementById('taxDifference').style.color = "#9f1239";
          document.getElementById('diffLabel').style.color = "#9f1239";
        } else {
          document.getElementById('diffLabel').textContent = "No Difference";
          diffCard.style.background = "#f8f9fa";
          diffCard.style.borderColor = "#e2e8f0";
          document.getElementById('taxDifference').style.color = "#495057";
          document.getElementById('diffLabel').style.color = "#495057";
        }
      } else {
        document.getElementById('comparisonSection').style.display = 'none';
      }

      hideLoading();
    }, 250);
  }

  // Display results
  function displayResults(price, baseTax, totalTax, totalSurcharges, additionalSurcharge, nonUKSurcharge, effectiveRate, breakdown, ftbApplied) {
    var section = document.getElementById('resultsSection');
    if (section) section.classList.add('show');

    var roundedTax = Math.floor(totalTax);
    var elTotalTax = document.getElementById('totalTax');
    if (elTotalTax) elTotalTax.textContent = '£' + roundedTax.toLocaleString('en-GB');

    var elTotalTaxWords = document.getElementById('totalTaxWords');
    if (elTotalTaxWords) elTotalTaxWords.textContent = numberToWords(roundedTax);

    var elEffectiveRate = document.getElementById('effectiveRate');
    if (elEffectiveRate) elEffectiveRate.textContent = 'Effective rate: ' + effectiveRate.toFixed(2) + '%';

    var elSummaryPrice = document.getElementById('summaryPrice');
    if (elSummaryPrice) elSummaryPrice.textContent = '£' + Math.round(price).toLocaleString('en-GB');

    var elSummaryBaseTax = document.getElementById('summaryBaseTax');
    if (elSummaryBaseTax) elSummaryBaseTax.textContent = '£' + baseTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    var elSummarySurcharges = document.getElementById('summarySurcharges');
    if (elSummarySurcharges) elSummarySurcharges.textContent = '£' + totalSurcharges.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    var elSummaryTotal = document.getElementById('summaryTotal');
    if (elSummaryTotal) elSummaryTotal.textContent = '£' + roundedTax.toLocaleString('en-GB');

    var tbody = document.getElementById('breakdownBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (ftbApplied) {
        var headerRow = tbody.insertRow();
        headerRow.innerHTML = '<td colspan="4" style="background:#e7f3ff;color:#0066cc;font-weight:bold;text-align:center;">First-Time Buyer Relief Applied (up to £500,000)</td>';
      }

      for (var i = 0; i < breakdown.length; i++) {
        var b = breakdown[i];
        var row = tbody.insertRow();
        if (b.tax > 0) row.className = 'active-band';
        var bandText = b.max === 'Above' ? 'Above £' + b.min.toLocaleString('en-GB') : '£' + b.min.toLocaleString('en-GB') + ' - £' + b.max.toLocaleString('en-GB');
        row.insertCell(0).textContent = bandText;
        row.insertCell(1).textContent = b.rate + '%';
        row.insertCell(2).textContent = '£' + Math.round(b.taxableAmount).toLocaleString('en-GB');
        row.insertCell(3).textContent = '£' + b.tax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      if (breakdown.length > 0) {
        var baseTotalRow = tbody.insertRow();
        baseTotalRow.style.borderTop = '2px solid #dee2e6';
        baseTotalRow.style.fontWeight = 'bold';
        baseTotalRow.insertCell(0).innerHTML = '<strong>Base Tax Total</strong>';
        baseTotalRow.insertCell(1).textContent = '';
        baseTotalRow.insertCell(2).textContent = '';
        baseTotalRow.insertCell(3).innerHTML = '<strong>£' + baseTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</strong>';
      }

      if (additionalSurcharge > 0) {
        var r = tbody.insertRow();
        r.className = 'surcharge-row';
        r.insertCell(0).innerHTML = '<strong>Additional Property Surcharge</strong>';
        r.insertCell(1).innerHTML = '<strong>5%</strong>';
        r.insertCell(2).textContent = '£' + Math.round(price).toLocaleString('en-GB');
        r.insertCell(3).innerHTML = '<strong>£' + additionalSurcharge.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</strong>';
      }

      if (nonUKSurcharge > 0) {
        var r2 = tbody.insertRow();
        r2.className = 'surcharge-row';
        r2.insertCell(0).innerHTML = '<strong>Non-UK Resident Surcharge</strong>';
        r2.insertCell(1).innerHTML = '<strong>2%</strong>';
        r2.insertCell(2).textContent = '£' + Math.round(price).toLocaleString('en-GB');
        r2.insertCell(3).innerHTML = '<strong>£' + nonUKSurcharge.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</strong>';
      }

      if (totalSurcharges > 0) {
        var totalRow = tbody.insertRow();
        totalRow.className = 'total-row';
        totalRow.insertCell(0).innerHTML = '<strong>TOTAL STAMP DUTY</strong>';
        totalRow.insertCell(1).textContent = '';
        totalRow.insertCell(2).textContent = '';
        totalRow.insertCell(3).innerHTML = '<strong style="color:#667eea;font-size:1.2em;">£' + roundedTax.toLocaleString('en-GB') + '</strong>';
      }
    }

    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showLoading() {
    var loading = document.getElementById('loadingState');
    if (loading) loading.classList.add('show');
    var section = document.getElementById('resultsSection');
    if (section) section.classList.remove('show');
  }

  function hideLoading() {
    var loading = document.getElementById('loadingState');
    if (loading) loading.classList.remove('show');
  }

  function showError() {
    var err = document.getElementById('errorMessage');
    if (err) err.classList.add('show');
    var section = document.getElementById('resultsSection');
    if (section) section.classList.remove('show');
  }

  function hideError() {
    var err = document.getElementById('errorMessage');
    if (err) err.classList.remove('show');
  }

  function numberToWords(n) {
    if (n === 0) return "Zero Pounds";
    var string = n.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;
    var and = 'and';
    if (n > 1000000) and = '';

    string = string.replace(/[, ]/g, "");
    if (parseFloat(string) != parseFloat(string)) return 'NaN';

    var units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    var scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion'];

    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }
    chunksLen = chunks.length;
    if (chunksLen > scales.length) return '';
    words = [];
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i]);
      if (chunk) {
        ints = chunks[i].split('').reverse().map(parseFloat);
        if (ints[1] === 1) {
          ints[0] += 10;
        }
        if ((word = scales[i])) {
          words.push(word);
        }
        if ((word = units[ints[0]])) {
          words.push(word);
        }
        if ((word = tens[ints[1]])) {
          words.push(word);
        }
        if (ints[0] || ints[1]) {
        }
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }
      }
    }
    return words.reverse().join(' ') + ' Pounds';
  }

  // Event listeners
  var elPurchasePrice = document.getElementById('purchasePrice');
  if (elPurchasePrice) {
    elPurchasePrice.addEventListener('input', function () {
      formatInput(this);
    });
    elPurchasePrice.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') calculateSDLT();
    });
  }

  var elFirstTimeBuyer = document.getElementById('firstTimeBuyer');
  if (elFirstTimeBuyer) {
    elFirstTimeBuyer.addEventListener('change', function () {
      toggleCheckbox('firstTimeBuyer');
    });
  }

  var elAdditionalProperty = document.getElementById('additionalProperty');
  if (elAdditionalProperty) {
    elAdditionalProperty.addEventListener('change', function () {
      toggleCheckbox('additionalProperty');
    });
  }

  var elNonUKResident = document.getElementById('nonUKResident');
  if (elNonUKResident) {
    elNonUKResident.addEventListener('change', function () {
      toggleCheckbox('nonUKResident');
    });
  }

  var elCalculateButton = document.getElementById('calculateButton');
  if (elCalculateButton) {
    elCalculateButton.addEventListener('click', calculateSDLT);
  }

  // Initialize
  if (elFirstTimeBuyer) elFirstTimeBuyer.checked = false;
  if (elNonUKResident) elNonUKResident.checked = false;
  document.querySelectorAll('.checkbox-card').forEach(function (card) {
    card.classList.remove('active');
  });

  // Verification Logic
  window.verifySDLT = function () {
    console.log('Running SDLT Verification Tests...');
    var tests = [
      { price: 200000, ftb: false, add: false, nonUK: false, expected: 1500, name: 'Standard £200k' },
      { price: 300000, ftb: false, add: false, nonUK: false, expected: 5000, name: 'Standard £300k' },
      { price: 300000, ftb: true, add: false, nonUK: false, expected: 0, name: 'FTB £300k' },
      { price: 400000, ftb: true, add: false, nonUK: false, expected: 5000, name: 'FTB £400k' },
      { price: 200000, ftb: false, add: true, nonUK: false, expected: 11500, name: 'Add. Prop £200k' },
      { price: 1000000, ftb: false, add: false, nonUK: true, expected: 61250, name: 'Non-UK £1m' }
    ];

    tests.forEach(function (t) {
      var tax = 0;
      var bands = RATES.standard;
      if (t.ftb && t.price <= 500000) bands = RATES.firstTimeBuyer;

      var baseTax = 0;
      for (var i = 0; i < bands.length; i++) {
        var b = bands[i];
        if (t.price > b.min) {
          var taxable = Math.min(t.price, b.max) - b.min;
          baseTax += taxable * (b.rate / 100);
        }
      }

      var surcharge = 0;
      if (t.add) surcharge += t.price * 0.05;
      if (t.nonUK) surcharge += t.price * 0.02;

      var total = Math.floor(baseTax + surcharge);

      if (Math.abs(total - t.expected) <= 1) {
        console.log('[PASS] ' + t.name + ': £' + total);
      } else {
        console.error('[FAIL] ' + t.name + ': Expected £' + t.expected + ', Got £' + total);
      }
    });
    console.log('Verification Complete.');
  };

})();