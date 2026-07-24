// Test Configurations
const testsGroup1 = [
    { id: 'weight-for-height', name: 'น้ำหนักตามเกณฑ์ส่วนสูง', type: 'calculated', unit: '' },
    { id: 'single-leg-stance-open', name: 'Single Leg Stance (ลืมตา)', desc: 'ยืนทรงตัวขาเดียว ลืมตา', type: 'time', unit: 'วินาที' },
    { id: 'single-leg-stance-closed', name: 'Single Leg Stance (หลับตา)', desc: 'ยืนทรงตัวขาเดียว หลับตา', type: 'time', unit: 'วินาที' },
    { id: 'single-leg-hop', name: 'Single Leg Hop', desc: 'กระโดดขาเดียว', type: 'count', unit: 'ครั้ง' },
    { id: 'standing-long-jump', name: 'Standing Long Jump', desc: 'กระโดดไกลอยู่กับที่', type: 'distance', unit: 'ซม.' }
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
    
    currentUser = { hn, name, gender, age, weight, height, bmi, group };
    
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
                    <div class="bdms-info-row" style="grid-column: span 2; margin-top: 4px; padding-top: 8px; border-top: 1px dashed #cbd5e1;"><span class="bdms-info-label" style="color:#4f46e5;">🎯 Target HR:</span> <span class="bdms-info-val" style="color:#4f46e5; font-weight:600;">${targetMin} - ${targetMax} bpm</span></div>
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
    
    // Evaluate BMI or Weight-for-Height manually
    if (currentUser.group === 1) {
        // Group 1 doesn't use BMI, uses weight-for-height
        const wfEval = evaluateWeightForHeight(currentUser.gender, currentUser.height, currentUser.weight);
        results.push({
            name: 'น้ำหนักตามเกณฑ์ส่วนสูง',
            value: currentUser.weight,
            unit: 'กก.',
            evaluation: wfEval
        });
        
        // Manual collection for single-leg-hop
        if (currentUser.age >= 6) {
            const hopRadios = document.getElementsByName('hop-result');
            const hopCountInput = document.getElementById('hop-count');
            const hopCountStr = (hopCountInput && hopCountInput.value !== '') ? `${hopCountInput.value} ครั้ง` : '';
            
            if (hopRadios.length > 0) {
                let hopVal = '-';
                let hopEval = '-';
                for (let r of hopRadios) {
                    if (r.checked) {
                        if (r.value === 'pass') {
                            hopVal = currentUser.age === 6 ? 'ต่อเนื่องและมีระยะ' : 'คล่อง 10+ ครั้งและมีระยะ';
                            hopEval = 'ผ่าน';
                        } else {
                            hopVal = 'ไม่ผ่านตามเกณฑ์ท่าทาง';
                            hopEval = 'ไม่ผ่าน';
                        }
                        break;
                    }
                }
                
                if (hopVal !== '-' || hopCountStr !== '') {
                    let finalVal = '';
                    if (hopCountStr && hopVal !== '-') finalVal = `${hopCountStr} (${hopVal})`;
                    else if (hopCountStr) finalVal = hopCountStr;
                    else finalVal = hopVal;
                    
                    results.push({
                        name: 'Single Leg Hop',
                        value: finalVal || '-',
                        unit: '',
                        evaluation: hopEval
                    });
                }
            }
        } else {
            const hopInput = document.getElementById('hop-count');
            if (hopInput && hopInput.value !== '') {
                const hopVal = hopInput.value;
                const hopEval = evaluateSingleLegHop(currentUser.age, parseInt(hopVal) || 0);
                results.push({
                    name: 'Single Leg Hop',
                    value: hopVal,
                    unit: 'ครั้ง',
                    evaluation: hopEval
                });
            } else if (hopInput) {
                 results.push({
                    name: 'Single Leg Hop',
                    value: '-',
                    unit: 'ครั้ง',
                    evaluation: '-'
                });
            }
        }
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

    // Create BDMS report template
    const reportDiv = renderBDMSReport(currentUser, results);
    
    // Save for PDF generation and show on screen
    currentReportDiv = reportDiv;
    currentResults = results;
    summaryContainer.innerHTML = '';
    summaryContainer.appendChild(reportDiv);
    
    switchScreen(screenSummary);
});

