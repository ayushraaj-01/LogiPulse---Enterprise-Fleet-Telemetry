# System Architecture Document
## LogiPulse Logistics & Fleet Management Platform

---

### 1. Technology Stack & Architectural Justifications (MERN Stack Rebuild)

| Layer | Chosen Technology | Justification & Architectural Rationale |
| :--- | :--- | :--- |
| **Database** | **MongoDB (v8.2+) + Mongoose** | Native document-oriented database with flexible schema design ideal for telemetry logs, dynamic shipment metadata, and audit records. Indexed geospatial queries (`2dsphere`) for geofencing and vehicle coordinate radius searches. |
| **Backend / API Server** | **Express.js + Node.js (v25+)** | High-performance, unopinionated asynchronous REST API server. Modular route architecture, JWT session handling, role-based authorization middleware, and automated seed pipeline. |
| **Real-Time Layer** | **Socket.io / WebSockets** | Real-time bi-directional streaming of high-frequency GPS telemetry pings, vehicle status updates, and live dispatch events. |
| **Frontend Framework** | **React (Vite, TypeScript/ES6+)** | Ultra-fast HMR, modular component architecture, dynamic client-side routing, and responsive layouts. |
| **Styling & Design System** | **Tailwind CSS + Custom CSS Variables** | Curated HSL color palette (Fleet Cobalt, Active Cyan, emerald success, amber warning, crimson alert), 8px spatial grid, and seamless Dark/Light mode theme switching. |
| **Icons & Visuals** | **Lucide React** | Cohesive vector iconography across logistics modules (truck, route, fuel, wrench, pin, package, etc.). |
| **State & Authentication** | **React Context API + JWT Tokens** | Context-driven global auth provider with instant 1-click role switching between all 5 personas (Admin, Dispatcher, Driver, Customer, Finance). |

---

### 2. High-Level System Architecture Diagram (Mermaid)

```mermaid
graph TD
    subgraph Clients["Client Layer"]
        A1["Admin / Dispatcher Web App<br/>(Desktop Browser)"]
        A2["Mobile Driver PWA<br/>(Smartphone / Tablet)"]
        A3["Customer Tracking Portal<br/>(Public Web)"]
    end

    subgraph CDN["Edge & Gateway Layer"]
        B1["Reverse Proxy / CDN<br/>(Next.js Edge / Cloudflare)"]
    end

    subgraph AppServer["Application Layer (Next.js App Router)"]
        C1["Server Components (RSC)<br/>Static & Dynamic Pages"]
        C2["Route Handlers (REST API)<br/>/api/v1/*"]
        C3["Auth Middleware & RBAC Guard<br/>NextAuth / JWT Session"]
    end

    subgraph RealTime["Real-Time Streaming Layer"]
        D1["WebSocket Server / Gateway<br/>(Live GPS Ingest & Fanout)"]
    end

    subgraph DataStore["Data & Persistence Layer"]
        E1[("PostgreSQL + PostGIS<br/>Primary Relational & Spatial DB")]
        E2[("Redis Store<br/>Telemetry Cache & Pub/Sub")]
        E3["Private S3 Bucket<br/>Documents, PODs, Invoices"]
    end

    subgraph Workers["Background Workers (BullMQ)"]
        F1["Geofence & Alert Worker"]
        F2["Maintenance & Expiry Cron"]
        F3["Invoice & Report Generator"]
        F4["Email / SMS Notification Queue"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> C1
    B1 --> C2
    C2 --> C3
    C3 --> E1
    C2 --> E2
    C2 --> E3

    A2 -- "GPS Pings" --> D1
    D1 -- "Publish Telemetry" --> E2
    E2 -- "Broadcast Movement" --> D1
    D1 -- "Live Stream" --> A1
    D1 -- "Public ETA Stream" --> A3

    E2 --> F1
    F1 --> E1
    F2 --> E1
    F3 --> E3
    F4 --> Clients
```

---

### 3. Folder & Directory Structure

