# Design System & UI/UX Specification
## LogiPulse Logistics & Fleet Management Platform

---

### 1. Visual Quality Bar & Aesthetic Philosophy
LogiPulse embodies an **"Enterprise SaaS meets Consumer App"** design language (drawing inspiration from Stripe’s crisp typography, Linear’s keyboard-centric fluidity and dark mode precision, and Uber Freight’s high-density operational telemetry).

- **No Generic Templates**: Every screen, card, and marker is custom-crafted to meet the high data density and fast-twitch operational demands of dispatchers and fleet controllers.
- **Strict 8px Spatial Cadence**: Generous whitespace balanced with high visual hierarchy, ensuring interfaces remain scannable during high-stress dispatch cycles.
- **Restrained Elevation & Accents**: Glassmorphism and subtle radial gradients are reserved exclusively for focal accents (such as hero visual anchors, real-time KPI cards, and floating map control panels). Flat, clean surfaces with 1px border definition dominate tabular and form views.
- **Theme Resilience**: Native Light and Dark themes with zero-flicker client-side persistence (via local storage and `next-themes`), using smooth 200ms CSS color transitions.

---

### 2. Design System Tokens

#### 2.1 Color Tokens & Palettes (HSL Based)

```css
:root {
  /* Surface & Base (Light Mode) */
  --background: 210 20% 98%;          /* #F8FAFC - Clean Slate */
  --foreground: 222 47% 11%;          /* #0F172A - Deep Charcoal */
  --card: 0 0% 100%;                  /* #FFFFFF - Pure White */
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* Primary Brand (Precision Fleet Blue) */
  --primary: 221 83% 53%;             /* #2563EB - Electric Indigo/Cobalt */
  --primary-foreground: 210 40% 98%;

  /* Secondary & Muted */
  --secondary: 210 40% 96%;           /* #F1F5F9 */
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;    /* #64748B - Slate Muted */

  /* Accent (Active Cyan Glow) */
  --accent: 199 89% 48%;              /* #0EA5E9 - Sky/Cyan */
  --accent-foreground: 222 47% 11%;

  /* Semantic Feedback Tokens */
  --success: 142 71% 45%;             /* #16A34A - Emerald Green (Moving / On-Time) */
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;              /* #F59E0B - Amber Orange (Idling / Pending / Caution) */
  --warning-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;           /* #EF4444 - Crimson Red (Stopped / Delayed / Critical) */
  --destructive-foreground: 0 0% 100%;
  --info: 217 91% 60%;                /* #3B82F6 - Sky Blue (Notice) */
  --info-foreground: 0 0% 100%;

  /* Borders & Inputs */
  --border: 214 32% 91%;              /* #E2E8F0 */
  --input: 214 32% 91%;
  --ring: 221 83% 53%;

  /* Radius Scale */
  --radius-sm: 0.375rem;              /* 6px */
  --radius-md: 0.5rem;                /* 8px */
  --radius-lg: 0.75rem;               /* 12px */
  --radius-xl: 1rem;                  /* 16px */
  --radius-full: 9999px;
}

.dark {
  /* Surface & Base (Dark Mode - Deep Space) */
  --background: 224 71% 4%;           /* #020817 - Deepest Navy */
  --foreground: 210 40% 98%;          /* #F8FAFC */
  --card: 222 47% 8%;                 /* #0B132B - Subtle Card Surface */
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 8%;
  --popover-foreground: 210 40% 98%;

  /* Primary Brand (Slightly Brighter for Dark Surface Contrast) */
  --primary: 217 91% 60%;             /* #3B82F6 */
  --primary-foreground: 222 47% 11%;

  /* Secondary & Muted */
  --secondary: 217 33% 17%;           /* #1E293B */
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 14%;
  --muted-foreground: 215 20% 65%;    /* #94A3B8 */

  /* Accent */
  --accent: 199 89% 48%;
  --accent-foreground: 210 40% 98%;

  /* Semantic Feedback Tokens (Vibrant Dark) */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  --info: 217 91% 60%;

  /* Borders & Inputs */
  --border: 217 33% 18%;              /* Subtle dark divider */
  --input: 217 33% 18%;
  --ring: 217 91% 60%;
}
```

#### 2.2 Typography Hierarchy (Inter & Outfit)
- **Primary Body Font**: **Inter** (`font-sans`) — engineered for tabular data, numerical legibility, and high-density dashboards.
- **Display & Headings**: **Outfit** (`font-heading`) — clean, geometric, modern enterprise personality.
- **Type Scale**:
  - `Display / Hero`: 48px / Line Height 52px / SemiBold (700)
  - `H1 (Page Header)`: 30px / Line Height 36px / SemiBold (600)
  - `H2 (Section Header)`: 24px / Line Height 30px / SemiBold (600)
  - `H3 (Card Header)`: 18px / Line Height 24px / Medium (500)
  - `Body Standard`: 14px / Line Height 20px / Regular (400)
  - `Body Small / Meta`: 12px / Line Height 16px / Regular (400)
  - `Telemetry / Metrics`: 24px / Line Height 28px / Bold (700) with `font-mono tabular-nums`

