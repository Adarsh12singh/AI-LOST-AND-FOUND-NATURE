# 🌿 AI LOST AND FOUND NATURE

> **"Lost shouldn't mean gone."**

**AI LOST AND FOUND NATURE** is an intelligent Lost, Found & Recovery platform designed for the real-world physical and outdoor environment (forests, trails, mountains, waterfalls, beaches, campsites, parks, and outdoor commons).

Rather than treating recovery as a simple database search or basic keyword query, the platform models the complete real-world journey:
```
LOST  ──►  DISCOVERY  ──►  PERSISTENT MATCHING  ──►  OWNERSHIP VERIFICATION  ──►  SAFE HANDOVER
```

---

## 🏔️ Core Design Principles

1. **Persistent Re-Matching**: If an item is reported lost on Day 1 and has no counterpart, the search doesn't stop. When a found item is reported on Day 10, the engine automatically revisits historical lost cases.
2. **Explainable AI Matching**: Never outputs a blind percentage. Shows human-readable evidence: brand alignment, primary color match, terrain compatibility, geographic distance in meters, and distinctive physical wear.
3. **Environmental Movement & Terrain**: Accounts for item drift across outdoor geography (downstream river currents, downhill slope roll, transit to park ranger stations).
4. **Permanent vs Changeable Characteristics**: Separates immutable markers (scratches, fabric tears, structural damage) from volatile elements (cases, keychains, stickers).
5. **AI Match ≠ Confirmed Ownership**: Defends against multiple claimants and fraud. Claimants must prove private secret details (hidden markings, internal contents, serial/IMEI) kept safely inside an encrypted vault.
6. **Station & Authority Oversight**: Empowers park rangers, station managers, and authorized officials with a dedicated dashboard to review claims and facilitate safe property handover.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Python 3.13, FastAPI | Async API, Pydantic v2, RESTful architecture |
| **Database** | SQLite + SQLAlchemy 2.0 | Multi-signal matching tables, audit event timeline |
| **Frontend** | Next.js 15, React 19, TypeScript | App Router, Tailwind CSS v4, Lucide Icons |
| **Engine** | Explainable Multi-Signal Engine | Semantic text, geospatial haversine, temporal decay |
| **File Storage** | Local Secure Upload Vault | Size validation, extension checks (`.jpg`, `.png`, `.webp`) |

---

## 📂 Project Directory Structure

```
d:\AI LOST AND FOUND NATURE\
├── backend\
│   ├── app\
│   │   ├── api\
│   │   │   ├── cases.py            # Case CRUD & Hotspot analytics
│   │   │   ├── matching.py         # Persistent matching endpoints
│   │   │   ├── verification.py     # Private ownership claim review
│   │   │   ├── smart_questions.py  # AI Smart Questioning assistant
│   │   │   └── uploads.py          # Secure media upload handler
│   │   ├── models\
│   │   │   ├── case.py             # Case profile & environmental fields
│   │   │   ├── timeline.py         # Immutable chronological audit log
│   │   │   ├── match.py            # Potential matches & evidence breakdown
│   │   │   └── verification.py     # Ownership claims & authority notes
│   │   ├── schemas\                # Pydantic validation schemas
│   │   ├── services\
│   │   │   ├── case_service.py     # Case lifecycle & analytics
│   │   │   ├── matching_engine.py  # Multi-signal matching & persistent rematch
│   │   │   └── timeline_service.py # Audit event logging
│   │   ├── config.py               # Settings & upload directory resolution
│   │   ├── database.py             # Database engine & session generator
│   │   └── main.py                 # FastAPI application & CORS setup
│   ├── tests\
│   │   └── test_api.py             # Automated unit & integration tests
│   ├── seed_data.py                # Realistic outdoor sample cases
│   ├── requirements.txt            # Python dependencies
│   └── run.py                      # Uvicorn server launcher
│
├── frontend\
│   ├── src\
│   │   ├── app\
│   │   │   ├── page.tsx            # Home, hero, live metrics & 5-step workflow
│   │   │   ├── cases\page.tsx      # Case directory & interactive explorer
│   │   │   ├── cases\[id]\page.tsx # Case details, matches & timeline
│   │   │   ├── report-lost\page.tsx# Lost item reporting with AI Smart Questions
│   │   │   ├── report-found\page.tsx# Found item report & safe storage location
│   │   │   └── authority\page.tsx  # Station management & claim verification
│   │   ├── components\
│   │   │   ├── Navbar.tsx          # Navigation bar with nature styling
│   │   │   ├── Footer.tsx          # Principles & supported terrains
│   │   │   ├── CaseCard.tsx        # Case card with urgency & terrain badges
│   │   │   ├── TimelineView.tsx    # Chronological audit timeline
│   │   │   ├── MatchExplanation.tsx# Explainable matching evidence component
│   │   │   └── VerificationModal.tsx# Private ownership claim modal
│   │   └── lib\
│   │       └── api.ts              # Typed API client
│   └── package.json
└── README.md
```

---

## ⚡ How to Run on Windows

### 1. Start the Backend API (FastAPI)

Open a PowerShell terminal in `d:\AI LOST AND FOUND NATURE`:

```powershell
# Activate Python virtual environment and run the server
.\backend\venv\Scripts\python.exe backend\run.py
```
* **API Server:** `http://127.0.0.1:8000`
* **Interactive API Documentation (Swagger):** `http://127.0.0.1:8000/docs`

*(Optional) To re-seed sample outdoor cases:*
```powershell
$env:PYTHONPATH="backend"; .\backend\venv\Scripts\python.exe backend\seed_data.py
```

*(Optional) To execute automated tests:*
```powershell
$env:PYTHONPATH="backend"; .\backend\venv\Scripts\pytest.exe backend\tests\test_api.py -v
```

---

### 2. Start the Frontend (Next.js)

Open a second PowerShell terminal in `d:\AI LOST AND FOUND NATURE\frontend`:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm run dev
```
* **Web Application:** `http://localhost:3000`

---

## 🔍 How to Test the Complete End-to-End Recovery Flow

1. **Explore Cases**: Visit `http://localhost:3000/cases` to browse active cases across mountains, trails, campsites, and waterfalls.
2. **View Explainable Evidence**: Click into **Case #LST-2026-0001** (*Navy Blue Osprey Backpack*). Notice the Persistent Matching Engine panel:
   * **Score:** `79.7% VERY HIGH`
   * **Why this may be the same item:** Category Match, Brand Match (*Osprey*), Primary Color Match (*Navy*), Geographic proximity (*154m apart*), and Distinctive Wear (*Tape repair patch on bottom*).
3. **Submit Private Claim**: Click **"Verify Ownership to Claim"** to submit private proof (secret marks, internal notebook).
4. **Station Authority Review**: Go to `http://localhost:3000/authority` to view the station queue, review the claimant's secret proof, and approve the claim.
5. **Physical Handover**: Mark the case as **RECOVERED** once handed over at the ranger station.
6. **Smart Questioning**: Visit `http://localhost:3000/report-lost` and enter an informal description in the AI Smart Questioning Assistant to see tailored follow-up suggestions for high-value attributes.