btnBackToDashboard.addEventListener('click', () => {
    switchScreen(screenDashboard);
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

    // Row 3 (Target HR)
    const targetData = targetHRTable[currentUser.age] || { min: '-', max: '-' };
    const targetMin = targetData.min;
    const targetMax = targetData.max;
    const infoY3 = 71.5;
    doc.setTextColor(79, 70, 229); // #4f46e5 (Indigo)
    doc.text('Target HR:', marginX + 6, infoY3);
    doc.setFont('Kanit', 'bold');
    doc.text(`${targetMin} - ${targetMax} bpm`, marginX + 24, infoY3);
    doc.setFont('Kanit', 'normal');

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
                // Pink book weight-for-height categories
                else if (text === 'สมส่วน') fillColor = [46, 125, 50]; // green
                else if (text === 'ค่อนข้างผอม') fillColor = [245, 158, 11]; // amber
                else if (text === 'ผอม') fillColor = [229, 57, 53]; // red
                else if (text === 'ท้วม') fillColor = [245, 158, 11]; // amber
                else if (text === 'เริ่มอ้วน') fillColor = [245, 158, 11]; // amber
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
    const tests = currentUser.group === 1 ? testsGroup1 : testsGroup2;
    
    // Render Test Cards
    testListContainer.innerHTML = '';
    
    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        
        if (test.id === 'bmi' || test.id === 'weight-for-height') {
            const isBmi = test.id === 'bmi';
            const displayVal = isBmi ? currentUser.bmi : `${currentUser.weight} กก.`;
            
            let evalResult = '-';
            let gaugeLevels = [];
            let activeIndex = -1;

            if (isBmi) {
                evalResult = evaluateBMI(currentUser.age, currentUser.gender, currentUser.bmi);
                gaugeLevels = [
                    { label: 'ผอมมาก', color: '#e53935' },
                    { label: 'ผอม', color: '#fb8c00' },
                    { label: 'สมส่วน', color: '#43a047' },
                    { label: 'ท้วม', color: '#fb8c00' },
                    { label: 'อ้วน', color: '#e53935' }
                ];
            } else {
                evalResult = evaluateWeightForHeight(currentUser.gender, currentUser.height, currentUser.weight);
                gaugeLevels = [
                    { label: 'ผอม', color: '#e53935' },
                    { label: 'ค่อนข้างผอม', color: '#fb8c00' },
                    { label: 'สมส่วน', color: '#43a047' },
                    { label: 'ท้วม', color: '#fb8c00' },
                    { label: 'เริ่มอ้วน', color: '#e53935' },
                    { label: 'อ้วน', color: '#d32f2f' }
                ];
            }

            activeIndex = gaugeLevels.findIndex(l => l.label === evalResult);
            
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
                ${!isBmi ? `<button onclick="openChartModal('${currentUser.gender}', ${currentUser.height}, ${currentUser.weight})" style="margin-top: 15px; padding: 8px 12px; background: transparent; border: 1px solid var(--secondary); color: var(--secondary); border-radius: 8px; cursor: pointer; width: 100%; font-family: 'Kanit'; transition: background 0.3s;">📊 ดูกราฟเทียบเกณฑ์มาตรฐาน</button>` : ''}
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

// --- Chart Modal Logic ---
let growthChartInstance = null;

window.openChartModal = function(gender, currentHeight, currentWeight) {
    const modal = document.getElementById('chart-modal');
    modal.classList.add('show');
    
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChartInstance) {
        growthChartInstance.destroy();
    }
    
    const data = weightHeightCriteriaData[gender];
    
    // Draw the chart using the exact mathematically smoothed 56 points (Natural Cubic Spline)
    const detailedData = detailedWeightHeightTable[gender];
    const heights = [];
    for (let h = 85; h <= 140; h++) heights.push(h);
    
    const sdNeg2 = heights.map(h => ({x: h, y: detailedData[h][0]}));
    const sdNeg1_5 = heights.map(h => ({x: h, y: detailedData[h][1]}));
    const sdPos1_5 = heights.map(h => ({x: h, y: detailedData[h][2]}));
    const sdPos2 = heights.map(h => ({x: h, y: detailedData[h][3]}));
    const sdPos3 = heights.map(h => ({x: h, y: detailedData[h][4]}));

    // Helper to interpolate Y at given X
    const getYAtX = (dataArr, targetX) => {
        const point = dataArr.find(p => p.x === targetX);
        if (point) return point.y;
        const lower = dataArr.slice().reverse().find(p => p.x <= targetX) || dataArr[0];
        const upper = dataArr.find(p => p.x >= targetX) || dataArr[dataArr.length - 1];
        if (lower.x === upper.x) return lower.y;
        return lower.y + (upper.y - lower.y) * ((targetX - lower.x) / (upper.x - lower.x));
    };

    const zoneLabelPlugin = {
        id: 'zoneLabels',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            ctx.save();
            ctx.font = 'bold 12px Kanit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Choose X position for labels (e.g. 135cm)
            const targetX = 132.5; 
            const xPixel = xAxis.getPixelForValue(targetX);
            
            const drawLabel = (text, arrTop, arrBottom, color, offsetY = 0) => {
                const x1 = targetX - 5;
                const x2 = targetX + 5;
                
                const yTop1 = arrTop ? getYAtX(arrTop, x1) : getYAtX(arrBottom, x1);
                const yBottom1 = arrBottom ? getYAtX(arrBottom, x1) : getYAtX(arrTop, x1);
                const py1 = yAxis.getPixelForValue((yTop1 + yBottom1) / 2);
                
                const yTop2 = arrTop ? getYAtX(arrTop, x2) : getYAtX(arrBottom, x2);
                const yBottom2 = arrBottom ? getYAtX(arrBottom, x2) : getYAtX(arrTop, x2);
                const py2 = yAxis.getPixelForValue((yTop2 + yBottom2) / 2);
                
                const px1 = xAxis.getPixelForValue(x1);
                const px2 = xAxis.getPixelForValue(x2);
                
                const angle = Math.atan2(py2 - py1, px2 - px1);
                
                const yTop = arrTop ? getYAtX(arrTop, targetX) : getYAtX(arrBottom, targetX);
                const yBottom = arrBottom ? getYAtX(arrBottom, targetX) : getYAtX(arrTop, targetX);
                const yPixel = yAxis.getPixelForValue((yTop + yBottom) / 2) + offsetY;
                
                ctx.save();
                ctx.translate(xPixel, yPixel);
                ctx.rotate(angle);
                
                ctx.fillStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
                
                ctx.restore();
            };
            
            drawLabel('อ้วน', null, sdPos3, '#4a148c', -12);
            drawLabel('เริ่มอ้วน', sdPos3, sdPos2, '#c62828');
            drawLabel('ท้วม', sdPos2, sdPos1_5, '#f57f17');
            drawLabel('สมส่วน', sdPos1_5, sdNeg1_5, '#2e7d32');
            drawLabel('ค่อนข้างผอม', sdNeg1_5, sdNeg2, '#2e7d32');
            drawLabel('ผอม', sdNeg2, null, '#d84315', 12);
            
            ctx.restore();
        }
    };

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'อ้วน (> +3 SD)',
                    data: sdPos3,
                    borderColor: '#000',
                    borderWidth: 1,
                    backgroundColor: 'rgba(180, 160, 200, 0.7)',
                    fill: '-1',
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'เริ่มอ้วน (+2 SD ถึง +3 SD)',
                    data: sdPos2,
                    borderColor: '#000',
                    borderWidth: 1,
                    backgroundColor: 'rgba(140, 200, 100, 0.7)',
                    fill: '-1',
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'ท้วม (+1.5 SD ถึง +2 SD)',
                    data: sdPos1_5,
                    borderColor: '#000',
                    borderWidth: 1,
                    backgroundColor: 'rgba(180, 220, 120, 0.7)',
                    fill: '-1',
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'สมส่วน (-1.5 SD ถึง +1.5 SD)',
                    data: sdNeg1_5,
                    borderColor: '#e53935',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(255, 200, 120, 0.7)',
                    fill: '-1',
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'ค่อนข้างผอม (-2 SD ถึง -1.5 SD)',
                    data: sdNeg2,
                    borderColor: '#000',
                    borderWidth: 1,
                    backgroundColor: 'transparent',
                    fill: false,
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'จุดของคุณ',
                    data: [{x: currentHeight, y: currentWeight}],
                    backgroundColor: '#111',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    type: 'scatter',
                    showLine: false
                }
            ]
        },
        plugins: [zoneLabelPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { family: 'Kanit', size: 10 },
                        boxWidth: 12,
                        padding: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.type === 'scatter') {
                                return `น้ำหนัก ${context.raw.y} กก. (สูง ${context.raw.x} ซม.)`;
                            }
                            return `${context.dataset.label}: ${context.raw.y.toFixed(1)} กก.`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'ส่วนสูง (เซนติเมตร)' },
                    min: 85,
                    max: 140,
                    ticks: { stepSize: 5 }
                },
                y: {
                    title: { display: true, text: 'น้ำหนัก (กิโลกรัม)' },
                    min: 9,
                    max: Math.max(52, currentWeight ? Math.ceil(parseFloat(currentWeight)) + 2 : 52),
                    ticks: { 
                        stepSize: 1,
                        autoSkip: false,
                        font: { size: 9 }
                    }
                }
            }
        }
    });
};

document.getElementById('close-chart-modal')?.addEventListener('click', () => {
    document.getElementById('chart-modal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('chart-modal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});
