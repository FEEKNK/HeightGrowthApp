// Test Configurations
const testsGroup1 = [
    { id: 'g1-bal-4', age: 4, name: 'Balance on one foot 2 seconds', desc: 'ยืนทรงตัวบนขาเดียว (4 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-gal-4', age: 4, name: 'Gallops jumping', desc: 'ก้าวกระโดดถ่ายน้ำหนัก (4 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-bal-5', age: 5, name: 'Balance on one foot 3-5 seconds', desc: 'ยืนทรงตัวบนขาเดียว (5 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-hop-5', age: 5, name: 'Hops 8-10 times from same foot', desc: 'กระโดดขาเดียว (5 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-cat-5', age: 5, name: 'Catches ball using hand only', desc: 'รับลูกบอลด้วยมือ (5 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-rot-5', age: 5, name: 'Body rotate when throw/catch', desc: 'หมุนลำตัวโยน/รับบอล (5 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-jmp-6', age: 6, name: 'Jump over knee high cord feet together', desc: 'กระโดดข้ามระดับเข่าเท้าคู่ (6 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' },
    { id: 'g1-cat-6', age: 6, name: 'One handed catches ball from bounce', desc: 'รับบอลกระดอนมือเดียว (6 ปี)', type: 'passfail', unit: 'ผ่าน/ไม่ผ่าน' }
];

const testsGroup2 = [
    { id: 'bmi', name: 'BMI (ดัชนีมวลกาย)', type: 'calculated', unit: '' },
    { id: 'shuttle-run', name: '10x5 m Shuttle', desc: 'วิ่งกลับตัว 10x5 เมตร', type: 'time', unit: 'วินาที' },
    { id: 'step-test', name: '3 Min Step Test', desc: 'อัตราการเต้นหัวใจที่ลดลง (HR Recovery)', type: 'count', unit: 'bpm' },
    { id: 'standing-long-jump', name: 'Standing Long Jump', desc: 'กระโดดไกลอยู่กับที่', type: 'distance', unit: 'ซม.' },
    { id: 'handgrip', name: 'Handgrip', desc: 'วัดแรงบีบมือ', type: 'weight', unit: 'กก.' },
    { id: 'sit-reach', name: 'Sit & Reach', desc: 'นั่งงอตัวไปข้างหน้า', type: 'distance', unit: 'ซม.' },
    { id: 'single-leg-stance-open', name: 'Single Leg Stance (ลืมตา)', desc: 'ยืนทรงตัวขาเดียว ลืมตา', type: 'time', unit: 'วินาที' },
    { id: 'single-leg-stance-closed', name: 'Single Leg Stance (หลับตา)', desc: 'ยืนทรงตัวขาเดียว หลับตา', type: 'time', unit: 'วินาที' }
];

// App State
let currentUser = null;
let currentResults = [];

// DOM Elements
const screenOnboarding = document.getElementById('screen-onboarding');
const screenDashboard = document.getElementById('screen-dashboard');
const onboardingForm = document.getElementById('onboarding-form');
const btnBack = document.getElementById('btn-back');
const testListContainer = document.getElementById('test-list');

// Screen 3 Elements
const screenSummary = document.getElementById('screen-summary');
const summaryContainer = document.getElementById('summary-container');
const btnBackToDashboard = document.getElementById('btn-back-to-dashboard');
const btnDownloadPdf = document.getElementById('btn-download-pdf');

// Screen 4 Elements
const screenCriteria = document.getElementById('screen-criteria');
const btnViewCriteria = document.getElementById('btn-view-criteria');
const btnBackFromCriteria = document.getElementById('btn-back-from-criteria');

// Screen 5 Elements (Backend / LocalStorage History)
const screenHistory = document.getElementById('screen-history');
const btnViewHistory = document.getElementById('btn-view-history');
const btnBackFromHistory = document.getElementById('btn-back-from-history');
const historyTableBody = document.getElementById('history-table-body');
const historyStats = document.getElementById('history-stats');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnClearHistory = document.getElementById('btn-clear-history');

let summaryReturnScreen = null; // Track where summary screen should return to

let currentReportDiv = null; // Store for PDF generation

// Removed calculateAge function as age is now inputted directly

// Utility: Calculate BMI
function calculateBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    return (weight / (heightM * heightM)).toFixed(2);
}

// Event Listeners
onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const hn = document.getElementById('hn').value;
    const name = document.getElementById('child-name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const hr = document.getElementById('hr').value || '-';
    const bp = document.getElementById('bp').value || '-';
    
    const bmi = calculateBMI(weight, height);
    
    let group = 0;
    if (age >= 4 && age <= 6) {
        group = 1;
    } else if (age >= 7 && age <= 14) {
        group = 2;
    } else {
        alert('ระบบนี้ถูกออกแบบมาสำหรับเด็กอายุระหว่าง 4 - 14 ปี เท่านั้นครับ');
        return;
    }
    currentUser = { hn, name, gender, age, weight, height, bmi, group, hr, bp };
    
    setupDashboard();
    switchScreen(screenDashboard);
});



