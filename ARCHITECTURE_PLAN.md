# GrowthFit System Architecture — PDPA + Telegram PDF + Python OCR Backend

> **สถานะ:** 📋 แผนเท่านั้น — ยังไม่เริ่มทำ  
> **อัปเดตล่าสุด:** 2026-07-31

---

## สรุปปัญหาและบริบท

ระบบ **GrowthFit** ปัจจุบันเป็น **Client-side 100%** (HTML/CSS/JS) เก็บข้อมูลใน LocalStorage เท่านั้น ต้องการขยายระบบให้:

1. **ใช้งานนอกสถานที่** (PC + มือถือ) ได้อย่าง **PDPA-Compliant** → ไม่โชว์ชื่อ-สกุล, ใช้ HN เท่านั้น
2. **ส่ง PDF ผลลัพธ์ผ่าน Telegram Bot** แทนการดาวน์โหลดตรงบนเครื่อง
3. **Deploy Frontend บน Vercel** (static site)
4. **ข้อมูลหลังบ้านเข้าถึงได้เฉพาะ PC โรงพยาบาล** (Database Server ของ รพ.)
5. **Python OCR** อ่านข้อมูลจาก PDF ที่ส่งไป Telegram → ดึงกลับมาเก็บในฐานข้อมูลหลังบ้าน

---

## คำตอบจาก Open Questions

| # | คำถาม | คำตอบ |
|---|-------|-------|
| 1 | เลือกแนวทาง A หรือ B? | ✅ **A** — Python Backend (FastAPI) แยกบน Hospital Server |
| 2 | Telegram Bot ส่ง PDF ให้ใคร? | ⏳ **ยังไม่ตัดสินใจ** — เลือกระหว่าง: กลุ่ม Staff รพ. / เจ้าหน้าที่ 1 บัญชี |
| 3 | Python OCR ทำอะไร? | ✅ **ดึงข้อมูลหลังบ้านจาก PDF ใน Telegram** — OCR อ่าน PDF ที่ระบบสร้าง+ส่งไป Telegram แล้วดึงข้อมูลกลับมาเก็บใน DB |
| 4 | Hospital PC restriction? | ✅ **Database Server ของ รพ.** — ใช้ DB Server ที่มีอยู่แล้ว |
| 5 | PDPA — ชื่อ-สกุล? | ✅ **ชื่อ-สกุลไม่อยู่บน public** — ค่อยดึงตอนอยู่ PC รพ. โดย lookup จาก HN (ผ่าน HIS/ระบบ รพ.) |

---

## สถาปัตยกรรมที่เลือก: แนวทาง A

### Architecture Overview

```
                    ┌──────────────────────────────────────┐
                    │        🌐 PUBLIC (Vercel)             │
                    │                                      │
                    │   Frontend (HTML/CSS/JS)              │
                    │   — ใช้แต่ HN ไม่มีชื่อ-สกุล —       │
                    │   (สร้าง PDF และส่งผ่าน Vercel API)   │
                    └──────────────┬───────────────────────┘
                                   │
                        ส่ง PDF ผ่าน Telegram API
                                   │
                                   ▼
                            ┌───────────────┐
                            │ 📱 Telegram   │
                            │ Bot           │
                            │ (รับ PDF      │
                            │  ผลทดสอบ)     │
                            └───────┬───────┘
                                   │
                    ดึง PDF กลับผ่าน API (Polling)
                                   │
                                   ▼
    ┌──────────────────────────────────────────────────────┐
    │              🏥 HOSPITAL NETWORK (Private)           │
    │                                                      │
    │   ┌─────────────────┐    ┌─────────────────────┐    │
    │   │  Python Backend  │    │  Database Server    │    │
    │   │  (OCR Service)   │───▶│  (MySQL/PostgreSQL) │    │
    │   │  ดึงข้อมูลจาก PDF │    │  เก็บข้อมูลเต็ม     │    │
    │   └────────┬────────┘    └─────────────────────┘    │
    │            │                                         │
    │            │              ┌─────────────────────┐    │
    │            │              │  ระบบ HIS รพ.        │    │
    │            │              │  (ชื่อ-สกุล ↔ HN)   │    │
    │            │              └─────────────────────┘    │
    │            │                                         │
    │   ┌────────▼────────┐                               │
    │   │  Admin Dashboard │  ← เข้าถึงจาก PC รพ. เท่านั้น│
    │   │  (ดูข้อมูล+ชื่อ) │                               │
    │   └─────────────────┘                               │
    └──────────────────────────────────────────────────────┘
```

