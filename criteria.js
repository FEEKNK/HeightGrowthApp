// criteria.js

const targetHRTable = {
    4:  { min: 130, max: 157 },
    5:  { min: 130, max: 156 },
    6:  { min: 129, max: 156 },
    7:  { min: 129, max: 155 },
    8:  { min: 128, max: 155 },
    9:  { min: 128, max: 154 },
    10: { min: 128, max: 154 },
    11: { min: 127, max: 153 },
    12: { min: 127, max: 152 },
    13: { min: 126, max: 152 },
    14: { min: 126, max: 151 }
};

function evaluateResult(testId, age, gender, valueStr) {
    const value = parseFloat(valueStr);
    if (isNaN(value)) return '-';
    
    if (age < 4 || age > 14) return 'อายุอยู่นอกเกณฑ์ประเมิน';
    
    switch (testId) {
        case 'bmi':
            return evaluateBMI(age, gender, value);
        case 'weight-for-height':
            // value is actually weight, we need height from somewhere.
            // But since evaluateResult only takes value, we have a problem.
            // I will pass weight as value, and pass height in the valueStr if it's a string like "weight|height"
            return '-'; // we will handle this in a separate case
        case 'step-test':
            return evaluateStepTest(value);
        case 'single-leg-hop':
            return evaluateSingleLegHop(age, value);
        case 'shuttle-run':
            return evaluateShuttleRun(age, gender, value);
        case 'handgrip':
            return evaluateHandgrip(age, gender, value);
        case 'sit-reach':
            return evaluateSitReach(age, gender, value);
        case 'single-leg-stance-open':
            return evaluateSingleLegStance(age, gender, value, 'open');
        case 'single-leg-stance-closed':
            return evaluateSingleLegStance(age, gender, value, 'closed');
        case 'standing-long-jump':
            return evaluateStandingLongJump(age, gender, value);
        default:
            return '-';
    }
}

// น้ำหนักตามเกณฑ์ส่วนสูง (Weight-for-Height)
// อ้างอิง: การจัดทำเกณฑ์อ้างอิงการเจริญเติบโตของเด็กอายุ 2-7 ปี กรมอนามัย พ.ศ. 2542
// s = [-2SD, -1.5SD, +1.5SD, +2SD, +3SD]
// Zones: ผอม(<-2SD), ค่อนข้างผอม(-2SD~-1.5SD), สมส่วน(-1.5SD~+1.5SD), ท้วม(+1.5SD~+2SD), เริ่มอ้วน(+2SD~+3SD), อ้วน(>+3SD)
const weightHeightCriteriaData = {
    male: [
        {h: 85,  s: [10.0, 10.5, 13.5, 14.5, 16.5]},
        {h: 90,  s: [11.0, 11.6, 15.0, 16.2, 18.5]},
        {h: 95,  s: [12.1, 12.8, 16.6, 18.0, 20.7]},
        {h: 100, s: [13.3, 14.1, 18.3, 20.0, 23.1]},
        {h: 105, s: [14.6, 15.5, 20.1, 22.1, 25.7]},
        {h: 110, s: [16.0, 17.0, 22.0, 24.4, 28.5]},
        {h: 115, s: [17.5, 18.6, 24.1, 26.9, 31.6]},
        {h: 120, s: [19.1, 20.4, 26.4, 29.6, 35.1]},
        {h: 125, s: [20.8, 22.3, 28.9, 32.6, 39.0]},
        {h: 130, s: [22.7, 24.4, 31.7, 35.9, 43.4]},
        {h: 135, s: [24.8, 26.7, 34.8, 39.6, 48.3]},
        {h: 140, s: [27.1, 29.2, 38.3, 43.8, 53.8]}
    ],
    female: [
        {h: 85,  s: [10.0, 10.5, 13.5, 14.5, 16.5]},
        {h: 90,  s: [11.0, 11.7, 15.0, 16.2, 18.6]},
        {h: 95,  s: [12.0, 12.9, 16.6, 18.0, 20.8]},
        {h: 100, s: [13.1, 14.1, 18.3, 20.0, 23.2]},
        {h: 105, s: [14.3, 15.4, 20.2, 22.2, 25.8]},
        {h: 110, s: [15.6, 16.7, 22.3, 24.6, 28.7]},
        {h: 115, s: [17.0, 18.1, 24.6, 27.2, 31.9]},
        {h: 120, s: [18.5, 19.6, 27.1, 30.1, 35.5]},
        {h: 125, s: [20.0, 21.2, 29.8, 33.3, 39.5]},
        {h: 130, s: [21.5, 22.9, 32.8, 36.8, 43.9]},
        {h: 135, s: [23.0, 24.7, 36.1, 40.6, 48.8]},
        {h: 140, s: [24.5, 26.5, 39.7, 44.7, 54.2]}
    ]
};

