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
                stepValueDisplay = `HR Peak: ${hrPeak} bpm, HR Rec: ${hrRec} bpm (ลดลง ${diff} bpm)`;
            } else if (hrPeak !== '' || hrRec !== '') {
                stepValueDisplay = `HR Peak: ${hrPeak || '-'} bpm, HR Rec: ${hrRec || '-'} bpm`;
            }
            
            results.push({
                name: '3 Min Step Test',
                value: stepValueDisplay,
                unit: '',
                evaluation: stepEval
            });
        }
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
    doc.roundedRect(marginX, 43, printableWidth, 30, 3, 3, 'FD');

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
    const infoY2 = 66;
    doc.setTextColor(100, 116, 139); doc.text('น้ำหนัก / Weight:', marginX + 6, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.weight} กก. / kg`, marginX + 34, infoY2);

    doc.setTextColor(100, 116, 139); doc.text('ส่วนสูง / Height:', marginX + 66, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${currentUser.height} ซม. / cm`, marginX + 94, infoY2);

    doc.setTextColor(100, 116, 139); doc.text('วันที่ทดสอบ / Test Date:', marginX + 130, infoY2);
    doc.setTextColor(15, 23, 42); doc.text(`${testDate}`, marginX + 164, infoY2);

    // 3. Test Results Title & Table
    doc.setFontSize(10.5);
    doc.setTextColor(0, 58, 112);
    doc.text('ผลการทดสอบ / Test Results', marginX + 2, 80);

    const tableBody = currentResults.map(r => {
        const valStr = (r.value !== undefined && r.value !== null && r.value !== '') ? String(r.value) : '-';
        const cleanValue = valStr.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
        const displayUnit = r.unit && !cleanValue.includes(r.unit) && cleanValue !== '-' ? ` ${r.unit}` : '';
        return [r.name, `${cleanValue}${displayUnit}`.trim(), r.evaluation];
    });

    doc.autoTable({
        startY: 84,
        margin: { left: marginX, right: marginX },
        head: [['รายการทดสอบ / Test Item', 'ผลลัพธ์ / Result', 'ระดับ / Level']],
        body: tableBody,
        theme: 'grid',
        styles: {
            font: 'Kanit',
            fontSize: 9.5,
            textColor: [30, 41, 59],
            cellPadding: 4,
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

    // 4. Page Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Bangkok Dusit Medical Services (BDMS) - Quality Medical Report | พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, 105, 285, { align: 'center' });

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
    // Update Header
    document.getElementById('display-name').textContent = `${currentUser.hn} - ${currentUser.name}`;
    document.getElementById('display-group').textContent = `อายุ ${currentUser.age} ปี (กลุ่ม ${currentUser.group})`;
    
    // Choose Test List
    const tests = currentUser.group === 1 ? testsGroup1 : testsGroup2;
    
    // Render Test Cards
    testListContainer.innerHTML = '';
    
    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        
        if (test.id === 'bmi' || test.id === 'weight-for-height') {
            const displayVal = test.id === 'bmi' ? currentUser.bmi : `${currentUser.weight} กก.`;
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">${test.name}</div>
                    <div style="font-weight: 600; color: var(--primary); font-size: 1.2rem;">${displayVal}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light);">น้ำหนัก ${currentUser.weight} กก. / ส่วนสูง ${currentUser.height} ซม.</div>
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