### อธิบาย Flow หลัก

1. **เจ้าหน้าที่** เปิด Frontend (Vercel) จาก **มือถือ/PC** นอกสถานที่
2. กรอก **HN + ผลทดสอบ** (ไม่มีชื่อ-สกุลบนหน้าเว็บ ← PDPA)
3. กดส่ง → Frontend **สร้าง PDF** และ **ส่งไฟล์ PDF ไปเข้า Telegram Bot** โดยตรง (ผ่าน Vercel Serverless Function เพื่อไม่ให้ Token หลุด)
4. เจ้าหน้าที่ **ได้รับ PDF ใน Telegram** ทันที
5. **Python Backend** ในเครือข่ายโรงพยาบาล (ทำงานแบบ Background) คอย Polling ดึง PDF จาก Telegram กลับมา
6. Backend ทำ **OCR อ่านข้อมูลจาก PDF** → แล้วบันทึกลง **Database หลังบ้าน**
7. **PC โรงพยาบาล** เปิด Admin Dashboard → ดูข้อมูลทั้งหมด + ดึง **ชื่อ-สกุลจาก HN** ผ่านระบบ HIS

---

## Data Flow (ละเอียด)

```
=== Assessment Flow (Frontend ➡️ Telegram) ===

  👨‍⚕️ เจ้าหน้าที่ (มือถือ/PC)
       │
       ▼
  🌐 Frontend (Vercel) ─── กรอก HN + ทำ test + คำนวณผล + สร้าง PDF
       │
       │  POST /api/send-telegram (Vercel Serverless Function)
       ▼
  📱 Telegram Bot ──▶ ส่ง PDF เข้า Group/Chat
                 │
                 ▼
            เจ้าหน้าที่ได้รับ PDF ใน Telegram ✅


=== OCR Flow (Background ใน รพ.) ===

  🏥 Python Backend (Hospital Server)
       │
       │  getUpdates() / poll ดึง PDF จาก Telegram (Outbound connection)
       ▼
  📱 Telegram Bot ──▶ ส่ง PDF documents กลับมา
       │
       ▼
  🏥 Python Backend
       │  OCR อ่าน Text จาก PDF (PyMuPDF + regex parse)
       ▼
  💾 INSERT ข้อมูลที่ OCR ได้ → Database (ไม่มีข้อมูลชื่อ-สกุล)


=== Admin Flow (PC รพ. เท่านั้น) ===

  👨‍⚕️ เจ้าหน้าที่ (PC รพ.)
       │
       │  GET /admin
       ▼
  🏥 Python Backend
       │
       ├──▶ 💾 query records → Database
       │
       └──▶ 🏥 lookup ชื่อ-สกุล จาก HN → ระบบ HIS
       │
       ▼
  แสดงข้อมูลพร้อมชื่อ-สกุล
```

---

## PDPA Compliance Design

### Public Zone (Vercel + Telegram)
- ❌ ไม่มีชื่อ-สกุล
- ✅ HN เท่านั้น
- ✅ PDF มีแต่ HN + ผลทดสอบ (ไม่มี PII)
- ✅ Telegram ส่ง PDF ไม่มีข้อมูลส่วนบุคคล