function createNaturalCubicSpline(x, y) {
    const n = x.length;
    const a = y.slice();
    const h = [];
    for (let i = 0; i < n - 1; i++) h.push(x[i + 1] - x[i]);
    const alpha = [0];
    for (let i = 1; i < n - 1; i++) {
        alpha.push(3 / h[i] * (a[i + 1] - a[i]) - 3 / h[i - 1] * (a[i] - a[i - 1]));
    }
    const c = new Array(n).fill(0), l = new Array(n).fill(1), mu = new Array(n).fill(0), z = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
        l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
        mu[i] = h[i] / l[i];
        z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }
    const b = new Array(n).fill(0), d = new Array(n).fill(0);
    for (let j = n - 2; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1];
        b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
        d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }
    return function(xi) {
        if (xi <= x[0]) return y[0];
        if (xi >= x[n - 1]) return y[n - 1];
        let i = 0;
        while (i < n - 1 && xi >= x[i + 1]) i++;
        const dx = xi - x[i];
        return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
    };
}

// Generate 1cm resolution lookup table on startup
const detailedWeightHeightTable = { male: {}, female: {} };
['male', 'female'].forEach(gender => {
    const data = weightHeightCriteriaData[gender];
    const x = data.map(d => d.h);
    
    // Create splines for each SD curve
    const splines = [0, 1, 2, 3, 4].map(sdIdx => {
        const y = data.map(d => d.s[sdIdx]);
        return createNaturalCubicSpline(x, y);
    });
    
    for (let h = 85; h <= 140; h++) {
        detailedWeightHeightTable[gender][h] = [
            splines[0](h), splines[1](h), splines[2](h), splines[3](h), splines[4](h)
        ];
    }
});

function evaluateWeightForHeight(gender, height, weight) {
    if (height < 85 || height > 140) return 'ความสูงอยู่นอกตารางอ้างอิง (85-140 ซม.)';
    
    // Sub-centimeter precise calculation using the 1cm Lookup Table
    const hFloor = Math.floor(height);
    const hCeil = Math.ceil(height);
    const table = detailedWeightHeightTable[gender];
    
    let cuts;
    if (hFloor === hCeil) {
        cuts = table[hFloor];
    } else {
        // Interpolate between the two closest 1cm points
        const fraction = height - hFloor;
        const cutsFloor = table[hFloor];
        const cutsCeil = table[hCeil];
        cuts = cutsFloor.map((val, idx) => val + fraction * (cutsCeil[idx] - val));
    }
    
    // cuts[0]=-2SD, cuts[1]=-1.5SD, cuts[2]=+1.5SD, cuts[3]=+2SD, cuts[4]=+3SD
    // แปลผลตามกราฟการเจริญเติบโต กรมอนามัย พ.ศ. 2542 (คำนวณผ่าน Lookup Table แม่นยำ)
    if (weight < cuts[0]) return 'ผอม';              // < -2SD
    if (weight < cuts[1]) return 'ค่อนข้างผอม';      // -2SD ถึง -1.5SD
    if (weight <= cuts[2]) return 'สมส่วน';           // -1.5SD ถึง +1.5SD
    if (weight <= cuts[3]) return 'ท้วม';             // +1.5SD ถึง +2SD
    if (weight <= cuts[4]) return 'เริ่มอ้วน';         // +2SD ถึง +3SD
    return 'อ้วน';                                    // > +3SD
}


function evaluateStepTest(value) {
    // value here is treated as HR recovery
    if (value >= 30) return 'ดีมาก';
    if (value >= 20) return 'ดี';
    if (value >= 10) return 'ปานกลาง';
    return 'ต่ำ';
}