#### 2.3 Spacing & Layout Grid (Strict 8px Baseline)
- Spacing units: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px), `space-16` (64px).
- Containers: `max-w-7xl` for standard analytics; full-width `100vw - sidebar` for live map and dispatch boards.

#### 2.4 Shadows & Elevation Hierarchy
- **Elevation 0 (Flat)**: `border border-border shadow-none` (table cells, standard inputs).
- **Elevation 1 (Cards)**: `shadow-xs border border-border/80` (dashboard metric cards, shipment cards).
- **Elevation 2 (Dropdowns & Modals)**: `shadow-md border border-border/60 backdrop-blur-md` (context menus, filter popovers).
- **Elevation 3 (Floating Map Panels & Command Palette)**: `shadow-2xl border border-border/40 shadow-black/20`.

---

### 3. Iconography & Visual Assets

#### 3.1 Icon Library
- **Single Icon Standard**: **Lucide React** strictly. Zero emojis as UI icons.
- **Domain Mappings**:
  - Vehicle / Fleet: `Truck`, `Car`, `Bike`, `Container`
  - Navigation / Route: `Route`, `Navigation`, `MapPin`, `Compass`, `Crosshair`
  - Shipments & Cargo: `Package`, `Box`, `ClipboardCheck`, `FileText`, `ScanBarcode`
  - Fuel & Maintenance: `Fuel`, `Wrench`, `Gauge`, `Zap`, `AlertTriangle`
  - Drivers & Shifts: `UserCheck`, `Users`, `Clock`, `HeartPulse`
  - Financials: `Receipt`, `CreditCard`, `BadgeDollarSign`, `TrendingUp`
  - System: `Bell`, `Search`, `Filter`, `Download`, `Moon`, `Sun`, `Command`

#### 3.2 Vehicle Map Markers & Geofences
- **Dynamic SVG Markers**:
  - Custom vector icons for **Heavy Truck**, **Delivery Van**, and **Courier Motorcycle**.
  - **Heading Direction**: Rotated dynamically via CSS transform `rotate(${headingDeg}deg)`.
  - **Live Status Rings**:
    - Green pulsing halo: Moving (`speed > 5 km/h`)
    - Amber solid halo: Idling (`speed <= 5 km/h` with engine running)
    - Red solid halo: Stopped or maintenance alert
    - Dim slate: Offline / signal lost
- **Geofence Visuals**:
  - Polygon / circle fill: `rgba(37, 99, 235, 0.12)` with a 2px crisp border `rgba(37, 99, 235, 0.8)`.
  - Restricted zones: `rgba(239, 68, 68, 0.15)` with dashed red border.

#### 3.3 Custom SVG Illustrations
- Bespoke vector illustrations for:
  - Empty shipment list (`/public/illustrations/empty-shipments.svg`)
  - No active alerts (`/public/illustrations/all-clear.svg`)
  - 404 Route Not Found (`/public/illustrations/lost-truck-404.svg`)
  - Marketing hero background grid & isometric logistics nodes.

---

### 4. Layout Architecture & Key Views

#### 4.1 Global Application Shell
- **Collapsible Sidebar (Left)**:
  - Brand logo with live pulsing status beacon.
  - Role-filtered navigation links with active state indicator (accent left border + subtle background tint).
  - Bottom slot: Current user profile snippet, organization switcher, theme toggle (Sun/Moon), and logout.
- **Top Command Bar**:
  - Global Search trigger (`Ctrl+K` / `Cmd+K` command palette).
  - Real-time WebSocket connectivity status pill (`Live` in emerald green; `Reconnecting...` in amber pulse).
  - Quick action button (`+ New Shipment` wizard).
  - Notification Center dropdown with unread badge counter.
  - Role badge indicator (`Admin`, `Dispatcher`, etc.).

#### 4.2 Full-Screen Live Map View (`/map`)
```
+-----------------------------------------------------------------------------------------+
| [Top Navigation Bar - Search, Live Pulse, Notification Bell, User Avatar]               |
+-----------------------------------------------------------------------------------------+
| [Floating Left Panel]           | [Full Canvas WebGL Map]            | [Floating Right Panel]
| - Search Fleet / Filter         | - Animated Vehicle Markers         | - Selected Vehicle Dossier
| - Vehicle List (Online/Idle)    | - Real-Time Polyline Routes        | - Driver details & photo
| - Geofence Toggles              | - Geofence Zones                   | - Odometer, Fuel, Speed
| - Traffic Layer Switch          | - Clustered Markers                | - Telemetry Timeline
|                                 |                                    | - Quick Dispatch Action
+---------------------------------+------------------------------------+--------------------------+
| [Bottom Trip Playback Scrubber (Collapsible)] - Play/Pause, 1x/2x/5x speed, Time Slider  |
+-----------------------------------------------------------------------------------------+
```

