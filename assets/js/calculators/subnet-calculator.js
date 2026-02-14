/**
 * Subnet Calculator
 * Calculates network address, broadcast address, subnet mask, and host ranges
 * for IPv4 addresses with CIDR notation
 */

(function () {
    'use strict';

    // Configuration
    // Configuration
    const CONFIG = {
        minCIDR: 1,
        maxCIDR: 32,
        minCIDRv6: 1,
        maxCIDRv6: 128,
        ipPattern: /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
        ipv6Pattern: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/
    };

    // State
    const state = {
        protocol: 'ipv4' // 'ipv4' or 'ipv6'
    };

    // DOM Elements
    const elements = {
        ipInput: null,
        cidrInput: null,
        calculateBtn: null,
        protocolToggle: null,
        toggleBtns: null,
        ipLabel: null,
        cidrLabel: null,
        resIpAddress: null,
        networkAddress: null,
        broadcastAddress: null,
        subnetMask: null,
        wildcardMask: null,
        binarySubnetMask: null,
        totalHosts: null,
        usableHosts: null,
        hostRange: null,
        ipClass: null,
        cidrNotation: null,
        ipType: null,
        shortId: null,
        binaryId: null,
        integerId: null,
        hexId: null,
        inAddrArpa: null,
        ipv4Mapped: null,
        sixToFour: null,
        resultContainer: null
    };

    /**
     * Initialize the calculator
     */
    function init() {
        try {
            cacheDOMElements();

            if (!validateElements()) {
                console.error('Required calculator elements not found');
                return;
            }

            attachEventListeners();

            // Set default values
            setDefaultValues();

            console.log('Subnet Calculator initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    /**
     * Cache all DOM elements
     */
    function cacheDOMElements() {
        elements.ipInput = document.getElementById('ip-address');
        elements.cidrInput = document.getElementById('cidr');
        elements.calculateBtn = document.getElementById('calculate-btn');
        elements.protocolToggle = document.querySelector('.protocol-toggle');
        elements.toggleBtns = document.querySelectorAll('.toggle-btn');
        elements.ipLabel = document.getElementById('ip-label');
        elements.ipLabel = document.getElementById('ip-label');
        elements.cidrLabel = document.getElementById('cidr-label');

        // Class Selection
        elements.classSelection = document.getElementById('ipv4-class-selection');
        elements.classOptions = document.querySelectorAll('.class-option');

        // Result fields
        elements.resIpAddress = document.getElementById('res-ip-address');
        elements.networkAddress = document.getElementById('network-address');
        elements.broadcastAddress = document.getElementById('broadcast-address');
        elements.subnetMask = document.getElementById('subnet-mask');
        elements.wildcardMask = document.getElementById('wildcard-mask');
        elements.binarySubnetMask = document.getElementById('binary-subnet-mask');
        elements.totalHosts = document.getElementById('total-hosts');
        elements.usableHosts = document.getElementById('usable-hosts');
        elements.hostRange = document.getElementById('host-range');
        elements.ipClass = document.getElementById('ip-class');
        elements.cidrNotation = document.getElementById('cidr-notation');
        elements.ipType = document.getElementById('ip-type');
        elements.shortId = document.getElementById('short-id');
        elements.binaryId = document.getElementById('binary-id');
        elements.integerId = document.getElementById('integer-id');
        elements.hexId = document.getElementById('hex-id');
        elements.inAddrArpa = document.getElementById('in-addr-arpa');
        elements.ipv4Mapped = document.getElementById('ipv4-mapped');
        elements.sixToFour = document.getElementById('six-to-four');

        elements.lblTotalHosts = document.getElementById('label-total-hosts');
        elements.lblHostRange = document.getElementById('label-host-range');
        elements.lblNetwork = document.getElementById('label-network');
        elements.lblIpv4Mapped = document.getElementById('label-ipv4-mapped');

        elements.ipv4OnlyItems = document.querySelectorAll('.ipv4-only');
        elements.resultContainer = document.getElementById('resultContainer');
    }

    /**
     * Validate that required elements exist
     */
    function validateElements() {
        return elements.ipInput &&
            elements.cidrInput &&
            elements.calculateBtn;
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Calculate button
        if (elements.calculateBtn) {
            elements.calculateBtn.addEventListener('click', calculateSubnet);
        }



        // Protocol Toggle
        if (elements.toggleBtns) {
            elements.toggleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const protocol = btn.getAttribute('data-protocol');
                    switchProtocol(protocol);
                });
            });
        }

        // Real-time calculation on input
        if (elements.ipInput) {
            elements.ipInput.addEventListener('input', debounce(calculateSubnet, 500));
        }

        if (elements.cidrInput) {
            elements.cidrInput.addEventListener('input', () => {
                updateClassActiveState(elements.cidrInput.value);
                debounce(calculateSubnet, 500)();
            });
        }

        // Class Selection
        if (elements.classOptions) {
            elements.classOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const netClass = option.getAttribute('data-class');
                    let cidrValue = 24;
                    if (netClass === 'A') cidrValue = 8;
                    if (netClass === 'B') cidrValue = 16;

                    elements.cidrInput.value = cidrValue;
                    updateClassActiveState(cidrValue);
                    calculateSubnet();
                });
            });
        }

        // Enter key triggers calculation
        [elements.ipInput, elements.cidrInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        calculateSubnet();
                    }
                });
            }
        });
    }

    /**
     * Switch between IPv4 and IPv6
     */
    function switchProtocol(protocol) {
        if (state.protocol === protocol) return;

        state.protocol = protocol;

        // Update UI
        elements.toggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-protocol') === protocol);
        });

        if (elements.protocolToggle) {
            elements.protocolToggle.setAttribute('data-active', protocol);
        }

        if (protocol === 'ipv4') {
            elements.ipLabel.textContent = 'IP Address (IPv4)';
            elements.ipInput.placeholder = 'e.g. 192.168.1.0';
            elements.ipInput.value = '192.168.1.0';
            elements.cidrInput.value = '24';
            elements.cidrInput.max = 32;
            if (elements.classSelection) elements.classSelection.style.display = 'block';
            updateClassActiveState(24);

            // Labels for IPv4
            if (elements.lblNetwork) elements.lblNetwork.textContent = 'Network Address';
            if (elements.lblIpv4Mapped) elements.lblIpv4Mapped.textContent = 'IPv4 Mapped Address';
            if (elements.lblTotalHosts) elements.lblTotalHosts.textContent = 'Total Number of Hosts';
            if (elements.lblHostRange) elements.lblHostRange.textContent = 'Usable Host IP Range';

            // Show all fields
            if (elements.ipv4OnlyItems) {
                elements.ipv4OnlyItems.forEach(item => item.style.display = 'flex');
            }
        } else {
            elements.ipLabel.textContent = 'IP Address (IPv6)';
            elements.ipInput.placeholder = 'e.g. 2001:db8::';
            elements.ipInput.value = '2001:db8::';
            elements.cidrInput.value = '64';
            elements.cidrInput.max = 128;
            if (elements.classSelection) elements.classSelection.style.display = 'none';

            // Labels refined for IPv6 (User request: IP, Full IP, Total IP, Network, IP Range)
            if (elements.lblNetwork) elements.lblNetwork.textContent = 'Network:';
            if (elements.lblIpv4Mapped) elements.lblIpv4Mapped.textContent = 'Full IP Address:';
            if (elements.lblTotalHosts) elements.lblTotalHosts.textContent = 'Total IP Addresses:';
            if (elements.lblHostRange) elements.lblHostRange.textContent = 'IP Range:';

            // Hide IPv4 specific fields
            if (elements.ipv4OnlyItems) {
                elements.ipv4OnlyItems.forEach(item => item.style.display = 'none');
            }
        }

        calculateSubnet();
    }

    /**
     * Set default values
     */
    function setDefaultValues() {
        if (elements.ipInput) elements.ipInput.value = '192.168.1.0';
        if (elements.cidrInput) elements.cidrInput.value = '24';
        calculateSubnet();
    }

    /**
     * Validate IP address format (v4 or v6)
     */
    function validateIPAddress() {
        const ip = elements.ipInput.value.trim();
        if (!ip) return false;

        if (state.protocol === 'ipv4') {
            const match = ip.match(CONFIG.ipPattern);
            if (!match) return false;
            for (let i = 1; i <= 4; i++) {
                const octet = parseInt(match[i]);
                if (octet < 0 || octet > 255) return false;
            }
            return true;
        } else {
            return CONFIG.ipv6Pattern.test(ip);
        }
    }

    /**
     * Validate CIDR value
     */
    function validateCIDR() {
        const cidr = parseInt(elements.cidrInput.value);
        if (isNaN(cidr)) return false;

        const max = state.protocol === 'ipv4' ? CONFIG.maxCIDR : CONFIG.maxCIDRv6;
        const min = state.protocol === 'ipv4' ? CONFIG.minCIDR : CONFIG.minCIDRv6;

        return cidr >= min && cidr <= max;
    }

    /**
     * Main calculation function
     */
    function calculateSubnet() {
        try {
            if (!validateIPAddress() || !validateCIDR()) {
                displayError();
                return;
            }

            if (state.protocol === 'ipv4') {
                calculateIPv4();
            } else {
                calculateIPv6();
            }

        } catch (error) {
            console.error('Calculation error:', error);
            displayError();
        }
    }

    /**
     * IPv4 Calculation Logic
     */
    function calculateIPv4() {
        const ip = elements.ipInput.value.trim();
        const cidr = parseInt(elements.cidrInput.value);
        const ipArray = ip.split('.').map(octet => parseInt(octet));

        const subnetMaskArr = cidrToSubnetMask(cidr);
        const wildcardMaskArr = calculateWildcardMask(subnetMaskArr);
        const networkAddrArr = calculateNetworkAddress(ipArray, subnetMaskArr);
        const broadcastAddrArr = calculateBroadcastAddress(networkAddrArr, wildcardMaskArr);

        const totalHosts = Math.pow(2, 32 - cidr);
        const usableHosts = cidr === 32 ? 1 : (cidr === 31 ? 2 : totalHosts - 2);
        const firstHostArr = incrementIP(networkAddrArr);
        const lastHostArr = decrementIP(broadcastAddrArr);

        // Advanced metrics
        const ipInt = ipToInt(ipArray);
        const hexId = '0x' + ipInt.toString(16).toUpperCase().padStart(8, '0');
        const binaryId = ipArray.map(octet => octet.toString(2).padStart(8, '0')).join(' ');
        const binaryMask = subnetMaskArr.map(octet => octet.toString(2).padStart(8, '0')).join('.');
        const inAddrArpa = ipArray.slice().reverse().join('.') + '.in-addr.arpa';

        // IPv6 Mappings
        const ipv4Mapped = '::ffff:' + ipArray.map(octet => octet.toString(16).padStart(2, '0')).join('');
        const sixToFour = '2002:' + ipArray.map(octet => octet.toString(16).padStart(2, '0')).slice(0, 2).join('') + ':' + ipArray.map(octet => octet.toString(16).padStart(2, '0')).slice(2, 4).join('') + '::/48';

        updateDisplay({
            resIpAddress: ip,
            networkAddress: formatIP(networkAddrArr),
            broadcastAddress: formatIP(broadcastAddrArr),
            subnetMask: formatIP(subnetMaskArr),
            wildcardMask: formatIP(wildcardMaskArr),
            binarySubnetMask: binaryMask,
            totalHosts: totalHosts.toLocaleString(),
            usableHosts: usableHosts.toLocaleString(),
            hostRange: `${formatIP(firstHostArr)} to ${formatIP(lastHostArr)}`,
            ipClass: determineIPClass(ipArray[0]),
            cidrNotation: '/' + cidr,
            ipType: isPrivateIP(ipArray) ? 'Private' : 'Public',
            shortId: ip,
            binaryId: binaryId,
            integerId: ipInt.toString(),
            hexId: hexId,
            inAddrArpa: inAddrArpa,
            ipv4Mapped: ipv4Mapped,
            sixToFour: sixToFour
        });
    }

    /**
     * IPv6 Calculation Logic
     */
    function calculateIPv6() {
        const ip = elements.ipInput.value.trim();
        const cidr = parseInt(elements.cidrInput.value);

        const fullIP = expandIPv6(ip);
        const ipBigInt = ipv6ToBigInt(fullIP);

        // Network Calculation
        const totalBits = 128n;
        const prefix = BigInt(cidr);
        const mask = ((1n << totalBits) - 1n) ^ ((1n << (totalBits - prefix)) - 1n);

        const networkBigInt = ipBigInt & mask;
        const broadcastBigInt = networkBigInt | ((1n << (totalBits - prefix)) - 1n);

        const networkIP = bigIntToIPv6(networkBigInt);
        const broadcastIP = bigIntToIPv6(broadcastBigInt);

        const totalSpace = cidr === 128 ? "1" : "2^" + (128n - prefix).toString();

        // Advanced v6 metrics
        const ipNibbles = fullIP.replace(/:/g, '').split('').reverse().join('.');
        const ip6arpa = ipNibbles + '.ip6.arpa';

        const snmSuffix = fullIP.split(':').slice(-2).join(':').slice(-6).replace(':', '');
        const solicitedNode = 'ff02::1:ff' + snmSuffix;

        const binaryId = ipBigInt.toString(2).padStart(128, '0').match(/.{16}/g).join(' ');

        updateDisplay({
            resIpAddress: compressIPv6(fullIP),
            networkAddress: compressIPv6(networkIP) + "/" + cidr,
            broadcastAddress: compressIPv6(broadcastIP),
            subnetMask: "/" + cidr,
            wildcardMask: "N/A",
            binarySubnetMask: "Suffix: " + (128 - cidr) + " bits",
            totalHosts: totalSpace,
            usableHosts: totalSpace,
            hostRange: `${compressIPv6(networkIP)} to ${compressIPv6(broadcastIP)}`,
            ipClass: "Global Unicast",
            cidrNotation: '/' + cidr,
            ipType: getIPv6Type(fullIP),
            shortId: compressIPv6(fullIP),
            binaryId: binaryId,
            integerId: ipBigInt.toString(),
            hexId: '0x' + ipBigInt.toString(16).toUpperCase(),
            inAddrArpa: ip6arpa,
            ipv4Mapped: fullIP,
            sixToFour: compressIPv6(solicitedNode)
        });
    }

    /**
     * Helper functions
     */
    function cidrToSubnetMask(cidr) {
        const mask = [];
        let tempCidr = cidr;
        for (let i = 0; i < 4; i++) {
            const n = Math.min(tempCidr, 8);
            mask.push(256 - Math.pow(2, 8 - n));
            tempCidr -= n;
        }
        return mask;
    }

    function calculateWildcardMask(subnetMask) {
        return subnetMask.map(octet => 255 - octet);
    }

    function calculateNetworkAddress(ip, subnetMask) {
        return ip.map((octet, i) => octet & subnetMask[i]);
    }

    function calculateBroadcastAddress(networkAddr, wildcardMask) {
        return networkAddr.map((octet, i) => octet | wildcardMask[i]);
    }

    function incrementIP(ip) {
        const result = [...ip];
        for (let i = 3; i >= 0; i--) {
            if (result[i] < 255) { result[i]++; break; }
            else { result[i] = 0; }
        }
        return result;
    }

    function decrementIP(ip) {
        const result = [...ip];
        for (let i = 3; i >= 0; i--) {
            if (result[i] > 0) { result[i]--; break; }
            else { result[i] = 255; }
        }
        return result;
    }

    function formatIP(ipArray) { return ipArray.join('.'); }

    function ipToInt(ipArray) {
        return ((ipArray[0] << 24) >>> 0) + (ipArray[1] << 16) + (ipArray[2] << 8) + ipArray[3];
    }

    function isPrivateIP(ipArray) {
        // Class A: 10.0.0.0 - 10.255.255.255
        if (ipArray[0] === 10) return true;
        // Class B: 172.16.0.0 - 172.31.255.255
        if (ipArray[0] === 172 && ipArray[1] >= 16 && ipArray[1] <= 31) return true;
        // Class C: 192.168.0.0 - 192.168.255.255
        if (ipArray[0] === 192 && ipArray[1] === 168) return true;
        return false;
    }

    function determineIPClass(firstOctet) {
        if (firstOctet >= 1 && firstOctet <= 126) return 'Class A';
        if (firstOctet >= 128 && firstOctet <= 191) return 'Class B';
        if (firstOctet >= 192 && firstOctet <= 223) return 'Class C';
        if (firstOctet >= 224 && firstOctet <= 239) return 'Class D (Multicast)';
        if (firstOctet >= 240 && firstOctet <= 255) return 'Class E (Experimental)';
        return 'Other';
    }

    function updateDisplay(data) {
        elements.resIpAddress.textContent = data.resIpAddress;
        elements.networkAddress.textContent = data.networkAddress;
        elements.broadcastAddress.textContent = data.broadcastAddress;
        elements.subnetMask.textContent = data.subnetMask;
        elements.wildcardMask.textContent = data.wildcardMask;
        elements.binarySubnetMask.textContent = data.binarySubnetMask;
        elements.totalHosts.textContent = data.totalHosts;
        elements.usableHosts.textContent = data.usableHosts;
        elements.hostRange.textContent = data.hostRange;
        elements.ipClass.textContent = data.ipClass;
        elements.cidrNotation.textContent = data.cidrNotation;
        elements.ipType.textContent = data.ipType;
        elements.shortId.textContent = data.shortId;
        elements.binaryId.textContent = data.binaryId;
        elements.integerId.textContent = data.integerId;
        elements.hexId.textContent = data.hexId;
        elements.inAddrArpa.textContent = data.inAddrArpa;
        elements.ipv4Mapped.textContent = data.ipv4Mapped;
        elements.sixToFour.textContent = data.sixToFour;
    }

    function displayError() {
        const errorValue = '---';
        const fields = [
            'resIpAddress', 'networkAddress', 'broadcastAddress', 'subnetMask',
            'wildcardMask', 'binarySubnetMask', 'totalHosts', 'usableHosts',
            'hostRange', 'ipClass', 'cidrNotation', 'ipType', 'shortId',
            'binaryId', 'integerId', 'hexId', 'inAddrArpa', 'ipv4Mapped', 'sixToFour'
        ];
        fields.forEach(field => {
            if (elements[field]) elements[field].textContent = errorValue;
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function updateClassActiveState(cidr) {
        if (!elements.classOptions) return;
        const cidrInt = parseInt(cidr);
        elements.classOptions.forEach(opt => {
            const netClass = opt.getAttribute('data-class');
            let isActive = false;
            if (netClass === 'A' && cidrInt === 8) isActive = true;
            if (netClass === 'B' && cidrInt === 16) isActive = true;
            if (netClass === 'C' && cidrInt === 24) isActive = true;
            opt.classList.toggle('active', isActive);
        });
    }

    function getIPv6Type(expandedIP) {
        if (expandedIP === '0000:0000:0000:0000:0000:0000:0000:0001') return 'Loopback';
        if (expandedIP === '0000:0000:0000:0000:0000:0000:0000:0000') return 'Unspecified';
        if (expandedIP.startsWith('fe80')) return 'Link-Local';
        if (expandedIP.startsWith('ff')) return 'Multicast';
        if (expandedIP.startsWith('fc') || expandedIP.startsWith('fd')) return 'Unique Local';
        return 'Global Unicast';
    }

    function expandIPv6(ip) {
        let fullIP = ip;
        if (ip.includes('::')) {
            const parts = ip.split('::');
            const leftParts = parts[0] ? parts[0].split(':') : [];
            const rightParts = parts[1] ? parts[1].split(':') : [];
            const missing = 8 - (leftParts.length + rightParts.length);
            const middle = new Array(missing).fill('0000');
            fullIP = [...leftParts, ...middle, ...rightParts].join(':');
        }
        return fullIP.split(':').map(p => p.padStart(4, '0')).join(':');
    }

    function compressIPv6(ip) {
        // Basic compression: remove leading zeros and find longest run of zeros
        const parts = ip.split(':').map(p => parseInt(p, 16).toString(16));
        let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === '0') {
                if (curStart === -1) { curStart = i; curLen = 1; }
                else { curLen++; }
                if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
            } else {
                curStart = -1; curLen = 0;
            }
        }
        if (bestLen > 1) {
            parts.splice(bestStart, bestLen, '');
            if (bestStart === 0 || bestStart + 1 === parts.length) {
                if (bestStart === 0) parts.unshift('');
                if (bestStart + 1 === parts.length) parts.push('');
            }
        }
        return parts.join(':').replace(/:::/g, '::');
    }

    function ipv6ToBigInt(expandedIP) {
        return BigInt('0x' + expandedIP.replace(/:/g, ''));
    }

    function bigIntToIPv6(bi) {
        const hex = bi.toString(16).padStart(32, '0');
        return hex.match(/.{4}/g).join(':');
    }

    /**
     * Detect user's public IP address
     */
    /**
     * Detect user's public IP address with fallback services (Fetch + JSONP)
     */



    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
