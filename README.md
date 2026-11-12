# ⚓ ShipMS — Intelligent Marine Fleet Operations OS (v3.4)

A modern full-stack Maritime Fleet Operations & Intelligence platform with real-time AIS vessel telemetry, interactive 3D Holographic wireframe simulation, officer bridge authentication, live marine corridor tracking, and the Universal Design Controller (Floating Visual Editor).

---

## 🚀 Key Features

1. **🌐 Interactive 3D Hologram Vessel Simulation (`HologramViewer.jsx`)**
   - 360° perspective rotation (drag with mouse)
   - Real-time zoom (mouse wheel)
   - Dynamic scanning laser plane toggle
   - Color palettes: Matrix Cyan, Electric Violet, Emerald Sea, Solar Amber, and Diagnostic Rose
   - Real-time hull diagnostic HUD (length, beam, draft, power core, radar frequency)

2. **🧭 Live Fleet Tracking: Marine Corridor**
   - Arabian Sea maritime highway (Mumbai Port JNPT ➔ Dubai Jebel Ali)
   - Real-time animated vessel motion with pulsating radar waves and wake ripples
   - **Vessel Stop Behavior**: Selecting **Royal Voyager (Inactive)** immediately halts vessel motion at Mumbai Anchorage (Slipway 3) with a 0.0 kn speed indicator, diagnostic alert, and drydock refit warning.

3. **📊 6-Card Counter Metrics Strip**
   - Total Fleet (28 ships)
   - Active At Sea (21 ships / 75% capacity)
   - In Port / Loading (4 ships / 14h turnaround)
   - Inactive / Maint. (3 ships / Royal Voyager diagnostic)
   - Nautical Miles (1.42M annual total)
   - Safety Index (99.6% zero incident record)
   - Hover zoom & cybernetic glow effects across all cards!

4. **🔐 Officer Bridge Authentication (`AuthModal.jsx`)**
   - Full JWT and bcrypt password hashing
   - REST API endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`)
   - Pre-seeded admin user (`admin@shipms.io` / `password123`)
   - Automatic fallback to local session if backend server is offline

5. **✦ Universal Design Controller (Floating Visual Editor)**
   - Draggable `✦` star trigger button
   - Two-Click Swap: Swap positions of any two UI elements seamlessly
   - Point & Edit: Click any heading or paragraph to edit text in real time
   - Color Controller: Instant live updates for text, background, and borders
   - D-Pad Position Nudge: Shift elements up/down/left/right by 4px increments
   - Dimensions & Geometry: Font size, padding, and border-radius sliders
   - Undo / Redo / Reset / Save layout to browser local storage

6. **📱 Zero Screen Overlap Responsive Architecture**
   - Single horizontal navigation bar with brand, links, live counter, search, and auth actions
   - Multi-layer z-index management preventing overlay conflicts

---

## 📁 Project Architecture

```
ship FB/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # User registration, bridge login, JWT generation
│   │   └── fleetController.js    # Ships, metrics, and hologram endpoints
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT token verification
│   ├── models/
│   │   └── db.js                 # Embedded JSON database
│   ├── routes/
│   │   ├── auth.js               # /api/auth routes
│   │   └── fleet.js              # /api/fleet routes
│   ├── data/
│   │   └── db.json               # Seed data for users and fleet vessels
│   ├── .env.example
│   ├── server.js                 # Express server on port 5000
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── oceanic-explorer.jpg  # Vessel hero asset
│   │   └── favicon.svg           # Maritime anchor favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx     # Bridge login & registration modal
│   │   │   ├── HologramViewer.jsx# 3D canvas vessel simulation
│   │   │   └── VisualEditor.jsx  # Universal Design Controller (FVE)
│   │   ├── App.jsx               # Main Fleet OS Dashboard application
│   │   ├── index.css             # Tailwind v4 styles, glow effects & animations
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Quick Start Guide

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
The server will start at `http://localhost:5000` with endpoints:
- Health check: `http://localhost:5000/api/health`
- Fleet registry: `http://localhost:5000/api/fleet/ships`
- Metrics: `http://localhost:5000/api/fleet/metrics`
- Bridge Auth: `http://localhost:5000/api/auth/login`

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173` to access the ShipMS Bridge Dashboard.

---

## 👨‍💻 Default Credentials
- **Email:** `admin@shipms.io`
- **Password:** `password123`
- **Role:** Fleet Commander