btnBack.addEventListener('click', () => {
    switchScreen(screenOnboarding);
});

function getBadgeClass(evaluation) {
    const text = (evaluation || '').toString();
    if (text === '-' || !text) return 'empty';

    if (text === 'ผ่าน') return 'excellent';
    if (text === 'ไม่ผ่าน') return 'low';

    if (text === 'สมส่วน') return 'excellent';
    if (text === 'ค่อนข้างผอม') return 'moderate';
    if (text === 'ผอม') return 'low';
    if (text === 'ท้วม') return 'moderate';
    if (text === 'เริ่มอ้วน') return 'moderate';
    if (text === 'อ้วน') return 'low';

    if (text.includes('ดีมาก') || text.includes('Excellent')) return 'excellent';
    if (text.includes('ต่ำมาก') || text.includes('Very Low')) return 'verylow';
    if (text.includes('ปานกลาง') || text.includes('Moderate')) return 'moderate';
    if (text.includes('ต่ำ') || text.includes('ควรพัฒนา') || text.includes('ควรปรับปรุง') || text.includes('ไม่ผ่านเกณฑ์')) return 'low';
    if (text.includes('ดี') || text.includes('Good') || text.includes('ผ่านเกณฑ์') || text.includes('อยู่ในเกณฑ์') || text.includes('อยู่ในเกณฑ์มาตรฐาน')) return 'good';

    return 'good';
}

function renderBDMSReport(user, results) {
    const reportDiv = document.createElement('div');
    reportDiv.className = 'bdms-pdf-container';
    reportDiv.id = 'bdms-report-document';

    const testDate = user.testDate || new Date().toLocaleDateString('th-TH');
    const printDate = new Date().toLocaleString('th-TH');
    const genderText = user.gender === 'male' ? 'ชาย / Male' : 'หญิง / Female';

    let tableRowsHtml = '';
    let hasNeedsImprovement = false;

    results.forEach(r => {
        const badgeClass = getBadgeClass(r.evaluation);
        if (badgeClass === 'low' || badgeClass === 'verylow') {
            hasNeedsImprovement = true;
        }
        const valStr = (r.value !== undefined && r.value !== null && r.value !== '') ? String(r.value) : '-';
        const cleanValue = valStr.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
        const unitStr = (r.unit && !cleanValue.includes(r.unit) && cleanValue !== '-') ? ` ${r.unit}` : '';
        
        tableRowsHtml += `
            <tr>
                <td style="font-weight: 500;">${r.name}</td>
                <td style="font-weight: 600;">${cleanValue}${unitStr}</td>
                <td style="text-align: center;">
                    <span class="bdms-level-badge ${badgeClass}">${r.evaluation}</span>
                </td>
            </tr>
        `;
    });

    const overallText = hasNeedsImprovement 
        ? 'สมรรถภาพโดยรวม: ควรปรับปรุง / Overall Fitness Level: Needs Improvement'
        : 'สมรรถภาพโดยรวม: อยู่ในเกณฑ์ดี / Overall Fitness Level: Good';
    const overallClass = hasNeedsImprovement ? 'needs-improvement' : 'good-status';

    const targetData = targetHRTable[user.age] || { min: '-', max: '-' };
    const targetMin = targetData.min;
    const targetMax = targetData.max;

    const html = `
        <div class="bdms-top-accent"></div>
        <div class="bdms-header-banner">
            <div class="bdms-brand-section">
                <div class="bdms-brand-logo" style="background: #ffffff; padding: 4px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; min-width: 44px; box-sizing: border-box;">
                    <img src="${window.sirirojBLogoBase64 || 'siriroj_b_logo.png'}" alt="Bangkok Hospital Siriroj Logo" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                </div>
                <div class="bdms-header-titles">
                    <div class="th-title">รายงานผลการทดสอบสมรรถภาพทางกาย</div>
                    <div class="en-title">Physical Fitness Test Report</div>
                    <div class="hospital-subtitle">โรงพยาบาลกรุงเทพสิริโรจน์ | Bangkok Hospital Siriroj</div>
                </div>
            </div>
            <div class="bdms-header-meta">
                <span class="bdms-pill-badge">BDMS WELLNESS</span>
                <div class="bdms-doc-meta">
                    <span><b>Ref:</b> BDMS-FT-${user.hn}</span>
                    <span><b>Date:</b> ${testDate}</span>
                </div>
            </div>
        </div>

        <div class="bdms-card-section">
            <div class="bdms-sec-title">
                <span style="font-size: 1.1rem;">👤</span> ข้อมูลส่วนบุคคล / Personal Information
            </div>
            <div class="bdms-info-box">
                <div class="bdms-info-grid">
                    <div class="bdms-info-row"><span class="bdms-info-label">HN:</span> <span class="bdms-info-val">${user.hn}</span></div>
                    <div class="bdms-info-row"><span class="bdms-info-label">อายุ / Age:</span> <span class="bdms-info-val">${user.age} ปี / years</span></div>
                    <div class="bdms-info-row"><span class="bdms-info-label">เพศ / Gender:</span> <span class="bdms-info-val">${genderText}</span></div>
                    <div class="bdms-info-row"><span class="bdms-info-label">วันที่ทดสอบ / Test Date:</span> <span class="bdms-info-val">${testDate}</span></div>
                    <div class="bdms-info-row"><span class="bdms-info-label">น้ำหนัก / Weight:</span> <span class="bdms-info-val">${user.weight} กก. / kg</span></div>
                    <div class="bdms-info-row"><span class="bdms-info-label">ส่วนสูง / Height:</span> <span class="bdms-info-val">${user.height} ซม. / cm</span></div>
                    <div class="bdms-info-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px dashed #cbd5e1;"><span class="bdms-info-label" style="color:#4f46e5;">🎯 Target HR:</span> <span class="bdms-info-val" style="color:#4f46e5; font-weight:600;">${targetMin} - ${targetMax} bpm</span></div>
                    <div class="bdms-info-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px dashed #cbd5e1;"><span class="bdms-info-label" style="color:#4f46e5;">❤️ HR:</span> <span class="bdms-info-val">${user.hr || '-'} bpm</span></div>
                    <div class="bdms-info-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px dashed #cbd5e1;"><span class="bdms-info-label" style="color:#4f46e5;">🩸 BP:</span> <span class="bdms-info-val">${user.bp || '-'} mmHg</span></div>
                </div>
            </div>
        </div>

        <div class="bdms-card-section">
            <div class="bdms-sec-title">
                <span style="font-size: 1.1rem;">📊</span> ผลการทดสอบ / Test Results
            </div>
            <table class="bdms-results-table">
                <thead>
                    <tr>
                        <th style="width: 45%;">รายการทดสอบ / Test Item</th>
                        <th style="width: 30%;">ผลลัพธ์ / Result</th>
                        <th style="width: 25%; text-align: center;">ระดับ / Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <span>Bangkok Dusit Medical Services (BDMS) - Quality Medical Report</span>
            <span>พิมพ์เมื่อ: ${printDate}</span>
        </div>
    `;

    reportDiv.innerHTML = html;
    return reportDiv;
}

