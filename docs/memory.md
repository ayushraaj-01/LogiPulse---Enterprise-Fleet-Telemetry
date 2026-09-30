# Project Memory Ledger & Context Retention
## LogiPulse Logistics & Fleet Management Platform

---

### 1. Project Overview & Identity
- **Project Name**: LogiPulse
- **Tagline**: Enterprise-grade Real-Time Logistics & Fleet Management Platform
- **Repository Root**: `d:/hcl proj`
- **Current Status**: **Phase 0 in Progress** (Foundational Governance & File-Driven Setup)
- **Primary Tech Stack**: Next.js 15+ (App Router, TypeScript), Tailwind CSS, shadcn/ui (Radix Primitives), Lucide React, Framer Motion, TanStack Table & Query, MapLibre GL / Mapbox, PostgreSQL + PostGIS, Prisma ORM, Redis (BullMQ), S3-compatible private storage.

---

### 2. Architectural Decisions Log (ADR)

| Decision ID | Date | Decision Summary | Rationale & Context |
| :--- | :--- | :--- | :--- |
| **ADR-001** | 2026-09-29 | **Full-Stack Next.js 15+ App Router** | Unified development model, high-performance Server Components (RSC) to reduce client JS bundle, built-in edge optimizations, and type-safe Route Handlers. |
| **ADR-002** | 2026-09-29 | **PostgreSQL + PostGIS for Geospatial Queries** | Enables native in-database spatial operations (`ST_Contains`, `ST_DWithin`) for geofence breaches, coordinate proximity, and route polyline handling. |
| **ADR-003** | 2026-09-29 | **MapLibre GL JS with Vector Tiles** | Zero proprietary lock-in, high-performance WebGL rendering for hundreds of simultaneous moving vehicles, smooth coordinate interpolation, and dark/light map styling. |
| **ADR-004** | 2026-09-29 | **Private S3 Bucket with 15-Minute Signed URLs** | Sensitive compliance files (driver licenses, POD signatures, fuel receipts, tax invoices) must never be publicly accessible. All access requires RBAC validation and short-lived signed URLs. |
| **ADR-005** | 2026-09-29 | **Strict Anti-Fabrication & Demo Mode Toggle** | Zero fake metrics or fake customer reviews. Testimonials render real submissions or an elegant empty state. Demo data is clearly segregated behind an explicit `Demo Mode` banner. |
| **ADR-006** | 2026-09-29 | **PWA for Mobile Driver Operations** | Drivers require offline resilience, fast touch targets (&ge; 48px), camera capture for POD, and hardware-accelerated signature capture without native app store friction. |
| **ADR-007** | 2026-09-29 | **MERN Stack Architecture Rebuild** | Migrated stack to MongoDB + Express.js + React (Vite) + Node.js as requested. Real local MongoDB v8.2+ database, full Express REST API & Socket.io telemetry, rich multi-user login portal with 1-click role switcher, and uncompressed production-grade feature completeness. |

---

### 3. Pre-Launch Checklist Tracking (20 Points)

| # | Requirement | Implementation Status | Notes |
| :---: | :--- | :---: | :--- |
| 1 | Response-time promise on quote/contact forms | Planned (Phase 6) | "Response within 15 minutes during operating hours" |
| 2 | Favicon + tab title on every page | Planned (Phase 0/6) | Dynamic route titles + SVG favicon |
| 3 | Real reviews only (empty state until real) | Planned (Phase 6) | Zero fake testimonials |
| 4 | Private storage bucket + 15-min signed URLs | Planned (Phase 1/4) | S3 client with role verification |
| 5 | Unique page title per page/route | Planned (Phase 0-6) | Next.js Metadata API per layout/page |
| 6 | Privacy Policy page (`/privacy`) | Planned (Phase 6) | Full legal disclosure |
| 7 | Primary CTA above the fold | Planned (Phase 6) | "Request Quote" & "Book Demo" |
| 8 | Open Graph & Twitter card tags | Planned (Phase 6) | Dynamic social sharing preview |
| 9 | AI usage disclosure | Planned (Phase 3/6) | Badge on route optimization & ETA |
| 10 | Google Analytics (GA4) + cookie consent | Planned (Phase 6) | Environment variable + consent gate |
| 11 | Sticky mobile CTA | Planned (Phase 6) | Bottom floating bar on marketing view |
| 12 | Fully responsive (360, 768, 1280, 1920) | Planned (Phases 0-6)| Enforced across all components |
| 13 | Unique meta description per page | Planned (Phase 6) | 150-160 characters search-optimized |
| 14 | 5 Logistics-critical FAQs | Planned (Phase 6) | Pricing, Tracking, Coverage, Claims, Onboarding |
| 15 | Form validation (client + server Zod) | Planned (Phases 1-6)| Strict error feedback on all inputs |
| 16 | Thank-you confirmation page/state | Planned (Phase 6) | `/thank-you` route with reference ID |
| 17 | Telemetry & driver data disclosure | Planned (Phase 6) | GPS collection & retention policy |
| 18 | Accessible Alt text on all images | Planned (Phases 0-6)| Strictly enforced, decorative `aria-hidden` |
| 19 | Loading skeletons on all async views | Planned (Phases 0-5)| Shimmer placeholders matching content layout |
| 20 | Crisis response AI + Driver wellbeing note | Planned (Phase 4/6) | 988 lifeline surfacing + driver fatigue check |

