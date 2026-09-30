# Master Implementation Plan (Task Roadmap)
## LogiPulse Logistics & Fleet Management Platform

---

### Phase 0: Foundations, Governance & Design System
- [x] **0.1 Governance Documentation**: Create the 6 foundational files (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `task.md`, `memory.md`).
- [x] **0.2 Project Initialization**: Initialize Next.js 15+ App Router application with TypeScript, Tailwind CSS, and essential dependencies.
- [x] **0.3 Design System & Theme Engine**:
  - Configure Tailwind design tokens (HSL semantic colors, typography, radius, shadows, 8px spatial grid).
  - Implement Next-Themes provider with zero-flicker Dark/Light mode switching.
- [x] **0.4 Atomic Component Library**:
  - Implement headless base UI components (Button, Input, Dropdown, Modal/Dialog, Badge, Card, Tabs, Skeleton, Toast/Sonner).
  - Integrate Lucide React icons.
- [x] **0.5 Design System Preview Route**:
  - Construct `/design-system` living showcase displaying all tokens, typography, component states (default, hover, focus, disabled), and feedback states.
- [x] **0.6 Global Shell & Layout Structure**:
  - Build responsive Dashboard layout with collapsible Sidebar, Topbar, User profile menu, and live status pill.

---

### Phase 1: Authentication, RBAC & Core Persistence Layer
- [ ] **1.1 Database Setup & Prisma Schema**:
  - Initialize PostgreSQL + PostGIS connection and write Prisma schema (`User`, `DriverProfile`, `Vehicle`, `Shipment`, `Route`, `AuditLog`, etc.).
  - Run initial Prisma migrations.
- [ ] **1.2 High-Fidelity Seeder & Demo Mode**:
  - Create `prisma/seed.ts` with realistic fleet assets, drivers, active shipments, and geofences.
  - Implement client-side `Demo Mode` toggle flag (`NEXT_PUBLIC_DEMO_MODE`).
- [ ] **1.3 Authentication & Session Management**:
  - Configure NextAuth.js / JWT session provider with HTTP-only secure cookies.
  - Implement login view (`/login`) with client and server Zod validation.
- [ ] **1.4 Role-Based Access Control (RBAC)**:
  - Implement `withAuth` route guard and permission helper (`lib/rbac.ts`).
  - Restrict navigation and API endpoints based on user role (Admin, Dispatcher, Driver, Customer, Finance).
- [ ] **1.5 Immutable Audit Logging System**:
  - Implement central audit log utility (`lib/logger.ts`) capturing actions, entity changes, user IDs, and client IP.
  - Build Admin Audit Log viewer interface (`/audit-logs`).

---

### Phase 2: Fleet Assets, Drivers & Shipment Operations (CRUD)
- [ ] **2.1 Vehicle Registry & Asset Dossiers (`/fleet`)**:
  - Advanced data table for vehicles with multi-column sorting, filtering, and status badges.
  - Vehicle creation & edit drawer with VIN, specs, and document expiry fields.
  - Vehicle detail page (`/fleet/[id]`) with odometer history, assigned driver, and telemetry overview.
- [ ] **2.2 Driver Management & Scorecards (`/drivers`)**:
  - Driver roster view with CDL license tracking, medical cert expiry alerts, and HOS status.
  - Driver scorecard modal calculating on-time rates, harsh driving penalties, and safety ratings.
  - Emergency contact and wellbeing record viewer.
- [ ] **2.3 Shipment Management & Multi-Step Wizard (`/shipments`)**:
  - Advanced data table with search, status filters, date range, bulk selection, and CSV export.
  - Multi-step shipment booking wizard (`/shipments/new`) with origin/destination geocoding and cargo specs.
  - Shipment details view (`/shipments/[id]`) with live status timeline and stop list.
- [ ] **2.4 Kanban Dispatch Board (`/shipments/board`)**:
  - Interactive drag-and-drop board using `@dnd-kit` across statuses (`Unassigned`, `Dispatched`, `At Pickup`, `In Transit`, `Delivered`).
  - Instant vehicle/driver assignment modal upon dropping onto dispatched column.