```plaintext
d:/hcl proj/
├── .agents/                        # Local customizations, rules, and skills
├── .env.example                    # Template for environment variables
├── .eslintrc.json                  # ESLint code quality configuration
├── .prettierrc                     # Prettier formatting standards
├── next.config.ts                  # Next.js configuration (PWA, images, headers)
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # Strict TypeScript compiler options
├── tailwind.config.ts              # Tailwind design tokens and theme extensions
├── postcss.config.mjs              # PostCSS plugins
│
├── prisma/
│   ├── schema.prisma               # Prisma relational and spatial schema
│   ├── seed.ts                     # Demo mode seeder with realistic test data
│   └── migrations/                 # PostgreSQL migration history
│
├── public/
│   ├── favicon.ico                 # Favicon assets
│   ├── manifest.json               # PWA web app manifest for Driver App
│   ├── icons/                      # PWA icons (192x192, 512x512)
│   ├── illustrations/              # Custom SVGs for empty states, 404, hero
│   └── vehicles/                   # Vector vehicle markers (truck, van, bike)
│
├── src/
│   ├── app/                        # Next.js App Router root
│   │   ├── (auth)/                 # Authentication routes (login, forgot-pass)
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/            # Public marketing & conversion pages
│   │   │   ├── page.tsx            # High-conversion Landing page
│   │   │   ├── pricing/page.tsx    # Pricing plans
│   │   │   ├── privacy/page.tsx    # Privacy policy & data disclosures
│   │   │   ├── track/[token]/page.tsx # Public Customer Live Tracking
│   │   │   └── thank-you/page.tsx  # Post-submission confirmation state
│   │   ├── (dashboard)/            # Authenticated internal platform
│   │   │   ├── layout.tsx          # Global Shell (Sidebar, Topbar, Nav)
│   │   │   ├── overview/page.tsx   # Fleet Command Overview
│   │   │   ├── map/page.tsx        # Full-Screen Live Tracking Map
│   │   │   ├── shipments/          # Shipment management & Kanban board
│   │   │   │   ├── page.tsx        # Advanced Data Table view
│   │   │   │   ├── board/page.tsx  # Kanban Dispatch Board
│   │   │   │   ├── new/page.tsx    # Multi-step Shipment Creation Wizard
│   │   │   │   └── [id]/page.tsx   # Shipment Detail & POD Viewer
│   │   │   ├── fleet/              # Vehicle Registry & Asset Dossiers
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── drivers/            # Driver management & scorecards
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── routes/             # Route Planning & TSP Optimizer
│   │   │   │   └── page.tsx
│   │   │   ├── maintenance/        # Service records & scheduling
│   │   │   │   └── page.tsx
│   │   │   ├── fuel-expenses/      # Fuel logs & cost per km
│   │   │   │   └── page.tsx
│   │   │   ├── billing/            # Invoices, Rate Cards & Payments
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/          # Deep-dive analytics dashboards
│   │   │   │   └── page.tsx
│   │   │   ├── audit-logs/         # Immutable system audit trail
│   │   │   │   └── page.tsx
│   │   │   └── settings/           # Organization & personal settings
│   │   │       └── page.tsx
│   │   ├── driver/                 # Mobile PWA Driver Portal
│   │   │   ├── layout.tsx          # Mobile container & offline banner
│   │   │   ├── shift/page.tsx      # Shift clock-in & inspection checklist
│   │   │   ├── stops/page.tsx      # Active route turn-by-turn stop list
│   │   │   ├── stops/[id]/page.tsx # Stop details & e-POD capture pad
│   │   │   └── wellbeing/page.tsx  # Fatigue support & helpline resources
│   │   ├── design-system/          # Living Design System & Token Showcase
│   │   │   └── page.tsx
│   │   └── api/                    # REST API Route Handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── v1/
│   │       │   ├── telemetry/route.ts       # High-frequency GPS ping ingest
│   │       │   ├── shipments/route.ts       # Shipment CRUD & bulk actions
│   │       │   ├── vehicles/route.ts        # Fleet registry endpoints
│   │       │   ├── drivers/route.ts         # Driver management endpoints
│   │       │   ├── routes/optimize/route.ts # VRP Route Optimizer
│   │       │   ├── maintenance/route.ts     # Maintenance work orders
│   │       │   ├── fuel/route.ts            # Fuel logs & expense items
│   │       │   ├── billing/route.ts         # Invoices & rate cards
│   │       │   ├── storage/signed-url/route.ts # S3 pre-signed URL generator
│   │       │   └── audit-logs/route.ts      # Audit log retrieval
│   │
│   ├── components/                 # Reusable UI component library
│   │   ├── ui/                     # Primitives (Button, Dialog, Dropdown, Input, etc.)
│   │   ├── layout/                 # Sidebar, Topbar, UserMenu, NotificationBell
│   │   ├── map/                    # MapCanvas, VehicleMarker, PolylineLayer, GeofenceLayer, TripScrubber
│   │   ├── dispatch/               # KanbanBoard, ShipmentCard, AssignmentModal
│   │   ├── tables/                 # DataTable, ColumnToggle, FilterToolbar, ExportButton
│   │   ├── driver/                 # SignaturePad, CameraCapture, OfflineIndicator
│   │   ├── command/                # CommandPalette (Ctrl+K modal)
│   │   ├── feedback/               # LoadingSkeleton, EmptyState, ErrorBoundary
│   │   └── marketing/              # HeroSection, LiveTrackingDemo, FAQAccordion, Testimonials
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-socket.ts           # WebSocket connection & reconnect manager
│   │   ├── use-vehicle-telemetry.ts# Live interpolated vehicle coordinates
│   │   ├── use-offline-sync.ts     # IndexedDB local cache & sync queue
│   │   ├── use-keyboard-shortcuts.ts# Global hotkey listener (? for help, Ctrl+K)
│   │   └── use-debounce.ts
│   │
│   ├── lib/                        # Core utilities and shared singletons
│   │   ├── db.ts                   # Prisma Client singleton
│   │   ├── redis.ts                # Redis client instance
│   │   ├── socket-server.ts        # WebSocket broadcasting logic
│   │   ├── s3.ts                   # S3 client & pre-signed URL utility
│   │   ├── rbac.ts                 # Role-based permissions matrix & guards
│   │   ├── geo.ts                  # Haversine, bearing, and polyline decoders
│   │   ├── logger.ts               # Structured logger with audit logging hook
│   │   ├── validations.ts          # Zod schemas for all forms & API payloads
│   │   └── demo-data.ts            # High-fidelity demo data for Demo Mode toggle
│   │
│   ├── types/                      # Global TypeScript declarations & DTOs
│   │   ├── telemetry.d.ts
│   │   ├── shipment.d.ts
│   │   ├── fleet.d.ts
│   │   └── api.d.ts
│   │
│   └── styles/
│       └── globals.css             # Tailwind base, CSS variables, typography
```