document.getElementById('btn-submit-tests').addEventListener('click', () => {
    // Collect results
    const results = [];
    
    // Evaluate BMI manually for Group 2
    if (currentUser.group === 1) {
        // Group 1: Age-specific Pass/Fail tests
        const ageTests = testsGroup1.filter(t => t.age === currentUser.age);

        
        ageTests.forEach(t => {
            const radios = document.getElementsByName(`res-${t.id}`);
            let val = '';
            for (let r of radios) {
                if (r.checked) val = r.value;
            }
            
            results.push({
                name: t.name,
                value: val || '-',
                unit: '',
                evaluation: val || '-'
            });
        });

    } else {
        const bmiEval = evaluateResult('bmi', currentUser.age, currentUser.gender, currentUser.bmi);
        results.push({
            name: 'BMI (ดัชนีมวลกาย)',
            value: currentUser.bmi,
            unit: '',
            evaluation: bmiEval
        });
    }
    
    // 3 Min Step Test (Available in both groups if added to testsGroup1)
    const stepHrPeakInput = document.getElementById('step-hr-peak');
    if (stepHrPeakInput) {
        const hrPeak = stepHrPeakInput.value || '';
        const hrRecInput = document.getElementById('step-hr-recovery');
        const hrRec = hrRecInput ? hrRecInput.value : '';
        
        let stepEval = '-';
        let stepValueDisplay = '-';
        
        if (hrPeak !== '' && hrRec !== '') {
            const diff = parseInt(hrPeak) - parseInt(hrRec);
            stepEval = evaluateStepTest(diff);
            stepValueDisplay = `HR Peak: ${hrPeak} bpm<br>HR Rec: ${hrRec} bpm (ลดลง ${diff} bpm)`;
        } else if (hrPeak !== '' || hrRec !== '') {
            stepValueDisplay = `HR Peak: ${hrPeak || '-'} bpm<br>HR Rec: ${hrRec || '-'} bpm`;
        }
        
        results.push({
            name: '3 Min Step Test',
            value: stepValueDisplay,
            unit: '',
            evaluation: stepEval
        });
    }
    
    const inputs = document.querySelectorAll('.result-input');
    inputs.forEach(input => {
        const testId = input.dataset.id;
        const testValue = input.value;
        const testInfo = currentUser.group === 1 ? testsGroup1.find(t => t.id === testId) : testsGroup2.find(t => t.id === testId);
        const evalResult = evaluateResult(testId, currentUser.age, currentUser.gender, testValue);
        results.push({
            name: testInfo ? testInfo.name : testId,
            value: testValue,
            unit: testInfo ? testInfo.unit : '',
            evaluation: evalResult
        });
    });

    // Save assessment to browser cache (localStorage backend)
    saveAssessmentToLocalStorage(currentUser, results);

    // Create BDMS report template
    const reportDiv = renderBDMSReport(currentUser, results);
    
    // Save for PDF generation and show on screen
    currentReportDiv = reportDiv;
    currentResults = results;
    summaryContainer.innerHTML = '';
    summaryContainer.appendChild(reportDiv);
    
    summaryReturnScreen = screenDashboard;
    switchScreen(screenSummary);
});