- [ ] **2.5 UI Polish Pass (Phase 2 Review)**:
  - Add Framer Motion transitions (staggered list animations, card drop physics).
  - Verify all 4 view states (skeleton, empty, error, success) across fleet and shipment tables.
  - Responsive audit across 360px, 768px, 1280px, and 1920px widths.
  - Run Lighthouse accessibility audit (enforce &ge; 95).

---

### Phase 3: Real-Time Telemetry, Live Map & Route Planning
- [ ] **3.1 MapLibre WebGL Integration & Full Map View (`/map`)**:
  - Full-screen high-performance vector map canvas with dark/light map tiles.
  - Smooth coordinate interpolation between GPS telemetry pings.
  - Vehicle type SVG markers (truck, van, motorcycle) with dynamic status halos and heading rotation.
- [ ] **3.2 Real-Time WebSocket Streaming**:
  - Configure WebSocket / Socket.io server connection with live indicator (`Live` / `Reconnecting`).
  - Vehicle movement streaming simulation and dispatcher broadcast channel.
- [ ] **3.3 Geofencing Engine**:
  - Geofence creation tool (circular and polygon perimeter drawing).
  - Geofence entry/exit breach detection and push alert generation.
- [ ] **3.4 Multi-Stop Route Optimization & Planner (`/routes`)**:
  - Route planning interface with waypoint re-ordering via drag-and-drop.
  - TSP / VRP optimization algorithm computing shortest path, estimated travel time, and turn-by-turn polyline.
- [ ] **3.5 Historic Trip Playback Scrubber**:
  - Interactive bottom timeline slider allowing dispatchers to replay historic vehicle journeys with speed and stop overlays.
- [ ] **3.6 UI Polish Pass (Phase 3 Review)**:
  - Optimize WebGL map rendering (lazy loading, zero layout shift).
  - Verify keyboard shortcuts (`Ctrl+K` command palette, `M` for map, `S` for shipments).
  - Lighthouse performance & accessibility audit.

---

### Phase 4: Maintenance, Fuel, Billing & Mobile Driver PWA
- [ ] **4.1 Maintenance Scheduling & Work Orders (`/maintenance`)**:
  - Automated service reminder engine based on odometer intervals and calendar dates.
  - Work order management with parts cost, labor, technician notes, and invoice attachments.
  - Vehicle downtime and MTBF analytics.
- [ ] **4.2 Fuel & Expense Management (`/fuel-expenses`)**:
  - Digital fuel log entry with receipt photo upload and pump volume tracking.
  - Automated calculation of Cost per Kilometer ($/km) and fuel consumption anomalies.
- [ ] **4.3 Invoicing & Financial Billing (`/billing`)**:
  - Automated invoice generator upon shipment delivery verification.
  - Rate card rules engine (base fare, distance tier, fuel surcharge, waiting detention fees).
  - Invoices table with payment statuses (`Draft`, `Issued`, `Paid`, `Overdue`) and PDF generation.
- [ ] **4.4 Mobile-First Driver PWA (`/driver/*`)**:
  - PWA manifest and service worker configuration for offline capability.
  - Shift start/stop flow with mandatory vehicle safety inspection checklist.
  - Turn-by-turn stop list with one-tap status triggers (*"Arrived"*, *"Departed"*).
  - Electronic Proof of Delivery (e-POD): HTML5 signature pad + camera photo capture.
  - Driver wellbeing & fatigue check-in module with emergency helpline contacts.

---

### Phase 5: Analytics, Notification Center & Customer Tracking Portal
- [ ] **5.1 Executive Analytics Dashboards (`/analytics`)**:
  - Interactive Recharts visualizations (fleet utilization rate, OTIF on-time percentage, revenue per km, carbon emissions).
  - Date-range filter (Today, 7D, 30D, Custom) and historical comparison vs. previous period.
  - Exportable executive summary reports (CSV/PDF).