---

### 4. Database Schema & Entity Relationship Diagram (ERD in Text)

```plaintext
================================================================================
                               DATABASE SCHEMA (ERD)
================================================================================

[User]
  id: String (UUID, PK)
  email: String (Unique)
  passwordHash: String
  fullName: String
  phone: String?
  role: Enum (ADMIN, DISPATCHER, DRIVER, CUSTOMER, FINANCE)
  isActive: Boolean (Default: true)
  createdAt: DateTime
  updatedAt: DateTime
       |
       | 1:1 (Optional)
       v
[DriverProfile]
  id: String (UUID, PK)
  userId: String (FK -> User.id, Unique)
  licenseNumber: String (Unique)
  licenseExpiry: DateTime
  medicalCertExpiry: DateTime
  status: Enum (OFF_DUTY, ON_DUTY, DRIVING, RESTING)
  currentVehicleId: String? (FK -> Vehicle.id)
  safetyScore: Float (Default: 100.0)
  totalDeliveries: Int (Default: 0)
  emergencyContact: String?

[Vehicle]
  id: String (UUID, PK)
  vin: String (Unique)
  licensePlate: String (Unique)
  make: String
  model: String
  year: Int
  type: Enum (HEAVY_TRUCK, BOX_TRUCK, CARGO_VAN, MOTORCYCLE)
  fuelType: Enum (DIESEL, PETROL, ELECTRIC, HYBRID)
  payloadCapacityKg: Float
  volumeCapacityCbm: Float
  currentOdometerKm: Float
  status: Enum (ACTIVE, MAINTENANCE, IDLE, OUT_OF_SERVICE)
  insuranceExpiry: DateTime
  permitExpiry: DateTime
  lastLatitude: Float?
  lastLongitude: Float?
  lastHeading: Float?
  lastSpeedKmh: Float?
  lastPingAt: DateTime?

[Shipment]
  id: String (UUID, PK)
  trackingNumber: String (Unique)  -- e.g. "TRK-2026-98124"
  customerId: String (FK -> User.id)
  assignedDriverId: String? (FK -> DriverProfile.id)
  assignedVehicleId: String? (FK -> Vehicle.id)
  status: Enum (DRAFT, UNASSIGNED, DISPATCHED, AT_PICKUP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, CANCELLED)
  priority: Enum (STANDARD, EXPRESS, CRITICAL)
  originAddress: String
  originLat: Float
  originLng: Float
  destinationAddress: String
  destinationLat: Float
  destinationLng: Float
  estimatedDistanceKm: Float?
  estimatedDurationMin: Float?
  scheduledPickupAt: DateTime
  scheduledDeliveryAt: DateTime
  actualDeliveredAt: DateTime?
  totalWeightKg: Float
  totalVolumeCbm: Float
  declaredValue: Decimal
  notes: String?
  createdAt: DateTime
  updatedAt: DateTime
       |
       | 1:N
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
[ShipmentStop]          [ProofOfDelivery]       [InvoiceItem]
  id: UUID (PK)           id: UUID (PK)           id: UUID (PK)
  shipmentId: FK          shipmentId: FK (Unique) invoiceId: FK
  stopNumber: Int         recipientName: String   description: String
  type: PICKUP/DROPOFF    recipientSignatureUrl:S3 unitPrice: Decimal
  address: String         photoUrl: String (S3)   quantity: Int
  lat: Float, lng: Float  verifiedOtp: Boolean    total: Decimal
  status: PENDING/DONE    signedAt: DateTime
  arrivedAt: DateTime?    signedLocationLat: Float
  departedAt: DateTime?   signedLocationLng: Float

[Route]
  id: String (UUID, PK)
  name: String
  driverId: String (FK -> DriverProfile.id)
  vehicleId: String (FK -> Vehicle.id)
  date: DateTime
  status: Enum (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
  totalDistanceKm: Float
  estimatedTimeMin: Float
  encodedPolyline: Text  -- Encoded Google/OSRM Polyline
  createdAt: DateTime

[Geofence]
  id: String (UUID, PK)
  name: String
  type: Enum (DEPOT, CUSTOMER_SITE, RESTRICTED_ZONE)
  geometryType: Enum (CIRCLE, POLYGON)
  coordinates: Json  -- Array of [lat, lng] or {center, radiusMeters}
  colorHex: String
  speedLimitKmh: Float?
  createdAt: DateTime

[TelemetryPing]
  id: BigInt (Auto-increment, PK)
  vehicleId: String (FK -> Vehicle.id)
  latitude: Float
  longitude: Float
  speedKmh: Float
  headingDeg: Float
  altitudeMeters: Float?
  odometerKm: Float
  engineOn: Boolean
  fuelLevelPercent: Float?
  timestamp: DateTime (Indexed)

[MaintenanceRecord]
  id: String (UUID, PK)
  vehicleId: String (FK -> Vehicle.id)
  type: Enum (PREVENTIVE, CORRECTIVE, INSPECTION, EMERGENCY)
  title: String
  description: String
  serviceDate: DateTime
  odometerAtService: Float
  cost: Decimal
  status: Enum (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
  nextServiceDueDate: DateTime?
  nextServiceOdometer: Float?
  documentUrl: String? (S3 Private)

[FuelLog]
  id: String (UUID, PK)
  vehicleId: String (FK -> Vehicle.id)
  driverId: String (FK -> DriverProfile.id)
  fueledAt: DateTime
  volumeLiters: Float
  costTotal: Decimal
  odometerKm: Float
  fuelStation: String
  receiptPhotoUrl: String? (S3 Private)
  calculatedCostPerKm: Float?

[Invoice]
  id: String (UUID, PK)
  invoiceNumber: String (Unique)  -- e.g. "INV-2026-0045"
  customerId: String (FK -> User.id)
  shipmentId: String? (FK -> Shipment.id)
  issueDate: DateTime
  dueDate: DateTime
  status: Enum (DRAFT, ISSUED, PAID, OVERDUE, VOID)
  subtotal: Decimal
  taxRatePercent: Decimal
  taxAmount: Decimal
  totalAmount: Decimal
  pdfUrl: String? (S3 Private)
  paidAt: DateTime?

[AuditLog]
  id: String (UUID, PK)
  userId: String? (FK -> User.id)
  action: String  -- e.g. "SHIPMENT_DISPATCHED", "RATE_CARD_UPDATED"
  entity: String  -- e.g. "Shipment", "User", "Invoice"
  entityId: String
  diffPayload: Json?
  ipAddress: String
  userAgent: String
  timestamp: DateTime (Default: now())

[CustomerReview]
  id: String (UUID, PK)
  shipmentId: String (FK -> Shipment.id, Unique)
  customerId: String (FK -> User.id)
  rating: Int  -- 1 to 5 stars
  feedbackText: String?
  isVerified: Boolean (Default: true)
  createdAt: DateTime
```

