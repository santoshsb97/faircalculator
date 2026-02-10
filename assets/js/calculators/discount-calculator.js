/* discount-calculator - Lazy Loaded JavaScript */

let discountType = 'percentage';

        document.addEventListener('DOMContentLoaded', () => {
            // Add Enter Key Support
            document.querySelectorAll('.input-field').forEach(input => {
                input.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') calculateDiscount();
                });
            });

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }
        });

        function setDiscountType(type) {
            discountType = type;
            const buttons = document.querySelectorAll('.type-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const label = document.getElementById('discountLabel');
            const input = document.getElementById('discountValue');
            const quickDiscounts = document.getElementById('quickDiscounts');

            if (type === 'percentage') {
                label.textContent = 'Discount (%)';
                input.placeholder = '20';
                quickDiscounts.style.display = 'block';
            } else {
                label.textContent = 'Discount Amount ($)';
                input.placeholder = '10.00';
                quickDiscounts.style.display = 'none';
            }

            input.value = '';
        }

        function setQuickDiscount(value) {
            document.getElementById('discountValue').value = value;
            calculateDiscount();
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 2
            }).format(amount);
        }

        function showError(message) {
            const errorElement = document.getElementById('error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            document.getElementById('result').style.display = 'none';
            document.getElementById('tableContainer').style.display = 'none';
        }

        function calculateDiscount() {
            const errorElement = document.getElementById('error');
            errorElement.style.display = 'none';
            errorElement.textContent = '';

            // Inputs
            const originalPrice = parseFloat(document.getElementById('originalPrice').value) || 0;
            const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const shipping = parseFloat(document.getElementById('shipping').value) || 0;
            const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();

            // Validation
            if (originalPrice <= 0) { showError('Please enter a valid original price'); return; }
            if (discountValue < 0) { showError('Discount cannot be negative'); return; }
            if (quantity < 1) { showError('Quantity must be at least 1'); return; }

            let discountAmount, discountPercentage;

            if (discountType === 'percentage') {
                if (discountValue > 100) { showError('Discount cannot exceed 100%'); return; }
                discountPercentage = discountValue;
                discountAmount = originalPrice * (discountValue / 100);
            } else {
                if (discountValue > originalPrice) { showError('Discount cannot exceed price'); return; }
                discountAmount = discountValue;
                discountPercentage = (discountValue / originalPrice) * 100;
            }

            // Calculations
            const priceAfterDiscount = originalPrice - discountAmount;
            const subtotal = priceAfterDiscount * quantity;
            const taxAmount = subtotal * (taxRate / 100);
            const finalTotal = subtotal + taxAmount + shipping;
            const totalSavings = discountAmount * quantity;

            // Update UI
            document.getElementById('res-original').textContent = formatCurrency(originalPrice);
            document.getElementById('res-discount-amount').textContent = formatCurrency(discountAmount);
            document.getElementById('res-discount-percent').textContent = discountPercentage.toFixed(1) + '%';
            document.getElementById('res-after-discount').textContent = formatCurrency(priceAfterDiscount);
            document.getElementById('res-quantity').textContent = quantity;
            document.getElementById('res-subtotal').textContent = formatCurrency(subtotal);
            document.getElementById('res-tax').textContent = formatCurrency(taxAmount);
            document.getElementById('res-shipping').textContent = formatCurrency(shipping);
            document.getElementById('res-savings').textContent = formatCurrency(totalSavings);
            document.getElementById('res-total').textContent = formatCurrency(finalTotal);

            // Coupon
            const couponDisplay = document.getElementById('couponDisplay');
            if (couponCode) {
                document.getElementById('displayedCoupon').textContent = couponCode;
                couponDisplay.style.display = 'block';
            } else {
                couponDisplay.style.display = 'none';
            }

            // Generate Table
            generateComparisonTable(originalPrice, quantity, taxRate, shipping, discountPercentage);

            document.getElementById('result').style.display = 'block';
            document.getElementById('tableContainer').style.display = 'block';

            if (window.innerWidth < 768) {
                document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function generateComparisonTable(originalPrice, quantity, taxRate, shipping, currentDiscount) {
            const tbody = document.getElementById('comparisonTableBody');
            tbody.innerHTML = '';
            document.getElementById('table-qty').textContent = quantity;

            const discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75];

            discounts.forEach(discount => {
                const discountAmt = originalPrice * (discount / 100);
                const priceAfter = originalPrice - discountAmt;
                const sub = priceAfter * quantity;
                const tax = sub * (taxRate / 100);
                const final = sub + tax + shipping;
                const savings = discountAmt * quantity;

                const tr = document.createElement('tr');
                if (Math.abs(discount - currentDiscount) < 0.5) tr.classList.add('highlight-row');

                tr.innerHTML = `
                <td class="text-center"><strong>${discount}%</strong></td>
                <td>${formatCurrency(priceAfter)}</td>
                <td>${formatCurrency(sub)}</td>
                <td style="color:#10b981;">${formatCurrency(savings)}</td>
                <td><strong>${formatCurrency(final)}</strong></td>
            `;
                tbody.appendChild(tr);
            });
        }

        function toggleFAQ(element) {
            const answer = element.nextElementSibling;
            answer.classList.toggle('show');
        }