### Private Zone (Hospital Network Only)
- ✅ Database เก็บ HN + ผลทดสอบ
- ✅ ชื่อ-สกุล ดึงจาก HIS เฉพาะตอนดูบน PC รพ.
- ✅ Admin Dashboard อยู่ใน private network
- ✅ Access control ผ่าน network ของ รพ.

### PDPA Checklist

| รายการ | สถานะ | หมายเหตุ |
|--------|:---:|---|
| Frontend ไม่มีช่องชื่อ-สกุล | ✅ | ปัจจุบันก็ไม่มีอยู่แล้ว |
| PDF Report ไม่มีชื่อ-สกุล | ✅ | ใช้แต่ HN |
| Telegram ไม่ส่งข้อมูลส่วนบุคคล | ✅ | PDF มีแต่ HN + ผลทดสอบ |
| ข้อมูลหลังบ้านอยู่ใน Hospital Network | ✅ | DB Server ของ รพ. |
| ชื่อ-สกุล lookup จาก HN เฉพาะ PC รพ. | ✅ | ดึงจาก HIS ไม่เก็บซ้ำ |
| Admin Dashboard = Hospital Network Only | ✅ | Bind เฉพาะ internal IP |

---

## Proposed Changes (เริ่มทำเมื่อพร้อม)

### 1. Frontend (Vercel Deploy)

#### [MODIFY] index.html
- เพิ่มปุ่ม "📤 ส่ง PDF ทาง Telegram" ในหน้า Summary
- ลบ/ซ่อนปุ่ม "ข้อมูลหลังบ้าน" (ย้ายไป Admin Dashboard บน Hospital Server)
- ยืนยัน PDPA — ไม่มี field ชื่อ-สกุล ✅

#### [MODIFY] app.js
- เพิ่ม `sendToTelegram()` — POST ข้อมูล (หรือ PDF Blob) ไปยัง Vercel API
- ปรับ `generateVectorPDF()` ให้ return PDF blob (เพื่อส่งให้ Vercel API)

#### [NEW] api/send-telegram.js (Vercel Serverless Function)
- รับ PDF Blob จาก Frontend
- อ่าน `TELEGRAM_BOT_TOKEN` จาก Environment Variables (ปลอดภัย ไม่เผยแพร่หน้าเว็บ)
- ยิง API ของ Telegram (`sendDocument`) เพื่อส่ง PDF เข้ากลุ่ม

#### [NEW] vercel.json
- Vercel deployment config

---

### 2. Python Backend (Hospital Server)

#### [NEW] backend/main.py — FastAPI Server
**Endpoints:**
- `GET /api/records` — ดึงข้อมูลหลังบ้าน (เฉพาะ Hospital Network)
- `POST /api/manual-ocr-import` — (Optional) สำหรับกด Trigger ดึงข้อมูล OCR แบบ Manual
- `GET /api/export-csv` — export CSV

#### [NEW] backend/telegram_bot.py — Telegram Polling Service
- รันเป็น Background Service (Polling)
- ดึง PDF ใหม่จาก Telegram (`getUpdates`) เข้ามาทำ OCR
- เมื่อทำ OCR สำเร็จ ให้บันทึกข้อมูลลง Database
- ไม่ต้องส่งไฟล์แล้ว (เพราะ Frontend ส่งไปแล้ว) แค่คอย "รับ" อย่างเดียว

#### [NEW] backend/ocr_service.py — PDF OCR
- **PyMuPDF (fitz)** อ่าน text จาก PDF ที่ระบบสร้างเอง (text-based → ไม่ต้อง Tesseract)
- **Regex parse** ดึง HN, อายุ, เพศ, ผลทดสอบ จากโครงสร้าง PDF ที่รู้ format
- Output → structured JSON → INSERT เข้า DB