---

### 4. Session History & Log
- **2026-09-29 (Session 1 - MERN Stack Architecture Rebuild & Multi-User Authentication)**:
  - Rebuilt the entire platform as a full-scale **MERN Stack** (MongoDB + Express + React + Node.js) application based on user request.
  - Initialized Express backend with Mongoose models (`User`, `Vehicle`, `Driver`, `Shipment`, `Maintenance`, `FuelLog`, `Invoice`, `AuditLog`) connected directly to local MongoDB (v8.2+).
  - Seeded database with realistic fleet assets, shipments, maintenance, fuel logs, and pre-configured accounts for all 5 roles:
    1. **Admin** (`admin@logipulse.com` / `password123`)
    2. **Dispatcher** (`dispatcher@logipulse.com` / `password123`)
    3. **Driver** (`driver@logipulse.com` / `password123`)
    4. **Customer** (`customer@logipulse.com` / `password123`)
    5. **Finance** (`finance@logipulse.com` / `password123`)
  - Integrated Socket.io for live real-time vehicle coordinate telemetry streaming (moving map markers, heading angles, speed).
  - Built a stunning high-converting Login Portal (`/login`) featuring:
    - **Instant 1-Click Role Switcher**: Tap any of the 5 roles to log in immediately without manual typing!
    - Full credentials form (Show/Hide password, email input)
    - Full Registration form with role selection dropdown
    - Security certification badges & live telemetry metrics
  - Built full-featured React (Vite + Tailwind + Lucide) client with complete enterprise modules:
    - `/overview`: Fleet Command Center with live KPI metrics
    - `/map`: Interactive live vector map with Socket.io real-time animated vehicle markers, heading rotation, and telemetry dossier drawer
    - `/shipments`: Shipment lifecycle management & modal booking wizard
    - `/dispatch-board`: Kanban dispatch board with pipeline status advancement
    - `/fleet`: Vehicle asset registry & document expiration watcher
    - `/drivers`: Driver roster, CDL licenses, hours of service (HOS), and safety scorecards
    - `/routes`: Multi-stop route planner & TSP optimizer
    - `/maintenance`: Preventative/corrective service work orders
    - `/fuel-expenses`: Fuel logs and cost per km monitoring
    - `/billing`: Invoicing console with payment status tracking
    - `/analytics`: Operational intelligence charts
    - `/audit-logs`: Immutable system audit trail from MongoDB
    - `/driver-portal`: Dedicated mobile-first in-cab driver PWA with pre-trip checklist, turn-by-turn manifest, HTML5 canvas signature pad, and driver fatigue/wellbeing crisis helpline note (Checklist Item 20)
    - `/track/:trackingNumber`: Public unauthenticated live tracking portal with dynamic countdown ETA and verified feedback form
  - Verified backend active on `http://localhost:5050` and Vite client active on `http://localhost:3001`.

---

### 5. Active Endpoints & Ports
- **Frontend Web Application**: `http://localhost:3001`
- **Backend API & WebSockets**: `http://localhost:5050`
- **MongoDB Connection**: `mongodb://127.0.0.1:27017/logipulse`