btnBackToDashboard.addEventListener('click', () => {
    switchScreen(summaryReturnScreen || screenDashboard);
});

btnDownloadPdf.addEventListener('click', () => {
    if (currentResults.length === 0 || !currentUser) return;
    
    const originalText = btnDownloadPdf.innerText;
    btnDownloadPdf.innerText = 'กำลังสร้าง PDF...';
    btnDownloadPdf.disabled = true;

    setTimeout(() => {
        try {
            generateVectorPDF();
        } catch (err) {
            console.error('PDF Generation error:', err);
            alert('เกิดข้อผิดพลาดในการสร้าง PDF');
        } finally {
            btnDownloadPdf.innerText = originalText;
            btnDownloadPdf.disabled = false;
        }
    }, 50);
});

function generateVectorPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    if (window.kanitBase64) {
        doc.addFileToVFS('Kanit-Regular.ttf', window.kanitBase64);
        doc.addFont('Kanit-Regular.ttf', 'Kanit', 'normal');
        doc.setFont('Kanit');
    }

    const marginX = 12;
    const printableWidth = 186; // 210 - 24

    // 1. Top Header Banner
    doc.setFillColor(0, 58, 112); // BDMS Navy
    doc.roundedRect(marginX, 12, printableWidth, 26, 3, 3, 'F');
    doc.setFillColor(0, 163, 224); // BDMS Cyan Accent
    doc.rect(marginX, 12, printableWidth, 2.5, 'F');

    // Logo Container Box (White Background for official B emblem logo image)
    const logoX = marginX + 6;
    const logoY = 16.5;
    const logoW = 17;
    const logoH = 17;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX, logoY, logoW, logoH, 2.5, 2.5, 'F');

    const logoImg = window.sirirojBLogoBase64 || window.sirirojLogoBase64;
    if (logoImg) {
        doc.addImage(logoImg, 'PNG', logoX + 1.5, logoY + 1.5, logoW - 3, logoH - 3);
    }

    // Brand Titles
    const titleX = logoX + logoW + 6;
    doc.setFontSize(14.5);
    doc.setTextColor(255, 255, 255);
    doc.text('รายงานผลการทดสอบสมรรถภาพทางกาย', titleX, 22);

    doc.setFontSize(9.5);
    doc.setTextColor(125, 211, 252);
    doc.text('Physical Fitness Test Report', titleX, 28);

    doc.setFontSize(8.5);
    doc.setTextColor(186, 230, 253);
    doc.text('โรงพยาบาลกรุงเทพสิริโรจน์ | Bangkok Hospital Siriroj', titleX, 34);

    // BDMS Wellness Pill Badge (Right)
    doc.setFillColor(0, 163, 224);
    doc.roundedRect(marginX + 138, 16.5, 42, 6.5, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BDMS WELLNESS', marginX + 159, 21, { align: 'center' });

    // Ref & Date right text
    const testDate = currentUser.testDate || new Date().toLocaleDateString('th-TH');
    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`Ref: BDMS-FT-${currentUser.hn}`, marginX + 180, 27.5, { align: 'right' });
    doc.text(`Date: ${testDate}`, marginX + 180, 33, { align: 'right' });

    // 2. Personal Information Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, 43, printableWidth, 34, 3, 3, 'FD');

    doc.setFontSize(10.5);
    doc.setTextColor(0, 58, 112);
    doc.text('ข้อมูลส่วนบุคคล / Personal Information', marginX + 6, 50);

    // Row 1
    const infoY1 = 57.5;
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); doc.text('HN:', marginX + 6, infoY1);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.hn}`, marginX + 15, infoY1);

    doc.setTextColor(100, 116, 139); doc.text('เพศ / Gender:', marginX + 66, infoY1);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.gender === 'male' ? 'ชาย / Male' : 'หญิง / Female'}`, marginX + 90, infoY1);

    doc.setTextColor(100, 116, 139); doc.text('อายุ / Age:', marginX + 130, infoY1);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.age} ปี / years`, marginX + 147, infoY1);

    // Row 2
    const infoY2 = 64.5;
    doc.setTextColor(100, 116, 139); doc.text('น้ำหนัก / Weight:', marginX + 6, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.weight} กก. / kg`, marginX + 34, infoY2);

    doc.setTextColor(100, 116, 139); doc.text('ส่วนสูง / Height:', marginX + 66, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.height} ซม. / cm`, marginX + 94, infoY2);

    doc.setTextColor(100, 116, 139); doc.text('วันที่ทดสอบ / Test Date:', marginX + 130, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${testDate}`, marginX + 164, infoY2);

    // Row 3 (Target HR, HR, BP)
    const targetData = targetHRTable[currentUser.age] || { min: '-', max: '-' };
    const targetMin = targetData.min;
    const targetMax = targetData.max;
    const infoY3 = 71.5;
    doc.setTextColor(79, 70, 229); // #4f46e5 (Indigo)
    doc.text('Target HR:', marginX + 6, infoY3);
    doc.setFont('Kanit', 'bold');
    doc.text(`${targetMin} - ${targetMax} bpm`, marginX + 24, infoY3);
    doc.setFont('Kanit', 'normal');

    doc.setTextColor(100, 116, 139); doc.text('HR:', marginX + 66, infoY3);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.hr || '-'} bpm`, marginX + 74, infoY3);

    doc.setTextColor(100, 116, 139); doc.text('BP:', marginX + 130, infoY3);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.bp || '-'} mmHg`, marginX + 138, infoY3);

    // 3. Test Results Title & Table
    doc.setFontSize(10.5);
    doc.setTextColor(0, 58, 112);
    doc.text('ผลการทดสอบ / Test Results', marginX + 2, 85);

    const tableBody = currentResults.map(r => {
        const valStr = (r.value !== undefined && r.value !== null && r.value !== '') ? String(r.value) : '-';
        const cleanValue = valStr.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
        const displayUnit = r.unit && !cleanValue.includes(r.unit) && cleanValue !== '-' ? ` ${r.unit}` : '';
        return [r.name, `${cleanValue}${displayUnit}`.trim(), r.evaluation];
    });

    doc.autoTable({
        startY: 89,
        margin: { left: marginX, right: marginX },
        head: [['รายการทดสอบ / Test Item', 'ผลลัพธ์ / Result', 'ระดับ / Level']],
        body: tableBody,
        theme: 'grid',
        styles: {
            font: 'Kanit',
            fontSize: 9.5,
            textColor: [30, 41, 59],
            cellPadding: 3,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [0, 58, 112],
            textColor: [255, 255, 255],
            fontStyle: 'normal',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 51 },
            2: { cellWidth: 45, halign: 'center' }
        },
        didDrawCell: function(data) {
            if (data.section === 'body' && data.column.index === 2) {
                const cell = data.cell;
                const text = cell.raw || '';
                if (!text || text === '-') return;
                
                // Fill cell background to draw vector pill badge cleanly
                doc.setFillColor(255, 255, 255);
                if (data.row.index % 2 === 1) doc.setFillColor(248, 250, 252);
                doc.rect(cell.x + 0.2, cell.y + 0.2, cell.width - 0.4, cell.height - 0.4, 'F');

                let fillColor = [2, 132, 199]; // default blue
                // Group 1 pass/fail
                if (text === 'ผ่าน') fillColor = [46, 125, 50]; // green
                else if (text === 'ไม่ผ่าน') fillColor = [229, 57, 53]; // red
                // BMI categories
                else if (text === 'สมส่วน') fillColor = [46, 125, 50]; // green
                else if (text === 'ผอม' || text === 'ผอมมาก') fillColor = [229, 57, 53]; // red
                else if (text === 'ท้วม') fillColor = [245, 158, 11]; // amber
                else if (text === 'อ้วน') fillColor = [229, 57, 53]; // red
                // Group 2 descriptive
                else if (text.includes('ดีมาก')) fillColor = [46, 125, 50];
                else if (text.includes('ต่ำมาก')) fillColor = [229, 57, 53];
                else if (text.includes('ปานกลาง')) fillColor = [255, 179, 0];
                else if (text.includes('ต่ำ') || text.includes('ควรพัฒนา')) fillColor = [239, 68, 68];
                else if (text.includes('ดี') || text.includes('ผ่านเกณฑ์') || text.includes('อยู่ในเกณฑ์')) fillColor = [2, 132, 199];

                const badgeWidth = Math.min(38, cell.width - 6);
                const badgeHeight = 7;
                const badgeX = cell.x + (cell.width - badgeWidth) / 2;
                const badgeY = cell.y + (cell.height - badgeHeight) / 2;

                doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
                doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3.5, 3.5, 'F');

                doc.setFontSize(8.5);
                doc.setTextColor(255, 255, 255);
                doc.text(text, cell.x + cell.width / 2, badgeY + 4.8, { align: 'center' });
            }
        }
    });

    // 4. Exercise Programs QR Codes
    let finalY = doc.lastAutoTable.finalY || 180;
    let qrStartY = finalY + 10;
    
    // Only add a new page if it's REALLY overflowing
    if (qrStartY > 240) {
        doc.addPage();
        qrStartY = 20; 
    }
    
    // Draw Section Title
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(15, qrStartY, 180, 8, 2, 2, 'F');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('โปรแกรมออกกำลังกายที่แนะนำ (Recommended Exercise Program)', 20, qrStartY + 5.5);
    
    // Layout: 2 Groups (Left for 4-6, Right for 7-14)
    const qrSize = 24;
    const yPos = qrStartY + 16;
    const textY = yPos + qrSize + 4;
    
    // --- Group 1: 4-6 Years (Left) ---
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('สำหรับเด็กอายุ 4-6 ปี', 60, qrStartY + 14, { align: 'center' });
    
    // 4-6 TH
    doc.addImage(qr_4_6_th, 'PNG', 32, yPos, qrSize, qrSize);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ฉบับภาษาไทย', 32 + (qrSize/2), textY, { align: 'center' });
    
    // 4-6 EN
    doc.addImage(qr_4_6_en, 'PNG', 64, yPos, qrSize, qrSize);
    doc.text('English Version', 64 + (qrSize/2), textY, { align: 'center' });
    
    // --- Group 2: 7-14 Years (Right) ---
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('สำหรับเด็กอายุ 7-14 ปี', 150, qrStartY + 14, { align: 'center' });
    
    // 7-14 TH
    doc.addImage(qr_7_14_th, 'PNG', 122, yPos, qrSize, qrSize);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ฉบับภาษาไทย', 122 + (qrSize/2), textY, { align: 'center' });
    
    // 7-14 EN
    doc.addImage(qr_7_14_en, 'PNG', 154, yPos, qrSize, qrSize);
    doc.text('English Version', 154 + (qrSize/2), textY, { align: 'center' });
    
    // Footer Note
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('สแกน QR Code เพื่อดูหรือดาวน์โหลดโปรแกรมออกกำลังกาย', 105, textY + 6, { align: 'center' });

    // 5. Page Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Bangkok Dusit Medical Services (BDMS) - Quality Medical Report | พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, 105, 288, { align: 'center' });

    doc.save(`BDMS_Fitness_Report_${currentUser.hn}.pdf`);
}