#### [NEW] backend/database.py — Database Connection
- เชื่อมต่อ **Database Server ของ รพ.** (MySQL/PostgreSQL — รอยืนยันประเภท)
- Table: `assessments` (id, hn, company, gender, age, weight, height, bmi, hr, bp, results_json, pdf_telegram_file_id, created_at)
- ไม่เก็บชื่อ-สกุลในตาราง → ดึงจาก HIS ตอนแสดงผลเท่านั้น

#### [NEW] backend/admin_dashboard.py — Admin Routes (Hospital PC Only)
- หน้าแสดงข้อมูลหลังบ้าน ผ่าน browser บน PC รพ.
- ดึงข้อมูลจาก DB + lookup ชื่อ-สกุลจาก HIS (ผ่าน HN)
- Search, filter, export CSV
- Access control: bind เฉพาะ hospital IP range

#### [NEW] backend/requirements.txt
```
fastapi
uvicorn
python-telegram-bot
PyMuPDF
python-dotenv
# Database driver (เลือกตาม DB ของ รพ.)
# mysqlclient หรือ psycopg2
```

#### [NEW] backend/.env.example
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_or_group_id
DATABASE_URL=mysql://user:pass@hospital-db-server:3306/growthfit
HIS_API_URL=http://his-server/api/patient
ALLOWED_ORIGINS=https://your-app.vercel.app
ADMIN_ALLOWED_IPS=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

---

### 3. File Structure (สุดท้าย)

```
HeightGrowthApp/
├── index.html              ← Frontend (Vercel deploy)
├── style.css
├── app.js                  ← + sendToBackend(), Telegram PDF send
├── criteria.js
├── kanit-font.js
├── logo_*.js / qr_data.js
├── vercel.json             ← [NEW] Vercel config
│
└── backend/                ← [NEW] Hospital Server only
    ├── main.py             ← FastAPI server (API routes)
    ├── telegram_bot.py     ← Telegram Bot integration
    ├── ocr_service.py      ← PDF OCR (PyMuPDF + regex)
    ├── database.py         ← Hospital DB connection
    ├── admin_dashboard.py  ← Admin routes (PC รพ. only)
    ├── requirements.txt
    ├── .env.example
    └── templates/
        └── admin.html      ← Admin UI (Hospital Network)
```

---

## สิ่งที่รอตัดสินใจ (Pending)

| # | รายการ | สถานะ |
|---|--------|:---:|
| 1 | Telegram ส่งเข้ากลุ่ม Staff หรือ 1 บัญชี? | ⏳ |
| 2 | Database Server ของ รพ. เป็น MySQL / PostgreSQL / อื่น? | ⏳ |
| 3 | ระบบ HIS มี API สำหรับ lookup ชื่อจาก HN หรือไม่? (ถ้าไม่มี → manual import) | ⏳ |
| 4 | Hospital Server ออกอินเทอร์เน็ตเพื่อดึงข้อมูลจาก Telegram API ได้หรือไม่? (ปกติ Firewall รพ. จะอนุญาต Outbound) | ✅ แก้ปัญหาเจาะ Inbound Port ได้แล้ว |

---

## Verification Plan (ตอนเริ่มทำ)

### Automated Tests
```bash
cd backend
python -m pytest tests/ -v
python -m pytest tests/test_ocr.py -v
python -m pytest tests/test_telegram.py -v
```

### Manual Verification
1. Frontend (Vercel): เปิดจากมือถือ + PC → ยืนยันไม่มีข้อมูลส่วนบุคคล
2. Telegram PDF: ทำ assessment → PDF ปรากฏใน Telegram
3. OCR Import: ส่ง PDF ตัวอย่างเข้า Telegram → OCR อ่านถูกต้อง → ข้อมูลเข้า DB
4. Admin Dashboard: เปิดจาก PC รพ. → เห็นข้อมูลพร้อมชื่อ-สกุล (จาก HN)
5. Access Control: เปิด Admin จากนอก รพ. → ต้อง block
6. PDPA Audit: ตรวจทุก endpoint/PDF ว่าไม่มีชื่อ-สกุลหลุดไป public
