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
    if (value < range[0]) return 'ดีกว่ามาตรฐาน';
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
    return 'ดีกว่ามาตรฐาน';
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
    return 'ดีกว่ามาตรฐาน';
}

function evaluateStandingLongJump(age, gender, value) {
    if (age >= 7 && age <= 14) {
        let avg;
        if (age <= 9) avg = gender === 'male' ? 125 : 120;
        else if (age <= 11) avg = gender === 'male' ? 140 : 132;
        else if (age <= 13) avg = gender === 'male' ? 158 : 150;
        else avg = gender === 'male' ? 185 : 160;
        
        if (value < avg) return 'ต่ำกว่าค่าเฉลี่ย';
        if (value >= avg) return 'ผ่านเกณฑ์/สูงกว่าค่าเฉลี่ย';
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
