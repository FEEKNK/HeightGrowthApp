// Test Configurations
const testsGroup1 = [
    { id: 'bmi', name: 'BMI (ดัชนีมวลกาย)', type: 'calculated', unit: '' },
    { id: 'single-leg-stance', name: 'Single Leg Stance', desc: 'ยืนทรงตัวขาเดียว', type: 'time', unit: 'วินาที' },
    { id: 'single-leg-hop', name: 'Single Leg Hop', desc: 'กระโดดขาเดียว', type: 'count', unit: 'ครั้ง' },
    { id: 'standing-long-jump', name: 'Standing Long Jump', desc: 'กระโดดไกลอยู่กับที่', type: 'distance', unit: 'ซม.' }
];

const testsGroup2 = [
    { id: 'bmi', name: 'BMI (ดัชนีมวลกาย)', type: 'calculated', unit: '' },
    { id: 'shuttle-run', name: '10x5 m Shuttle', desc: 'วิ่งกลับตัว 10x5 เมตร', type: 'time', unit: 'วินาที' },
    { id: 'step-test', name: '3 Min Step Test', desc: 'ทดสอบก้าวขึ้น-ลง 3 นาที', type: 'count', unit: 'ครั้ง/นาที' },
    { id: 'standing-long-jump', name: 'Standing Long Jump', desc: 'กระโดดไกลอยู่กับที่', type: 'distance', unit: 'ซม.' },
    { id: 'handgrip', name: 'Handgrip', desc: 'วัดแรงบีบมือ', type: 'weight', unit: 'กก.' },
    { id: 'sit-reach', name: 'Sit & Reach', desc: 'นั่งงอตัวไปข้างหน้า', type: 'distance', unit: 'ซม.' },
    { id: 'single-leg-stance', name: 'Single Leg Stance', desc: 'ยืนทรงตัวขาเดียว', type: 'time', unit: 'วินาที' }
];

// App State
let currentUser = null;

// DOM Elements
const screenOnboarding = document.getElementById('screen-onboarding');
const screenDashboard = document.getElementById('screen-dashboard');
const onboardingForm = document.getElementById('onboarding-form');
const btnBack = document.getElementById('btn-back');
const testListContainer = document.getElementById('test-list');

// Utility: Calculate Age
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Utility: Calculate BMI
function calculateBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    return (weight / (heightM * heightM)).toFixed(2);
}

// Event Listeners
onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('child-name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const birthDate = document.getElementById('birth-date').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    
    const age = calculateAge(birthDate);
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
    
    currentUser = { name, gender, age, weight, height, bmi, group };
    
    setupDashboard();
    switchScreen(screenDashboard);
});

btnBack.addEventListener('click', () => {
    switchScreen(screenOnboarding);
});

document.getElementById('btn-submit-tests').addEventListener('click', () => {
    alert('บันทึกผลสำเร็จ! (ในอนาคตส่วนนี้จะส่งข้อมูลไปยังระบบประเมินผลผ่าน/ไม่ผ่านตามเกณฑ์)');
});

// Functions
function switchScreen(targetScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
}

function setupDashboard() {
    // Update Header
    document.getElementById('display-name').textContent = currentUser.name;
    document.getElementById('display-group').textContent = `อายุ ${currentUser.age} ปี (กลุ่ม ${currentUser.group})`;
    
    // Choose Test List
    const tests = currentUser.group === 1 ? testsGroup1 : testsGroup2;
    
    // Render Test Cards
    testListContainer.innerHTML = '';
    
    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        
        if (test.id === 'bmi') {
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">🏋️‍♂️ ${test.name}</div>
                    <div style="font-weight: 600; color: var(--primary); font-size: 1.2rem;">${currentUser.bmi}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light);">น้ำหนัก ${currentUser.weight} กก. / ส่วนสูง ${currentUser.height} ซม.</div>
            `;
        } else {
            card.innerHTML = `
                <div class="test-header">
                    <div class="test-title">🎯 ${test.name}</div>
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
