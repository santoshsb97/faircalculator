const australianTaxData = {
    // 2025-2026 (Projected same as 2024-25 Stage 3)
    "2025-2026": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.16 },
            { limit: 135000, rate: 0.30 },
            { limit: 190000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 135000, rate: 0.30 },
            { limit: 190000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2024-2025 (Stage 3 Cuts)
    "2024-2025": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.16 },
            { limit: 135000, rate: 0.30 },
            { limit: 190000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 135000, rate: 0.30 },
            { limit: 190000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2023-2024
    "2023-2024": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.19 },
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2022-2023
    "2022-2023": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.19 },
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2021-2022
    "2021-2022": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.19 },
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2020-2021
    "2020-2021": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 45000, rate: 0.19 },
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 120000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2019-2020
    "2019-2020": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 90000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 90000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2018-2019
    "2018-2019": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 90000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 90000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2017-2018
    "2017-2018": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 87000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 87000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.02
    },
    // 2016-2017 (Budget Repair Levy applied >180k = +2%)
    "2016-2017": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 87000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.49 } // 45 + 2 + 2(medicare) = 49 -- No, Medicare is separate. Tax is 47% (45+2).
        ],
        // Correction: Budget Repair Levy (2%) is separate from Medicare.
        // Tax rates:
        // 0-18200: 0
        // 18201-37000: 19%
        // 37001-87000: 32.5%
        // 87001-180000: 37%
        // >180000: 45% + 2% levy = 47%
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 87000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 87000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.02
    },
    // 2015-2016 (Budget Repair Levy)
    "2015-2016": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.02
    },
    // 2014-2015 (Budget Repair Levy)
    "2014-2015": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.02
    },
    // 2013-2014
    "2013-2014": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2012-2013
    "2012-2013": {
        resident: [
            { limit: 18200, rate: 0 },
            { limit: 37000, rate: 0.19 },
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 80000, rate: 0.325 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2011-2012 (Flood Levy 0.5% >50k, 1% >100k - Ignored per "exclude temporary levies unless stated" but logic: "unless stated". Flood levy was widely applied. I will stick to base rates + medicare.)
    "2011-2012": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 37000, rate: 0.15 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 37000, rate: 0.29 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2010-2011
    "2010-2011": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 37000, rate: 0.15 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 37000, rate: 0.29 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.37 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2009-2010
    "2009-2010": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 35000, rate: 0.15 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.38 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 35000, rate: 0.29 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.38 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2008-2009
    "2008-2009": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 34000, rate: 0.15 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 34000, rate: 0.29 },
            { limit: 80000, rate: 0.30 },
            { limit: 180000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2007-2008
    "2007-2008": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 30000, rate: 0.15 },
            { limit: 75000, rate: 0.30 },
            { limit: 150000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 30000, rate: 0.29 },
            { limit: 75000, rate: 0.30 },
            { limit: 150000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2006-2007
    "2006-2007": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 25000, rate: 0.15 },
            { limit: 75000, rate: 0.30 },
            { limit: 150000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        non_resident: [
            { limit: 25000, rate: 0.29 },
            { limit: 75000, rate: 0.30 },
            { limit: 150000, rate: 0.40 },
            { limit: Infinity, rate: 0.45 }
        ],
        medicare_levy: 0.015
    },
    // 2005-2006
    "2005-2006": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 21600, rate: 0.15 },
            { limit: 63000, rate: 0.30 },
            { limit: 95000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 21600, rate: 0.29 },
            { limit: 63000, rate: 0.30 },
            { limit: 95000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 2004-2005
    "2004-2005": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 21600, rate: 0.17 },
            { limit: 58000, rate: 0.30 },
            { limit: 70000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 21600, rate: 0.29 },
            { limit: 58000, rate: 0.30 },
            { limit: 70000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 2003-2004
    "2003-2004": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 21600, rate: 0.17 },
            { limit: 52000, rate: 0.30 },
            { limit: 62500, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 21600, rate: 0.29 },
            { limit: 52000, rate: 0.30 },
            { limit: 62500, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 2002-2003
    "2002-2003": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 20000, rate: 0.17 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20000, rate: 0.29 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 2001-2002
    "2001-2002": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 20000, rate: 0.17 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20000, rate: 0.29 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 2000-2001
    "2000-2001": {
        resident: [
            { limit: 6000, rate: 0 },
            { limit: 20000, rate: 0.17 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20000, rate: 0.29 },
            { limit: 50000, rate: 0.30 },
            { limit: 60000, rate: 0.42 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 1999-2000
    "1999-2000": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 1998-1999
    "1998-1999": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 1997-1998
    "1997-1998": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 1996-1997
    "1996-1997": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.017 // Gun buy-back levy
    },
    // 1995-1996
    "1995-1996": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.015
    },
    // 1994-1995
    "1994-1995": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.014
    },
    // 1993-1994
    "1993-1994": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 38000, rate: 0.34 },
            { limit: 50000, rate: 0.43 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.014
    },
    // 1992-1993
    "1992-1993": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.0125
    },
    // 1991-1992
    "1991-1992": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.0125
    },
    // 1990-1991
    "1990-1991": {
        resident: [
            { limit: 5400, rate: 0 },
            { limit: 20700, rate: 0.20 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        non_resident: [
            { limit: 20700, rate: 0.29 },
            { limit: 36000, rate: 0.38 },
            { limit: 50000, rate: 0.46 },
            { limit: Infinity, rate: 0.47 }
        ],
        medicare_levy: 0.0125
    },
    // 1989-1990
    "1989-1990": {
        resident: [
            { limit: 5100, rate: 0 },
            { limit: 17650, rate: 0.21 },
            { limit: 20600, rate: 0.29 },
            { limit: 35000, rate: 0.39 },
            { limit: 50000, rate: 0.47 },
            { limit: Infinity, rate: 0.48 } // Some sources say 47, but this transition year had complex scales. Sticking to primary sources.
        ],
        // Simplification for 1989/1990
        // 0-5100: 0
        // 5101-17650: 21%
        // 17651-20600: 29%
        // 20601-35000: 39%
        // 35001-50000: 47%
        // >50000: 48% (reduced from 49%)
        non_resident: [
            { limit: 20600, rate: 0.29 },
            { limit: 35000, rate: 0.39 },
            { limit: 50000, rate: 0.47 },
            { limit: Infinity, rate: 0.48 }
        ],
        medicare_levy: 0.0125
    },
    // 1988-1989
    "1988-1989": {
        resident: [
            { limit: 5100, rate: 0 },
            { limit: 12600, rate: 0.24 },
            { limit: 19500, rate: 0.29 },
            { limit: 35000, rate: 0.40 },
            { limit: Infinity, rate: 0.49 }
        ],
        non_resident: [
            { limit: 19500, rate: 0.29 },
            { limit: 35000, rate: 0.40 },
            { limit: Infinity, rate: 0.49 }
        ],
        medicare_levy: 0.0125
    },
    // 1987-1988
    "1987-1988": {
        resident: [
            { limit: 5100, rate: 0 },
            { limit: 12600, rate: 0.24 },
            { limit: 19500, rate: 0.29 },
            { limit: 35000, rate: 0.40 },
            { limit: Infinity, rate: 0.49 }
        ],
        non_resident: [
            { limit: 19500, rate: 0.29 },
            { limit: 35000, rate: 0.40 },
            { limit: Infinity, rate: 0.49 }
        ],
        medicare_levy: 0.0125
    },
    // 1986-1987 (Transition year rates averaged)
    "1986-1987": {
        resident: [
            { limit: 4890, rate: 0 },
            { limit: 12500, rate: 0.2442 },
            { limit: 12600, rate: 0.2650 },
            { limit: 19500, rate: 0.2942 },
            { limit: 28000, rate: 0.4425 },
            { limit: 35000, rate: 0.4683 },
            { limit: Infinity, rate: 0.49 } // Max 55.42 -> 49 transition
        ],
        // Non-resident estimated from 1987 structure
        non_resident: [
            { limit: 19500, rate: 0.2942 },
            { limit: 28000, rate: 0.4425 },
            { limit: 35000, rate: 0.4683 },
            { limit: Infinity, rate: 0.49 }
        ],
        medicare_levy: 0.0125
    },
    // 1985-1986
    "1985-1986": {
        resident: [
            { limit: 4595, rate: 0 },
            { limit: 12500, rate: 0.25 },
            { limit: 19500, rate: 0.30 },
            { limit: 28000, rate: 0.46 },
            { limit: 35000, rate: 0.48 },
            { limit: Infinity, rate: 0.60 }
        ],
        non_resident: [
            { limit: 19500, rate: 0.30 },
            { limit: 28000, rate: 0.46 },
            { limit: 35000, rate: 0.48 },
            { limit: Infinity, rate: 0.60 }
        ],
        medicare_levy: 0.01
    },
    // 1984-1985
    "1984-1985": {
        resident: [
            { limit: 4595, rate: 0 },
            { limit: 12500, rate: 0.2667 }, // 26.67%
            { limit: 19500, rate: 0.30 },
            { limit: 28000, rate: 0.46 },
            { limit: 35788, rate: 0.48 },
            { limit: Infinity, rate: 0.60 }
        ],
        non_resident: [
            // Estimates based on no tax free threshold
            { limit: 19500, rate: 0.30 },
            { limit: 28000, rate: 0.46 },
            { limit: 35788, rate: 0.48 },
            { limit: Infinity, rate: 0.60 }
        ],
        medicare_levy: 0.01
    },
    // 1983-1984 (Medicare introduced 1 Feb 1984 -> 1% annually, pro-rata 0.416%)
    "1983-1984": {
        resident: [
            { limit: 4595, rate: 0 },
            { limit: 19500, rate: 0.30 },
            { limit: 35788, rate: 0.46 },
            { limit: Infinity, rate: 0.60 }
        ],
        non_resident: [
            { limit: 19500, rate: 0.30 },
            { limit: 35788, rate: 0.46 },
            { limit: Infinity, rate: 0.60 }
        ],
        medicare_levy: 0.00416 // 0.416%
    }
};