---

### 5. API Specification (RESTful Endpoints & WebSockets)

#### 5.1 Authentication & Profile
- `POST /api/v1/auth/login`: Issue HTTP-only secure JWT cookie.
- `POST /api/v1/auth/logout`: Invalidate session and clear auth cookies.
- `GET  /api/v1/auth/me`: Retrieve current authenticated user profile and permissions matrix.

#### 5.2 Vehicles & Fleet Telemetry
- `GET    /api/v1/vehicles`: Paginated list of vehicles with status, current location, and search filter.
- `POST   /api/v1/vehicles`: Create new vehicle asset dossier.
- `GET    /api/v1/vehicles/:id`: Detailed profile with maintenance history, fuel efficiency, and active route.
- `PATCH  /api/v1/vehicles/:id`: Update status, odometer, or document dates.
- `DELETE /api/v1/vehicles/:id`: Soft delete vehicle record.
- `POST   /api/v1/telemetry`: High-frequency endpoint for batch GPS pings from in-vehicle devices or driver app.

#### 5.3 Shipments & Orders
- `GET    /api/v1/shipments`: Filterable, sortable list supporting pagination, status tabs, and date filters.
- `POST   /api/v1/shipments`: Create new shipment with automated tracking number generation.
- `GET    /api/v1/shipments/:id`: Full details including assigned driver, stops, timeline, and e-POD.
- `PATCH  /api/v1/shipments/:id/status`: Advance shipment status through lifecycle with audit trail.
- `POST   /api/v1/shipments/:id/assign`: Assign vehicle and driver to shipment.
- `POST   /api/v1/shipments/:id/pod`: Upload digital signature and delivery photo.
- `GET    /api/v1/shipments/track/:token`: Public unauthenticated endpoint for customer tracking link.

