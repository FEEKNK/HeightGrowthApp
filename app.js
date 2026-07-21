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
    if (age >= 4 && age <= 7) {
        group = 1;
    } else if (age >= 8 && age <= 14) {
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
                            hopEval = 'ผ่านเกณฑ์';
                        } else {
                            hopVal = 'ไม่ผ่านตามเกณฑ์ท่าทาง';
                            hopEval = 'ควรพัฒนา';
                        }
                        break;
                    }
                }
                
                if (hopVal !== '-' || hopCountStr !== '') {
                    // Combine count and qualitative result
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
        
        // Manual collection for step-test since it has custom fields
        const stepHrRest = document.getElementById('step-hr-rest');
        if (stepHrRest) {
            const hrRest = stepHrRest.value || '-';
            const hrRec = document.getElementById('step-hr-recovery').value || '-';
            const bp = document.getElementById('step-bp').value || '-';
            const spo2 = document.getElementById('step-spo2').value || '-';
            const rpe = document.getElementById('step-rpe').value || '-';
            
            let stepEval = 'บันทึกเป็น Baseline';
            if (hrRest !== '-' && hrRec !== '-' && hrRest !== '' && hrRec !== '') {
                const diff = parseInt(hrRest) - parseInt(hrRec);
                if (diff >= 0) {
                     stepEval = `ฟื้นตัวได้ดี (ลดลง ${diff} bpm)`;
                } else {
                     stepEval = `อัตราเต้นหัวใจยังสูงกว่าก่อนพัก`;
                }
            }
            
            const stepValueDisplay = `HR(Rest): ${hrRest}, HR(Rec): ${hrRec}<br>BP: ${bp}, SpO2: ${spo2}%, RPE: ${rpe}`;
            
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

    // Create report template
    const reportDiv = document.createElement('div');
    reportDiv.className = 'pdf-report';
    reportDiv.style.padding = '20px 30px';
    reportDiv.style.backgroundColor = '#fff';
    reportDiv.style.color = '#333';
    reportDiv.style.fontFamily = "'Kanit', sans-serif";
    
    let html = `
        <h1 style="text-align: center; color: #4361ee; font-size: 24px; margin-bottom: 5px;">สรุปผลการประเมินสมรรถภาพทางกาย</h1>
        <h2 style="text-align: center; color: #3a0ca3; font-size: 18px; margin-bottom: 20px;">GrowthFit</h2>
        
        <div style="margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">ข้อมูลเบื้องต้น</h3>
            <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.95em;">
                <tr>
                    <td style="padding: 6px 0;"><strong>HN:</strong> ${currentUser.hn}</td>
                    <td style="padding: 6px 0;"><strong>ชื่อ-นามสกุล:</strong> ${currentUser.name}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0;"><strong>เพศ:</strong> ${currentUser.gender === 'male' ? 'ชาย' : 'หญิง'}</td>
                    <td style="padding: 6px 0;"><strong>อายุ:</strong> ${currentUser.age} ปี (กลุ่ม ${currentUser.group})</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0;"><strong>น้ำหนัก:</strong> ${currentUser.weight} กก.</td>
                    <td style="padding: 6px 0;"><strong>ส่วนสูง:</strong> ${currentUser.height} ซม.</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0;" colspan="2"><strong>BMI:</strong> ${currentUser.bmi}</td>
                </tr>
            </table>
        </div>
        
        <div>
            <h3 style="font-size: 16px; margin-bottom: 10px;">ผลการทดสอบ</h3>
            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 10px; font-size: 0.95em;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd;">รายการทดสอบ</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">ผลลัพธ์</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">การประเมิน</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    results.forEach(r => {
        const evalColor = (r.evaluation.includes('ควรพัฒนา') || r.evaluation.includes('ต่ำ') || r.evaluation.includes('อ้วน') || r.evaluation.includes('ผอม')) ? '#e63946' : '#2a9d8f';
        html += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${r.name}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${r.value || '-'} ${r.unit}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: ${evalColor};">${r.evaluation}</td>
                    </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 30px; text-align: right; font-size: 0.8em; color: #666;">
            <p>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</p>
        </div>
    `;
    
    reportDiv.innerHTML = html;
    
    // Save for PDF generation and show on screen
    currentReportDiv = reportDiv;
    summaryContainer.innerHTML = '';
    summaryContainer.appendChild(reportDiv.cloneNode(true));
    
    switchScreen(screenSummary);
});

btnBackToDashboard.addEventListener('click', () => {
    switchScreen(screenDashboard);
});

btnDownloadPdf.addEventListener('click', () => {
    if (!currentReportDiv) return;

    // Use the already-visible report element in summaryContainer
    const visibleReport = summaryContainer.querySelector('.pdf-report');
    const target = visibleReport || summaryContainer;

    const opt = {
        margin:       [10, 10, 10, 10], // top, right, bottom, left in mm
        filename:     `GrowthFit_Report_${currentUser.hn}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { avoid: 'tr' }
    };

    html2pdf().set(opt).from(target).save();
});

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
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="font-size: 0.75rem; color: #555;">HR Rest (bpm)</label>
                        <input type="number" id="step-hr-rest" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #555;">SpO2 (%)</label>
                        <input type="number" id="step-spo2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #555;">BP (mmHg)</label>
                        <input type="text" id="step-bp" placeholder="เช่น 120/80" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: #555;">RPE / Pain</label>
                        <input type="text" id="step-rpe" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    </div>
                </div>
                <div>
                    <label style="font-size: 0.8rem; font-weight: bold; color: var(--primary);">HR Recovery 1 นาทีเต็ม (bpm)</label>
                    <input type="number" id="step-hr-recovery" style="width: 100%; padding: 8px; border: 1.5px solid var(--primary); border-radius: 4px; margin-top: 5px; box-sizing: border-box;">
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