function evaluateSingleLegHop(age, value) {
    // Group 1 (age 4-6) → ผ่าน/ไม่ผ่าน
    if (age === 4) return value >= 2 ? 'ผ่าน' : 'ไม่ผ่าน';
    if (age === 5) return value >= 8 ? 'ผ่าน' : 'ไม่ผ่าน';
    if (age === 6) return value >= 10 ? 'ผ่าน' : 'ไม่ผ่าน';
    // Group 2 (age 7+) → descriptive
    if (age >= 7) return value >= 10 ? 'ผ่านเกณฑ์ (คล่อง)' : 'ควรพัฒนา';
    return '-';
}

function evaluateBMI(age, gender, bmi) {
    if (age < 7) return '-'; 
    
    const criteria = {
        male: {
            7: [10.23, 13.63, 16.93, 20.16],
            8: [10.47, 14.86, 17.95, 21.03],
            9: [10.86, 15.01, 18.58, 22.14],
            10: [10.97, 15.26, 19.22, 23.18],
            11: [11.57, 16.45, 20.45, 24.45],
            12: [11.89, 17.05, 21.26, 25.41],
            13: [12.02, 17.42, 21.60, 25.76],
            14: [12.53, 17.65, 21.95, 26.26]
        },
        female: {
            7: [10.96, 14.27, 17.36, 20.49],
            8: [10.99, 14.89, 18.20, 21.54],
            9: [11.03, 15.07, 18.75, 22.39],
            10: [11.25, 15.89, 19.75, 23.63],
            11: [11.90, 16.41, 20.50, 24.61],
            12: [11.94, 17.27, 21.58, 25.87],
            13: [12.74, 17.36, 21.64, 25.85],
            14: [13.19, 18.05, 22.93, 26.91]
        }
    };
    
    const cuts = criteria[gender][age];
    if (!cuts) return '-';
    
    if (bmi <= cuts[0]) return 'ผอมมาก';
    if (bmi <= cuts[1]) return 'ผอม';
    if (bmi <= cuts[2]) return 'สมส่วน';
    if (bmi <= cuts[3]) return 'ท้วม';
    return 'อ้วน';
}

function evaluateSitReach(age, gender, value) {
    if (age < 7) return '-';
    
    const criteria = {
        male: {
            7: [0, 3, 6, 10], 8: [1, 4, 7, 10], 9: [1, 5, 8, 11],
            10: [3, 7, 12, 16], 11: [4, 9, 14, 18], 12: [4, 9, 14, 19],
            13: [5, 10, 15, 20], 14: [5, 11, 16, 22]
        },
        female: {
            7: [0, 4, 8, 12], 8: [1, 4, 8, 12], 9: [1, 5, 9, 14],
            10: [4, 9, 14, 18], 11: [4, 10, 15, 20], 12: [5, 10, 15, 20],
            13: [5, 11, 16, 22], 14: [7, 13, 18, 23]
        }
    };
    
    const cuts = criteria[gender][age];
    if (!cuts) return '-';
    
    if (value <= cuts[0]) return 'ต่ำมาก';
    if (value <= cuts[1]) return 'ต่ำ';
    if (value <= cuts[2]) return 'ปานกลาง';
    if (value <= cuts[3]) return 'ดี';
    return 'ดีมาก';
}

function getAgeGroupKey(age) {
    if (age <= 5) return '4-5'; 
    if (age <= 7) return '6-7';
    if (age <= 9) return '8-9';
    if (age <= 11) return '10-11';
    if (age <= 13) return '12-13';
    return '14-15';
}

function evaluateShuttleRun(age, gender, value) {
    // Lower is better
    const key = getAgeGroupKey(age);
    const criteria = {
        male: {
            '4-5': [26.0, 33.0], '6-7': [21.5, 26.0], '8-9': [19.0, 22.0],
            '10-11': [17.5, 19.5], '12-13': [16.0, 18.0], '14-15': [14.5, 16.5]
        },
        female: {
            '4-5': [27.0, 34.5], '6-7': [22.5, 27.5], '8-9': [20.0, 23.5],
            '10-11': [18.5, 20.5], '12-13': [17.5, 19.5], '14-15': [16.5, 18.5]
        }
    };
    
    const range = criteria[gender][key];
    if (value < range[0]) return 'สูงกว่ามาตรฐาน';
    if (value <= range[1]) return 'อยู่ในเกณฑ์มาตรฐาน';
    return 'ต่ำกว่ามาตรฐาน';
}