#### 5.4 Route Optimization
- `POST   /api/v1/routes/optimize`: Accepts an array of shipment stops, starting depot, and vehicle capacity. Runs TSP heuristic and returns ordered stops, total distance, ETA, and encoded polyline.

#### 5.5 Maintenance & Fuel
- `GET    /api/v1/maintenance`: Retrieve upcoming service reminders and past repair records.
- `POST   /api/v1/maintenance`: Log new maintenance event or work order.
- `GET    /api/v1/fuel`: Retrieve fuel logs and automated cost-per-km metrics.
- `POST   /api/v1/fuel`: Submit fuel log with receipt image attachment.

#### 5.6 Billing & Invoices
- `GET    /api/v1/billing/invoices`: List generated invoices with payment statuses.
- `POST   /api/v1/billing/invoices/generate`: Trigger automatic invoice creation for completed shipments.
- `GET    /api/v1/billing/invoices/:id/download`: Stream invoice PDF via pre-signed URL.

#### 5.7 Storage & Pre-Signed URLs
- `POST   /api/v1/storage/signed-url`: Generates S3 pre-signed upload URL for driver licenses, POD photos, or fuel receipts with strict file type validation (image/jpeg, image/png, application/pdf).

#### 5.8 Real-Time WebSocket Protocols
- **Connection Endpoint**: `ws://<host>/api/socket` (or WSS in production).
- **Client &rarr; Server Events**:
  - `SUBSCRIBE_VEHICLES`: Register client to receive live fleet location broadcasts.
  - `SUBSCRIBE_SHIPMENT { trackingNumber }`: Customer tracking subscription.
  - `DRIVER_PING { lat, lng, speed, heading, timestamp }`: Ingest driver GPS updates.