- [ ] **5.2 Notification Center & Multi-Channel Alerts**:
  - In-app notification center bell dropdown with categorized tabs and unread counters.
  - Email notification templates for delivery confirmation and invoice receipt.
  - Configurable alert rules (speeding, geofence exit, license expiring).
- [ ] **5.3 Public Customer Live Tracking Portal (`/track/[token]`)**:
  - Frictionless public URL for consignees with zero login requirement.
  - Live animated tracking map showing fuzzed driver position and destination pin.
  - Animated step-by-step delivery progress timeline with live dynamic ETA countdown.
  - Delivery instructions form and verified review submission modal.
- [ ] **5.4 UI Polish Pass (Phase 5 Review)**:
  - Motion refinement: KPI count-up animations, smooth chart tooltips.
  - Touch target audit for driver mobile views (&ge; 48px).
  - Lighthouse run across all dashboard and portal routes.

---

### Phase 6: Public Marketing Site & 20-Point Pre-Launch Checklist
- [ ] **6.1 Marketing Landing Page (`/`)**:
  - Modern hero section with animated typography, floating telemetry metrics, and primary CTAs above the fold.
  - Interactive live-tracking interactive product demo preview.
  - Feature showcase sections with scroll-triggered animations.
- [ ] **6.2 Complete 20-Item Pre-Launch Checklist Implementation**:
  - [ ] 1. Response-Time Promise: Displayed on quote and contact forms ("Within 15 minutes during operating hours").
  - [ ] 2. Favicon + Dynamic Tab Title on all pages.
  - [ ] 3. Real Reviews Section: Only displays verified customer reviews; shows elegant empty state when empty.
  - [ ] 4. Private Storage Bucket: Signed URLs (15-min TTL) for licenses, PODs, and invoices with RBAC checks.
  - [ ] 5. Unique Page Title configured per route.
  - [ ] 6. Comprehensive Privacy Policy page (`/privacy`).
  - [ ] 7. Primary CTAs ("Request Demo" / "Get Freight Quote") above the fold.
  - [ ] 8. Open Graph & Twitter Card meta tags for rich social link previews.
  - [ ] 9. AI Usage Disclosure badge & modal for route optimization and ETA prediction.
  - [ ] 10. GA4 Analytics with GDPR/CCPA cookie consent banner.
  - [ ] 11. Sticky Mobile CTA bar on marketing pages.
  - [ ] 12. 100% Responsive Design across 360px, 768px, 1280px, and 1920px viewports.
  - [ ] 13. Unique Meta Description for every public route.
  - [ ] 14. Logistics FAQ Section with 5 logistics-critical questions (pricing, tracking, coverage, claims, onboarding).
  - [ ] 15. Form Validation (client-side + server-side Zod) on all forms with actionable error messages.
  - [ ] 16. Thank-You Confirmation Page (`/thank-you`) with next steps and reference numbers.
  - [ ] 17. Telemetry & Driver Data Disclosure explaining collection purpose and retention schedule.
  - [ ] 18. Accessible Alt Text on all meaningful imagery; decorative graphics marked `aria-hidden`.
  - [ ] 19. Loading Skeletons on all asynchronous views (dashboards, tables, maps).
  - [ ] 20. Self-Harm / Crisis Response logic in support assistant + Driver fatigue wellbeing module.

---

### Phase 7: Quality Assurance, Security Audit & Deployment
- [ ] **7.1 Automated Testing**:
  - Unit tests for core algorithms (geofencing, ETA calculation, TSP route heuristic).
  - Component integration tests with React Testing Library.
  - End-to-end critical flow tests (Login &rarr; Create Shipment &rarr; Assign Driver &rarr; e-POD).
- [ ] **7.2 Security Review & Penetration Checklist**:
  - OWASP Top 10 validation: injection prevention, CSRF tokens, rate limit tests, signed URL tamper tests.
  - Audit log completeness check.
- [ ] **7.3 Performance Optimization & Lighthouse Verification**:
  - Confirm Lighthouse scores: Performance &ge; 90, Accessibility &ge; 95, Best Practices &ge; 95, SEO &ge; 95.
  - CI/CD build scripts and deployment runbook.
