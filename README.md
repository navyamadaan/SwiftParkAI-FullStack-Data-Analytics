# 🅿️ SwiftParkAI

**An AI-powered, real-time smart parking system for mall operations — built end-to-end across IoT, backend, frontend, and data science.**

SwiftParkAI simulates a live parking management platform for a shopping mall (modeled on Square One Shopping Centre, Mississauga). It ingests real-time occupancy data from IoT ultrasonic sensors, streams it through a live backend into a glassmorphic React dashboard, and layers K-Means clustering analytics — plus a Gemini-powered AI assistant — on top to help users understand and navigate mall parking in real time.

**🔗 Live demo:** [swift-park-ai-full-stack-data-analy-eta.vercel.app](https://swift-park-ai-full-stack-data-analy-eta.vercel.app)
*(Note: the backend runs on a free-tier host that spins down after inactivity — the first request after idle time may take 30–50 seconds to respond while it wakes up.)*

---

## 🧠 System Overview

```
┌─────────────┐      HTTP POST        ┌─────────────┐      MongoDB       ┌─────────────┐
│  IoT Sensor  │ ────────────────────▶ │   Backend    │ ──────────────────▶ │   Atlas DB   │
│ (ESP32 +     │   { spotId, occupied} │ (Express +   │                     │  (MongoDB)   │
│  HC-SR04)    │                       │  Mongoose)   │ ◀────────────────── │              │
└─────────────┘                       └─────┬───────┘      Aggregation     └─────────────┘
                                              │
                                              │ REST API
                                              ▼
                                       ┌─────────────┐
                                       │   Frontend   │
                                       │  (React +    │
                                       │  Tailwind +  │
                                       │Framer Motion)│
                                       └─────┬───────┘
                                              │
                ┌──────────────┬──────────────┼──────────────┐
                ▼              ▼              ▼              ▼
         ┌───────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────┐
         │  Live Map  │ │ Zone        │ │  AI Q&A     │ │  Live      │
         │ (Leaflet + │ │ Analytics   │ │ (Gemini +   │ │  Grid View │
         │  Routing)  │ │ (Recharts)  │ │  live data) │ │            │
         └───────────┘ └─────────────┘ └────────────┘ └────────────┘
```

Parking occupancy data is generated two ways:
1. **Real hardware simulation** — an ESP32 + HC-SR04 ultrasonic sensor, simulated in Wokwi, detects vehicle presence and POSTs live state changes to the backend over a LocalTunnel bridge.
2. **Synthetic load generator** — `scripts/simulation.py` randomly toggles spot occupancy for local development and demos without hardware.

Separately, a **K-Means clustering pipeline** (`scripts/analytics_engine.ipynb`) processes historical turnover and dwell-time data to classify each of the 30 parking spots into behavioral zones, which are geographically anchored to real parking areas around the mall and rendered on an interactive map.

An integrated **AI assistant**, powered by Google's Gemini API, answers natural-language questions about the parking system — combining historical clustering data with **live occupancy from MongoDB** so it can answer both "which zone is typically busiest?" and "which zone has open spots right now?"

---

## 🏗️ Architecture

### 1. IoT Layer — `/IoT`
| File | Purpose |
|---|---|
| `sketch.ino` | ESP32 firmware. Reads distance via HC-SR04 ultrasonic sensor; if distance < 50cm, spot is marked occupied. On state change, POSTs JSON payload to the backend. Currently wired to control **Spot 1**. |
| `diagram.json` | Wokwi circuit diagram (ESP32 + HC-SR04 wiring). |
| `wokwi-project.txt` | Link to the live Wokwi simulation. |

**Hardware logic:** the ESP32 connects to Wokwi-GUEST WiFi, continuously pings the ultrasonic sensor, and only fires an HTTP request when occupancy *changes* — minimizing redundant network calls.

### 2. Backend — `/backend`
Built with **Express 5** + **Mongoose 9**, connected to **MongoDB Atlas**, deployed on **Render**.

| Route | Method | Purpose |
|---|---|---|
| `/` | `POST` | Receives `{ spotId, occupied }` from the IoT sensor (or simulator), logs it as a timestamped document in MongoDB. |
| `/latest-status` | `GET` | Aggregates the most recent status per `spotId` using a MongoDB aggregation pipeline, returning current live occupancy for all spots. |
| `/api/parking-stats` | `GET` | Streams and parses `scripts/final_clustered_data.csv`, enriching each spot with clustering results and real geographic coordinates before sending to the frontend. |
| `/api/ask-ai` | `POST` | Takes a natural-language question, merges historical zone stats with live occupancy data, and returns a Gemini-generated answer. Rate-limited to 10 requests/minute per IP. |

**Data model:**
```js
ParkingLog {
  spotId: Number,
  occupied: Boolean,
  timestamp: Date (default: now)
}
```

### 3. Frontend — `/frontend`
Built with **React 19**, **Tailwind CSS**, **Framer Motion**, and **React-Leaflet**, deployed on **Vercel**.

| Component | Role |
|---|---|
| `App.js` | Root state manager — handles auth gating, tab routing, and live polling of backend endpoints. |
| `Login.js` | Two-stage animated entry gate with credential-validated login (persists across refresh via `localStorage`). |
| `SideBar.js` | Primary navigation (Live Map / Zone Analytics). |
| `ParkingGrid.js` / `ParkingSpot.js` | Card-based grid view of individual spot occupancy, filterable by parking space, labeled with real zone data. |
| `RealMap.js` / `Routing.js` | Interactive Leaflet map with real GPS-anchored zone clusters and turn-by-turn routing to a selected spot. |
| `ZoneAnalytics.js` | Recharts-powered dashboard: occupancy split, turnover comparison, and spot distribution across zones. |
| `AIChat.js` | Animated chat interface over live parking analytics — preset question chips, free-text input, chat history, and auto-scroll. |

**Live data flow:** the frontend polls `/latest-status` every 5 seconds for real-time occupancy, and fetches `/api/parking-stats` once on load for geographic and clustering data.

### 4. Data Science — `/scripts`
| File | Purpose |
|---|---|
| `analytics_engine.ipynb` | K-Means clustering notebook — processes raw turnover/dwell-time data into 3 behavioral clusters. |
| `master_data.csv` | Raw input: turnover count, total occupied duration, and average hour of use per spot. |
| `final_clustered_data.csv` | Output: cluster label, human-readable zone name, and geographic coordinates per spot — this is what powers the Live Map and Zone Analytics. |
| `simulation.py` | Synthetic sensor simulator — randomly toggles occupancy for any of the 30 spots and POSTs to the backend every 5 seconds. |

**Clustering zones:**
- 🟢 **Prime Shopping Zone** — high turnover, short-to-moderate dwell time
- ⚪ **Inactive Zone** — low turnover, minimal usage
- 🔴 **Long-Stay Zone** — high dwell time, low turnover

### 5. Geographic Clustering
The 30 parking spots are grouped into 3 real-world zones, anchored to actual parking areas surrounding Square One Shopping Centre in Mississauga, ON:

| Zone | Spots | Anchor Location |
|---|---|---|
| Zone A | 1–10 | Near Sheridan College side (Lot 7) |
| Zone B | 11–20 | Near Celebration Square |
| Zone C | 21–30 | Near Walmart lot |

Each spot within a zone is offset from its anchor point in a 2×5 grid pattern, so clusters render as believable mini-lots on the map rather than overlapping points or a single line.

### 6. AI Assistant
The AI chat combines two data sources before answering:
- **Historical patterns** from the K-Means clustering pipeline (average turnover, average dwell time per zone)
- **Live occupancy** pulled directly from MongoDB at request time (spots currently occupied/available per zone)

This lets it distinguish between questions about general trends ("which zone usually has the highest turnover?") and questions about the present moment ("which zone has open spots right now?"), and it's instructed to say clearly when a question asks for data it doesn't have (e.g. nearby store locations, day-of-week patterns) rather than guessing.

---

## 🎨 Design System

The visual identity pairs **premium hospitality** (mall valet concierge) with **live sensor telemetry**, expressed through:
- **Palette:** deep ink background, warm gold accent (brand/premium moments), signal teal accent (live/data moments)
- **Type:** Fraunces (display/headings), Inter (body), IBM Plex Mono (data, timestamps, telemetry labels)
- **Motion:** animated chat messages, pulse indicators on live status, smooth tab and modal transitions via Framer Motion

---

## 🛠️ Tech Stack

**Frontend:** React 19 · Tailwind CSS · Framer Motion · React-Leaflet · Leaflet Routing Machine · Recharts · Lucide Icons

**Backend:** Node.js · Express 5 · Mongoose 9 · MongoDB Atlas · dotenv · csv-parser · express-rate-limit

**AI:** Google Gemini API (`@google/generative-ai`)

**IoT:** ESP32 · HC-SR04 Ultrasonic Sensor · Wokwi Simulation · LocalTunnel

**Data Science:** Python · pandas · scikit-learn (K-Means) · Jupyter

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js and npm
- Python 3 with `pip`
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install dependencies
```bash
git clone https://github.com/navyamadaan/SwiftParkAI-FullStack-Data-Analytics.git
cd SwiftParkAI

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`**
```
MONGO_URI=<your MongoDB Atlas connection string>
GEMINI_API_KEY=<your Gemini API key>
PORT=9000
```

**`frontend/.env`**
```
REACT_APP_API_URL=http://localhost:9000
REACT_APP_LOGIN_USERNAME=<your chosen username>
REACT_APP_LOGIN_PASSWORD=<your chosen password>
```

### 3. Start the backend
```bash
cd backend
npm start
```
Runs on `http://localhost:9000`, connects to MongoDB, and exposes the API routes.

### 4. Start the frontend
```bash
cd frontend
npm start
```
Runs on `http://localhost:3000`.

### 5. Feed it live data — pick one:

**Option A: Synthetic simulator (no hardware needed)**
```bash
cd scripts
pip3 install requests
python3 simulation.py
```

**Option B: Real IoT simulation via Wokwi**
1. Open the project at the link in `IoT/wokwi-project.txt`
2. In a separate terminal, expose your local backend:
   ```bash
   npx localtunnel --port 9000 --subdomain swift-park-navya
   ```
3. Press ▶ Start Simulation in Wokwi — this controls **Spot 1** live, driven by the simulated ultrasonic sensor's distance slider.

### 6. Log in
Navigate to `http://localhost:3000`, click **Enter the Experience**, then sign in with the credentials you set in `frontend/.env`.

---

## ☁️ Deployment

This project is deployed as two separate services:

- **Frontend (Vercel):** root directory set to `frontend`, environment variables (`REACT_APP_API_URL`, `REACT_APP_LOGIN_USERNAME`, `REACT_APP_LOGIN_PASSWORD`) configured in Vercel's dashboard, auto-deploys on push to `main`.
- **Backend (Render):** root directory set to `backend`, environment variables (`MONGO_URI`, `GEMINI_API_KEY`, `PORT`) configured in Render's dashboard, auto-deploys on push to `main`.
- **Database:** MongoDB Atlas (already cloud-hosted, no deployment needed).

**Note:** live occupancy data depends on `simulation.py` or the Wokwi/IoT bridge actively running and pointed at the deployed backend — these run locally, not in the cloud, so live data only updates while one of those is active.

---

## 📊 Features

- ✅ **Real-time occupancy tracking** via IoT sensor simulation with sub-5-second update latency
- ✅ **Live interactive map** with GPS-accurate zone clustering and turn-by-turn routing
- ✅ **K-Means clustering analytics** classifying parking behavior into 3 operational zones
- ✅ **Data visualization dashboard** — occupancy splits, turnover analysis, and spot distribution charts
- ✅ **AI-powered natural language Q&A** — ask questions like "which zone has open spots right now?" against a blend of historical and live analytics data, with animated chat history and preset question chips
- ✅ **Credential-gated access** with animated multi-stage login, persisted across page refresh
- ✅ **Rate-limited AI endpoint** to prevent quota abuse
- ✅ **Live public deployment** — fully hosted, no local setup required to view

---

## 🔒 Security Notes

- Database and AI API credentials are managed via `.env` files (local) or platform environment variables (deployed), excluded from version control via `.gitignore`
- MongoDB Atlas and Gemini API credentials are rotated periodically, and immediately upon any accidental exposure
- The `/api/ask-ai` endpoint is rate-limited (10 requests/minute/IP) to prevent abuse of the connected AI API quota
- Frontend login is a single shared-gate authentication model, appropriate for demo/portfolio purposes — not intended as a production multi-user auth system

---

## 👩‍💻 Author

**Navya Madaan**
Honours Bachelor of Computer Science (Data Analytics) — Sheridan College

---

## 📄 License

This project is for educational and portfolio purposes.