- **Server &rarr; Client Events**:
  - `FLEET_UPDATE`: Stream array of active vehicles `{ id, lat, lng, heading, speed, status }`.
  - `SHIPMENT_STATUS_CHANGED`: Real-time order status update notification.
  - `GEOFENCE_ALERT`: Immediate push alert when a vehicle breaches or enters a perimeter.

---

### 6. Authentication, Authorization & RBAC Matrix

Authentication uses secure HTTP-only cookies containing signed JSON Web Tokens (JWT) with user ID and role claims. Every incoming API request passes through a centralized `withAuth(requiredRole)` guard.

| Resource / Endpoint | Admin | Dispatcher | Driver | Customer | Finance |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Live Map & Fleet** | Read/Write | Read/Write | Own Route Only | Public Token Only | No Access |
| **Manage Shipments** | Full | Full | Status/POD Only | Own Orders | View Only |
| **Route Optimization** | Full | Full | Read Assigned | No Access | No Access |
| **Driver & Vehicle CRUD** | Full | Read/Assign | Own Profile Only| No Access | No Access |
| **Maintenance & Fuel** | Full | Full | Submit Fuel Log| No Access | Read/Approve |
| **Billing & Invoices** | Full | Read Only | No Access | Own Invoices | Full (Issue/Void) |
| **Audit Logs & Settings** | Full | No Access | No Access | No Access | No Access |

---

### 7. File Storage & Security Architecture
- Sensitive assets (driver identity cards, medical certificates, POD photos, tax invoices) are stored in an **isolated private S3-compatible bucket**.
- Buckets block all public read/write access.
- When an authorized user requests a document (e.g., viewing a POD photo in the shipment viewer), the backend verifies the user's role and generates a **short-lived HMAC SHA-256 pre-signed GET URL** with a maximum 15-minute time-to-live (TTL).
- Direct file uploads (e.g., driver camera photo capture) utilize pre-signed PUT URLs with strict `Content-Type` and `Content-Length` constraints (max 10MB).

---

### 8. Background Workers & Scheduled Tasks (Cron)
- **Geofence Worker**: Ingests vehicle GPS points and evaluates bounding box intersections against active geofences, dispatching automated alerts.
- **Document Expiry Watcher**: Runs daily at 00:00 UTC. Flags driver licenses, vehicle roadworthiness certificates, and insurance policies expiring within 30, 15, and 7 days.
- **Maintenance Threshold Watcher**: Compares vehicle current odometer with `nextServiceOdometer` and triggers maintenance alert flags.
- **Invoice PDF Generator**: Asynchronously renders invoices using `@react-pdf/renderer` upon shipment delivery and saves the binary to private storage.

---

### 9. Environment Variables Specification (.env.example)

```bash
# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-secure-32-byte-hex-string-for-jwt-signing
NEXTAUTH_URL=http://localhost:3000

# Database (PostgreSQL + PostGIS)
DATABASE_URL="postgresql://logipulse_admin:secure_password@localhost:5432/logipulse_db?schema=public"

# Redis & Caching
REDIS_URL="redis://default:secure_redis_password@localhost:6379"

# Object Storage (AWS S3 or Cloudflare R2 / MinIO)
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIA_EXAMPLE_KEY"
S3_SECRET_ACCESS_KEY="secret_access_key_string"
S3_BUCKET_PRIVATE="logipulse-private-documents"

# Maps Provider (MapLibre / Mapbox)
NEXT_PUBLIC_MAP_STYLE_LIGHT="https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY"
NEXT_PUBLIC_MAP_STYLE_DARK="https://api.maptiler.com/maps/ch-swisstopo-dark/style.json?key=YOUR_KEY"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=""

# Analytics & Marketing
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Notification Services
RESEND_API_KEY="re_123456789"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Demo Mode Feature Flag
NEXT_PUBLIC_DEMO_MODE=true
```
