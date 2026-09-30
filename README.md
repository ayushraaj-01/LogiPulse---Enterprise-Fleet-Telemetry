<div align="center">

# ⚡ LogiPulse
### Enterprise Fleet Telemetry & Smart Dispatch Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

<p align="center">
  A state-of-the-art, full-stack logistics management platform featuring real-time GPS telemetry, multi-stop TSP route optimization, bilingual internationalization (English & Hindi), role-based access control (RBAC), and 24/7 AI-powered customer support.
</p>

[Key Features](#-key-features) • [Design System](#-design-system--aesthetics) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Role Personas](#-role-personas--demo-access) • [API Reference](#-api-endpoints)

---

</div>

## 🌟 Key Features

### 📍 Real-Time GPS Telemetry & Geospatial Mapping
- **Interactive Multi-Engine Maps**: Switch seamlessly between **Google Maps Streets**, **OpenStreetMap**, and **Satellite Imagery**.
- **Live Fleet Tracking**: Real-time vehicle location streaming powered by WebSocket (`Socket.io`) with moving markers, heading orientation, and speed metrics.
- **Geofencing & Corridor Monitoring**: Automated geofence boundary rings for primary hubs (Seattle Harbor Depot, Redmond Logistics Hub, Tacoma Cargo Port).
- **Consignment Path Preview**: Visual polyline route corridors with origin and destination waypoints.
- **Zero-Crash Resilience**: Guarded against Leaflet container re-initialization and responsive resize auto-invalidation.

### 🧠 Smart TSP Route Optimization
- **Automated Waypoint Sequencing**: Heuristic Travelling Salesperson Problem (TSP) algorithm that re-orders deliveries for shortest distance and minimum fuel burn.
- **Route Analytics**: Real-time distance, estimated duration calculation, and automated delivery schedule generation.

### 👥 5 Tailored Role Personas (RBAC)
- **Administrator**: Comprehensive command center with KPI telemetry, compliance audits, financial oversight, and system security.
- **Dispatcher**: Drag-and-drop dispatch board, real-time driver allocation, and active consignment queue management.
- **Driver**: Mobile-first in-cab driver console / PWA view, GPS simulation pinging, status transitions, and electronic proof of delivery (EPOD).
- **Customer / Consignee**: Public self-service tracking portal (`/track/:trackingNumber`), live milestone progress, and instant delivery booking.
- **Finance**: Freight billing ledger, automated invoicing, revenue per kilometer metrics, and fuel expense monitoring.

### 🌐 Bilingual Internationalization (i18n)
- **Instant Language Switching**: Full English and Hindi (`EN` / `हिंदी`) support with immediate UI translation across all dashboards, tables, role badges, and chatbots.

### 🤖 24/7 AI Customer Support Chatbot (PulseBot)
- **Autonomous Assistant**: Instant tracking number lookups, delivery ETA checking, claim submissions, and security OTP verification.
- **Floating Widget**: Smooth animations, unread badge alerts, and floating HUD overlay.

---

## 🎨 Design System & Aesthetics

| Section | Color Palette | Highlights |
| :--- | :--- | :--- |
| **Login Portal** | **Whole Sky Blue & Crisp White** | Left half: Whole vibrant Sky Blue (`#2F80ED`) with white technical grid, white brand logo, and telemetry cards.<br>Right half: Crisp white/cream canvas (`#FAF9F5`), dark slate text, Sky Blue buttons (`.btn-blue`), zero distraction. |
| **Inside Website** | **Fleet Golden Yellow & Deep Slate** | Canvas: Warm luxury ivory (`#FAF8F0`).<br>Primary Accent: Vibrant Fleet Golden Yellow (`#FBBC04` / `#F59E0B`).<br>High-contrast dark slate text (`#0F172A`) for maximum readability.<br>Buttons: Golden Yellow pills (`.btn-devfest`) with warm amber glow. |
| **Dark Mode** | **Midnight Nocturnal Obsidian** | Deep midnight navy canvas (`#090E17`) with dark slate cards (`#0E1626`) and luminous electric yellow (`#FACC15`) highlights. |
| **Maps** | **Full-Color High-Contrast** | Maps stay permanently in bright, high-contrast, full-color mode (Google Streets, OSM, Satellite) for maximum geospatial clarity. |

---

## 🛠 Tech Stack

### Frontend (`/client`)
- **Core**: React 18.3, React Router DOM 6.28, Vite 6.0
- **Styling**: Tailwind CSS 3.4, PostCSS, Custom Vanilla CSS Design System
- **Mapping**: Leaflet 1.9.4, Google Maps Tile Engine, OpenStreetMap, Esri Satellite
- **Networking & Real-Time**: Axios, Socket.io-client 4.8.1
- **Icons**: Lucide React

### Backend (`/server`)
- **Runtime**: Node.js 18+, Express 4.19
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.io Server (WebSocket with telemetry simulation loop)
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, CORS, Express rate limiting

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (local daemon or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ayushraaj-01/LogiPulse---Enterprise-Fleet-Telemetry.git
cd LogiPulse---Enterprise-Fleet-Telemetry
```

---

### Step 2: Set Up & Start Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5050
MONGO_URI=mongodb://localhost:27017/logipulse
JWT_SECRET=logipulse_super_secure_jwt_secret_key_2026
JWT_EXPIRE=30d
NODE_ENV=development
```

*(Optional) Seed the database with sample Pacific Northwest fleet data:*
```bash
node seed/seedData.js
```

Start the backend API & WebSocket server:
```bash
npm run dev
```
> Server runs on **`http://localhost:5050`**

---

### Step 3: Set Up & Start Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
> Client runs on **`http://localhost:3000`**

Open **`http://localhost:3000`** in your browser to access the application.

---

## 🔑 Role Personas & Demo Access

The login page features a **1-Click Demo Role Switcher** to test all 5 authorization tiers instantly without typing credentials:

| Role | Demo Email | Password | Access Clearance |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@logipulse.com` | `password123` | Full access across all 12 modules, financial ledger, and audit trails |
| **Dispatcher** | `dispatcher@logipulse.com` | `password123` | Dispatch Board, Shipments, Fleet Telemetry, Drivers, Routes |
| **Driver** | `driver@logipulse.com` | `password123` | Mobile Driver In-Cab Console, Active Route GPS, EPOD Sign-off |
| **Customer** | `customer@logipulse.com` | `password123` | Consignment Tracking, Live ETA, Book Delivery, AI Support |
| **Finance** | `finance@logipulse.com` | `password123` | Freight Invoices, Revenue Analytics, Fuel Auditing |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user and receive JWT
- `POST /api/auth/register` — Register new organization user
- `GET /api/auth/me` — Retrieve current authenticated session
- `POST /api/auth/quick-login` — 1-Click demo authentication by role

### Fleet Vehicles (`/api/vehicles`)
- `GET /api/vehicles` — Query fleet assets with status, type, and keyword search
- `GET /api/vehicles/:id` — Retrieve single vehicle dossier with live GPS coordinates
- `POST /api/vehicles` — Register a new commercial fleet vehicle
- `PATCH /api/vehicles/:id/location` — Update vehicle GPS latitude, longitude, speed, and heading

### Consignments & Shipments (`/api/shipments`)
- `GET /api/shipments` — Retrieve shipments list with status/priority filters
- `GET /api/shipments/:id` — Fetch shipment dossier and milestone timeline
- `POST /api/shipments` — Book a new freight delivery consignment
- `PATCH /api/shipments/:id/status` — Advance shipment lifecycle status

### Drivers & Compliance (`/api/drivers`)
- `GET /api/drivers` — Query certified commercial drivers and duty hours
- `GET /api/drivers/:id` — Retrieve driver profile, CDL expiry, and rating

### Financials & Operations
- `GET /api/billing` — Freight invoices and transaction records
- `GET /api/fuel` — Commercial fuel logs and consumption telemetry
- `GET /api/analytics/overview` — Operational KPIs (OTIF rate, fleet utilization, revenue)
- `GET /api/audit-logs` — Immutable system audit trails
- `POST /api/chatbot` — Query PulseBot AI customer assistant

---

## ⚡ WebSocket Telemetry Events

The server broadcasts live fleet updates at `ws://localhost:5050` (or proxied via Vite at `/socket.io`):

| Event | Direction | Description |
| :--- | :--- | :--- |
| `REQUEST_FLEET_SYNC` | Client ➔ Server | Requests immediate snapshot of all active vehicles |
| `FLEET_TELEMETRY_UPDATE` | Server ➔ Client | Broadcasts real-time coordinate updates every 4 seconds |
| `DRIVER_GPS_PING` | Client ➔ Server | In-cab mobile GPS ping from active driver device |
| `VEHICLE_POSITION_CHANGED` | Server ➔ Client | Emitted when a specific vehicle changes location or status |

---

## 📂 Project Structure

```
LogiPulse/
├── client/                     # Frontend Vite + React SPA
│   ├── public/                 # Static assets & favicon.svg
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── RealMap.jsx     # Leaflet map engine (Google, OSM, Satellite)
│   │   │   ├── Navbar.jsx      # Top navigation with role & language toggles
│   │   │   ├── Sidebar.jsx     # Role-aware navigation sidebar
│   │   │   ├── CustomerChatbot.jsx # 24/7 AI support widget
│   │   │   ├── LogiPulseLogo.jsx # Brand logo component
│   │   │   └── ...
│   │   ├── context/            # Global React Contexts
│   │   │   ├── AuthContext.jsx # Authentication state & role login
│   │   │   ├── ThemeContext.jsx# Light & dark mode provider
│   │   │   └── LanguageContext.jsx # English / Hindi i18n
│   │   ├── pages/              # View pages (Overview, LiveMap, Login, etc.)
│   │   ├── services/           # Axios API service client
│   │   ├── utils/              # Translations & RBAC permissions
│   │   ├── index.css           # Global design tokens and utilities
│   │   └── App.jsx             # Main routing shell & RoleGuards
│   ├── index.html              # HTML entry with anti-flash script
│   └── vite.config.js          # Vite configuration with API proxy
│
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # MongoDB database connection
│   ├── middleware/             # JWT auth & RBAC route protection
│   ├── models/                 # Mongoose schemas (Vehicle, Shipment, User, etc.)
│   ├── routes/                 # REST API endpoints
│   ├── seed/                   # Database seed scripts
│   └── server.js               # Express application & Socket.io server
│
├── docs/                       # Project documentation & PRD
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>LogiPulse</b> &bull; Built with ❤️ for modern enterprise freight logistics.
</div>