function evaluateHandgrip(age, gender, value) {
    const key = getAgeGroupKey(age);
    const criteria = {
        male: {
            '4-5': [4.5, 8.0], '6-7': [7.5, 13.0], '8-9': [11.0, 17.5],
            '10-11': [15.5, 22.5], '12-13': [19.5, 31.0], '14-15': [28.5, 44.0]
        },
        female: {
            '4-5': [4.0, 7.5], '6-7': [7.0, 11.5], '8-9': [10.0, 16.5],
            '10-11': [14.5, 21.5], '12-13': [17.5, 24.5], '14-15': [20.0, 27.5]
        }
    };
    
    const range = criteria[gender][key];
    if (value < range[0]) return 'ต่ำกว่ามาตรฐาน';
    if (value <= range[1]) return 'อยู่ในเกณฑ์มาตรฐาน';
    return 'สูงกว่ามาตรฐาน';
}

function evaluateSingleLegStance(age, gender, value, condition) {
    let range;
    if (condition === 'open') {
        if (age === 4) range = gender === 'male' ? [4.0, 6.0] : [4.0, 7.0];
        else if (age === 5) range = gender === 'male' ? [8.0, 10.0] : [9.0, 12.0];
        else if (age === 6) range = gender === 'male' ? [12.0, 15.0] : [14.0, 18.0];
        else if (age === 7) range = gender === 'male' ? [18.0, 25.0] : [20.0, 28.0];
        else if (age === 8) range = gender === 'male' ? [25.0, 30.0] : [28.0, 33.0];
        else if (age === 9) range = gender === 'male' ? [32.0, 40.0] : [35.0, 45.0];
        else if (age <= 11) range = gender === 'male' ? [50.0, 60.0] : [60.0, 60.0];
        else range = [60.0, 60.0];
    } else {
        if (age === 4) range = gender === 'male' ? [1.0, 2.0] : [1.0, 2.0];
        else if (age === 5) range = gender === 'male' ? [1.0, 3.0] : [2.0, 3.0];
        else if (age === 6) range = gender === 'male' ? [2.0, 4.0] : [3.0, 5.0];
        else if (age === 7) range = gender === 'male' ? [4.0, 7.0] : [5.0, 8.0];
        else if (age === 8) range = gender === 'male' ? [6.0, 10.0] : [7.0, 11.0];
        else if (age === 9) range = gender === 'male' ? [9.0, 13.0] : [10.0, 14.0];
        else if (age <= 11) range = gender === 'male' ? [10.0, 15.0] : [12.0, 18.0];
        else if (age <= 13) range = gender === 'male' ? [14.0, 20.0] : [15.0, 22.0];
        else range = [20.0, 25.0];
    }
    
    // Group 1 (age 4-6) → ผ่าน/ไม่ผ่าน; Group 2 (age 7+) → descriptive
    if (age <= 6) {
        return value >= range[0] ? 'ผ่าน' : 'ไม่ผ่าน';
    }
    if (value < range[0]) return 'ต่ำกว่ามาตรฐาน';
    if (value <= range[1]) return 'อยู่ในเกณฑ์มาตรฐาน';
    return 'สูงกว่ามาตรฐาน';
}

function evaluateStandingLongJump(age, gender, value) {
    if (age >= 7 && age <= 14) {
        let avg;
        if (age <= 9) avg = gender === 'male' ? 125 : 120;
        else if (age <= 11) avg = gender === 'male' ? 140 : 132;
        else if (age <= 13) avg = gender === 'male' ? 158 : 150;
        else avg = gender === 'male' ? 185 : 160;
        
        if (value < avg) return 'ต่ำกว่าค่าเฉลี่ย';
        if (value === avg) return 'อยู่ในเกณฑ์ค่าเฉลี่ย';
        return 'สูงกว่าค่าเฉลี่ย';
    } else if (age >= 4 && age <= 6) {
        // Group 1 → ผ่าน/ไม่ผ่าน
        let min;
        if (age === 4) min = 60;
        else if (age === 5) min = 75;
        else min = 90;
        return value >= min ? 'ผ่าน' : 'ไม่ผ่าน';
    }
    
    return '-';
}