btnViewCriteria.addEventListener('click', () => {
    switchScreen(screenCriteria);
});

btnBackFromCriteria.addEventListener('click', () => {
    switchScreen(screenOnboarding);
});

btnViewHistory?.addEventListener('click', () => {
    renderHistoryTable();
    switchScreen(screenHistory);
});

btnBackFromHistory?.addEventListener('click', () => {
    switchScreen(screenOnboarding);
});

// Functions
function switchScreen(targetScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
}

function setupDashboard() {
    const targetData = targetHRTable[currentUser.age] || { min: '-', max: '-' };
    const targetMin = targetData.min;
    const targetMax = targetData.max;

    // Update Header
    document.getElementById('display-name').textContent = `${currentUser.hn} - ${currentUser.name}`;
    document.getElementById('display-group').textContent = `อายุ ${currentUser.age} ปี (กลุ่ม ${currentUser.group}) | Target HR: ${targetMin}-${targetMax} bpm`;
    
    // Choose Test List
    const tests = currentUser.group === 1 ? testsGroup1.filter(t => t.age === currentUser.age) : testsGroup2;
    
    // Render Test Cards
    testListContainer.innerHTML = '';
    
    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        
        if (test.id === 'bmi') {
            const displayVal = currentUser.bmi;
            const evalResult = evaluateBMI(currentUser.age, currentUser.gender, currentUser.bmi);
            const gaugeLevels = [
                { label: 'ผอมมาก', color: '#e53935' },
                { label: 'ผอม', color: '#fb8c00' },
                { label: 'สมส่วน', color: '#43a047' },
                { label: 'ท้วม', color: '#fb8c00' },
                { label: 'อ้วน', color: '#e53935' }
            ];

            const activeIndex = gaugeLevels.findIndex(l => l.label === evalResult);
            const valColor = activeIndex >= 0 ? gaugeLevels[activeIndex].color : 'var(--primary)';
            
            let gaugeHtml = '';
            if (activeIndex >= 0) {
                gaugeHtml = `
                    <div class="gauge-container">
                        <div class="gauge-bar">
                            ${gaugeLevels.map((lvl, idx) => `
                                <div class="gauge-segment" style="background-color: ${lvl.color}; opacity: ${idx === activeIndex ? '1' : '0.2'};"></div>
                            `).join('')}
                        </div>
                        <div class="gauge-labels">
                             ${gaugeLevels.map((lvl, idx) => `
                                <div class="gauge-label" style="font-weight: ${idx === activeIndex ? '600' : 'normal'}; color: ${idx === activeIndex ? lvl.color : '#94a3b8'}">${lvl.label}</div>
                            `).join('')}
                        </div>
                        <div class="gauge-marker" style="left: ${((activeIndex + 0.5) / gaugeLevels.length) * 100}%; background-color: ${gaugeLevels[activeIndex].color};"></div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="test-header" style="border-bottom: none; padding-bottom: 5px;">
                    <div class="test-title">${test.name}</div>
                    <div style="font-weight: 600; color: ${valColor}; font-size: 1.2rem;">${displayVal} <span style="font-size: 0.9rem;">(${evalResult})</span></div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 10px;">น้ำหนัก ${currentUser.weight} กก. / ส่วนสูง ${currentUser.height} ซม.</div>
                ${gaugeHtml}
            `;
        } else if (test.id === 'single-leg-hop') {
            if (currentUser.age >= 6) {
                const criteriaText = currentUser.age === 6 ? 'ต่อเนื่องสม่ำเสมอ + มีระยะ' : 'คล่อง 10+ ครั้ง + ระยะดี';
                card.innerHTML = `
                    <div class="test-header">
                        <div class="test-title">${test.name}</div>
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">${test.desc}</div>
                    <div style="font-size: 0.85rem; color: var(--primary); margin-bottom: 10px; font-weight: 500;">เกณฑ์: ${criteriaText}</div>
                    <div class="test-input-group" style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="number" step="1" placeholder="จำนวนครั้ง..." id="hop-count" style="width: 120px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <span style="padding-left: 10px; font-size: 0.9rem;">${test.unit}</span>
                    </div>
                    <div style="display: flex; gap: 20px; margin-top: 5px;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.95rem;">
                            <input type="radio" name="hop-result" value="pass" style="width: 18px; height: 18px;"> ท่าทางผ่านเกณฑ์
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.95rem;">
                            <input type="radio" name="hop-result" value="fail" style="width: 18px; height: 18px;"> ควรพัฒนา (ไม่ผ่าน)
                        </label>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="test-header">
                        <div class="test-title">${test.name}</div>
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">${test.desc} (นับจำนวนครั้ง)</div>
                    <div class="test-input-group" style="display: flex; align-items: center;">
                        <input type="number" step="1" placeholder="กรอกจำนวนครั้ง..." id="hop-count" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex: 1;">
                        <span style="padding-left: 10px; font-size: 0.9rem;">${test.unit}</span>
                    </div>
                `;
            }
        } else if (test.id === 'step-test') {
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">${test.name}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 10px;">${test.desc}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.8rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">HR Peak (เสร็จทันที)</label>
                        <input type="number" id="step-hr-peak" placeholder="bpm" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">HR Recovery (พัก 1 นาที)</label>
                        <input type="number" id="step-hr-recovery" placeholder="bpm" style="width: 100%; padding: 8px 10px; border: 1.5px solid var(--primary); border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>
            `;
        } else if (test.type === 'passfail') {
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">${test.name}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">${test.desc}</div>
                <div style="display: flex; gap: 20px; margin-top: 10px;">
                    <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.95rem;">
                        <input type="radio" name="res-${test.id}" value="ผ่าน" style="width: 18px; height: 18px;"> ผ่าน
                    </label>
                    <label style="cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.95rem;">
                        <input type="radio" name="res-${test.id}" value="ไม่ผ่าน" style="width: 18px; height: 18px;"> ไม่ผ่าน
                    </label>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">${test.name}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 5px;">${test.desc}</div>
                <div class="test-input-group">
                    <input type="number" step="0.1" placeholder="กรอกผลลัพธ์..." class="result-input" data-id="${test.id}">
                    <span>${test.unit}</span>
                </div>
            `;
        }
        
        testListContainer.appendChild(card);
    });
}