#### 4.3 Kanban Dispatch Board (`/shipments/board`)
- **Drag-and-Drop Columns**:
  1. `Unassigned` (Incoming orders requiring routing & vehicle allocation)
  2. `Dispatched` (Assigned to driver, awaiting pickup arrival)
  3. `At Pickup` (Loading in progress at warehouse/vendor)
  4. `In Transit` (On route with live dynamic ETA)
  5. `Delivered` (Successfully completed with e-POD verified)
- **Shipment Card**:
  - Tracking ID, customer badge, destination summary, package weight/volume.
  - Assigned driver thumbnail, SLA countdown timer, and priority flag.
  - Smooth card dragging with shadow elevation and drop target highlight.

#### 4.4 Advanced Data Table (`/shipments`, `/fleet`, `/drivers`)
- **Top Action Bar**: Fuzzy search input, multi-attribute filter dropdown (status, date range, vehicle type), column visibility toggle, and "Export CSV" trigger.
- **Bulk Action Bar**: Slides up when rows are selected (`Assign Driver`, `Change Status`, `Download Manifest`).
- **Interactive Rows**: Hover highlight, sorted column arrows, inline status pills, and right-click context menu.

#### 4.5 Mobile-First Driver Application (`/driver/*`)
- **PWA Optimized**: Installable to home screen with full offline caching via Service Worker.
- **Thumb-Friendly Ergonomics**: 48px+ minimum touch targets, high contrast for direct sunlight readability.
- **Driver Views**:
  - **Shift Gate**: Clock-in button, vehicle selection, and mandatory 5-point vehicle safety checklist.
  - **Active Route Manifest**: Sequential card list of remaining stops with one-tap status buttons (*"Arrived at Stop"*, *"Departed"*).
  - **Turn-by-Turn Nav Hook**: One-touch deep link to Google Maps, Waze, or Apple Maps.
  - **Electronic Proof of Delivery (e-POD)**:
    - HTML5 Canvas signature pad with clear, undo, and save actions.
    - Camera viewfinder integration with geolocation tagging.
    - Recipient name and relationship input.
  - **Driver Wellbeing & Fatigue**: Quick check-in prompt during shifts, mandatory rest break timer, and 24/7 crisis helpline directory.

#### 4.6 Public Customer Tracking Portal (`/track/[token]`)
- Fully responsive, brand-customized tracking experience requiring zero authentication.
- **Live Visuals**: Embedded interactive map showing current vehicle location (fuzzed by 200m for driver privacy) and destination pin.
- **Dynamic Delivery Progress**: Step-by-step vertical animated timeline (`Ordered` &rarr; `Dispatched` &rarr; `Out for Delivery` &rarr; `Delivered`).
- **Live ETA Counter**: Dynamic countdown badge (*"Arriving in approximately 18 minutes"*).
- **Driver Info**: Driver first name, vehicle model, and contact dispatch link.

---

### 5. Interactive & Reactive UX Patterns

#### 5.1 Command Palette (`Ctrl/Cmd + K`)
- Instant keyboard-driven navigation across the entire ecosystem.
- Global search for shipments, vehicles, drivers, or customers.
- Quick system actions:
  - *"Create new shipment"*
  - *"Find vehicle by license plate"*
  - *"Toggle Dark/Light Mode"*
  - *"Open maintenance schedule"*

#### 5.2 Notification Center
- Dropdown bell with categorized unread tabs (`All`, `Alerts`, `Shipments`, `System`).
- Real-time badge counter updating immediately upon WebSocket events.
- Quick actions: *"Mark all as read"*, click notification to navigate directly to the relevant shipment or vehicle dossier.

#### 5.3 Multi-Step Wizards with Stepper Navigation
- Used for `New Shipment Creation` and `Vehicle Onboarding`:
  - Step 1: Cargo Specifications & Origin/Destination
  - Step 2: Vehicle & Route Selection
  - Step 3: Rate Card Calculation & Schedule Confirmation
  - Step 4: Review, Auto-Dispatch & Confirmation

#### 5.4 State Coverage Standards
| State | Visual Treatment |
| :--- | :--- |
| **Loading** | Content-matching skeleton blocks with subtle CSS shimmer animation. |
| **Empty** | Themed custom SVG illustration, supportive heading, and primary action CTA. |
| **Error** | Non-alarming warning box with icon, human-readable error explanation, and "Try Again" button. |
| **Success** | Animated checkmark micro-interaction, concise confirmation message, and immediate state reflection. |

---

### 6. Motion & Micro-Interactions (Framer Motion Guidelines)
- **Speed & Duration**: Fast, responsive, snappy transitions (150ms to 250ms). Never impede operational speed.
- **Easing Curves**: `easeOut` for enter transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), `easeIn` for exits.
- **Staggered Animations**: List items and table rows animate with 30ms stagger for a smooth waterfall effect.
- **Accessible Motion**: Strict adherence to `@media (prefers-reduced-motion: reduce)`. All movement is replaced with instant opacity crossfades when reduced motion is requested.