// --- Backend Storage (LocalStorage Cache) Functions ---
const LOCAL_STORAGE_KEY = 'growthfit_backend_data';

function getBackendData() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading backend data:', e);
        return [];
    }
}

function saveAssessmentToLocalStorage(user, results) {
    const records = getBackendData();
    const record = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        dateStr: new Date().toLocaleString('th-TH'),
        user: JSON.parse(JSON.stringify(user)),
        results: JSON.parse(JSON.stringify(results))
    };
    records.unshift(record);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('Error saving backend data:', e);
    }
}

function renderHistoryTable() {
    const records = getBackendData();
    if (historyStats) {
        historyStats.textContent = `จำนวนข้อมูลคัดกรองทั้งหมด: ${records.length} รายการ`;
    }
    if (!historyTableBody) return;
    
    if (records.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 25px; color: #64748b;">ยังไม่มีประวัติการบันทึกข้อมูลคัดกรองในระบบแคชของเบราว์เซอร์</td></tr>`;
        return;
    }

    historyTableBody.innerHTML = records.map(rec => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-size: 0.9rem;">${rec.dateStr || '-'}</td>
            <td style="padding: 10px; font-weight: 600; color: var(--primary);">${rec.user?.hn || '-'}</td>
            <td style="padding: 10px;">${rec.user?.name || '-'}</td>
            <td style="padding: 10px; text-align: center;">${rec.user?.age} ปี / ${rec.user?.gender === 'male' ? 'ชาย' : 'หญิง'}</td>
            <td style="padding: 10px; text-align: center;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem;">กลุ่ม ${rec.user?.group || '-'}</span></td>
            <td style="padding: 10px; text-align: center;">
                <button onclick="viewHistoryRecord('${rec.id}')" class="btn-primary" style="background: #3b82f6; padding: 5px 10px; font-size: 0.8rem; margin: 2px; box-shadow: none; width: auto; display: inline-block;">👁️ ดูผล</button>
                <button onclick="deleteHistoryRecord('${rec.id}')" class="btn-primary" style="background: #ef4444; padding: 5px 10px; font-size: 0.8rem; margin: 2px; box-shadow: none; width: auto; display: inline-block;">🗑️ ลบ</button>
            </td>
        </tr>
    `).join('');
}

window.viewHistoryRecord = function(id) {
    const records = getBackendData();
    const record = records.find(r => r.id === id);
    if (!record) return;

    currentUser = record.user;
    currentResults = record.results;
    
    const reportDiv = renderBDMSReport(currentUser, currentResults);
    currentReportDiv = reportDiv;
    summaryContainer.innerHTML = '';
    summaryContainer.appendChild(reportDiv);
    
    summaryReturnScreen = screenHistory;
    switchScreen(screenSummary);
};

window.deleteHistoryRecord = function(id) {
    if (!confirm('ต้องการลบข้อมูลประวัติรายชื่อนี้ใช่หรือไม่?')) return;
    let records = getBackendData();
    records = records.filter(r => r.id !== id);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
        renderHistoryTable();
    } catch (e) {
        console.error('Error deleting record:', e);
    }
};

btnExportCsv?.addEventListener('click', () => {
    const records = getBackendData();
    if (records.length === 0) {
        alert('ไม่มีข้อมูลในระบบหลังบ้านสำหรับส่งออกครับ');
        return;
    }

    let csv = "\uFEFF" + "ลำดับ,วันเวลาที่บันทึก,HN,ชื่อ-นามสกุล,เพศ,อายุ (ปี),กลุ่ม,น้ำหนัก (กก.),ส่วนสูง (ซม.),BMI\n";
    records.forEach((r, idx) => {
        const u = r.user || {};
        const genderText = u.gender === 'male' ? 'ชาย' : 'หญิง';
        csv += `"${idx + 1}","${r.dateStr || ''}","${u.hn || ''}","${u.name || ''}","${genderText}","${u.age || ''}","กลุ่มที่ ${u.group || ''}","${u.weight || ''}","${u.height || ''}","${u.bmi || '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GrowthFit_Backend_Data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

btnClearHistory?.addEventListener('click', () => {
    const records = getBackendData();
    if (records.length === 0) return;
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลคัดกรองในแคชเบราว์เซอร์ทั้งหมด? (ไม่สามารถกู้คืนได้)')) return;
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        renderHistoryTable();
    } catch (e) {
        console.error('Error clearing storage:', e);
    }
});

