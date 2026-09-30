# Engineering & Governance Rules
## LogiPulse Logistics & Fleet Management Platform

---

### 1. Core Engineering Principles & Workflow Rules
- **Read All 6 Governance Files**: At the beginning of every session and before planning any feature or bug fix, read `prd.md`, `architecture.md`, `rules.md`, `design.md`, `task.md`, and `memory.md`.
- **Phase-by-Phase Development**: Strict phase execution based on `task.md`. Never jump to Phase 3 while Phase 1 items remain unverified.
- **Immediate Documentation Updates**:
  - Check off completed items in `task.md` immediately upon verification.
  - Append architectural decisions, trade-offs, and state updates to `memory.md` at the conclusion of every step.
- **Human Approval Gate**: Request user review and explicit approval before any major architectural modification or schema revamp.

---

### 2. Code Quality & Architecture Standards

#### 2.1 TypeScript & Type Safety
- **Strict Mode Enabled**: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`.
- **Zero `any` Policy**: Use explicit interfaces, types, or generics. If an unknown external payload is parsed, validate it immediately using Zod schemas (`z.infer<typeof Schema>`).
- **Shared Type Definitions**: Place cross-boundary data transfer objects (DTOs) in `src/types/`.

#### 2.2 File & Component Conventions
- **Component File Structure**:
  - `src/components/ui/`: Atomic headless components styled with Tailwind.
  - `src/components/<module>/`: Composed domain-specific components (e.g. `src/components/dispatch/KanbanBoard.tsx`).
- **Naming Conventions**:
  - Files and directories: `kebab-case` (e.g., `vehicle-card.tsx`, `use-vehicle-telemetry.ts`).
  - React Components: `PascalCase` (e.g., `VehicleCard`, `KanbanBoard`).
  - Functions, variables, hooks: `camelCase` (e.g., `calculateEta`, `useDebounce`).
  - Constants and Enums: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`, `SHIPMENT_STATUS`).
- **Modularity & Single Responsibility**: Keep components under 250 lines of code. Split complex UI into smaller subcomponents and custom hooks.

#### 2.3 Commit & Versioning Conventions
- Follow the **Conventional Commits** specification:
  - `feat: add live vehicle marker interpolation on MapLibre`
  - `fix: correct timezone offset in dispatch delivery window`
  - `refactor: extract route optimization heuristic into worker utility`
  - `test: add unit tests for geofence ray-casting algorithm`
  - `docs: update API documentation for shipment assignment`
  - `chore: update dependencies and lint config`

---

### 3. Security, Privacy & Integrity Standards

#### 3.1 Input Validation & Sanitization
- Every API endpoint accepting request bodies, query params, or route params must parse and validate them through strict **Zod schemas**.
- Sanitize all string inputs to prevent Cross-Site Scripting (XSS).
- Use parameterized SQL queries exclusively (enforced via Prisma ORM) to prevent SQL Injection.

#### 3.2 Secrets Management & Zero-Secrets Rule
- Never hardcode API keys, database credentials, JWT secrets, or tokens in source code.
- All secrets must reside in `.env.local` (and documented in `.env.example`).
- Ensure `.gitignore` explicitly blocks `.env`, `.env.local`, and build artifacts.

#### 3.3 Authorization & Least-Privilege Access
- Validate user identity and role on **both client and server sides**.
- Server Route Handlers and Server Actions must enforce role verification before executing any DB mutation.
- Multi-tenancy isolation: queries must include tenant/organization or user ownership scopes.

#### 3.4 Rate Limiting & Denial of Service Protection
- Public endpoints (`/api/v1/auth/login`, `/api/v1/shipments/track/:token`) must enforce Redis-backed rate limiting (e.g., max 10 login attempts per 15 minutes per IP; max 120 tracking queries per minute).

#### 3.5 Anti-Fabrication & Truth in Data Policy
- **Never fabricate user reviews, ratings, or telemetry benchmarks.**
- Testimonials must display only real, verified reviews submitted via the platform. If zero reviews exist, render an elegant empty state inviting real submissions.
- Clearly distinguish test or development data: seed demo data exclusively behind an explicit `Demo Mode` toggle with clear UI banners ("DEMO DATA - NOT FOR PRODUCTION").

---

### 4. UI/UX Quality Gates & Performance Benchmarks

#### 4.1 Lighthouse Audits
All public and internal views must achieve the following minimum audit scores in production build mode:
- **Performance**: &ge; 90
- **Accessibility**: &ge; 95
- **Best Practices**: &ge; 95
- **SEO**: &ge; 95

#### 4.2 Accessibility & WCAG 2.1 AA Compliance
- High-contrast text meeting WCAG AA ratio: minimum 4.5:1 for normal text, 3:1 for large text.
- Visible, distinct `:focus-visible` outline rings on every keyboard-navigable element (buttons, links, inputs).
- Full keyboard navigation: all interactive dialogs, dropdowns, and modals must trap focus and close on `Escape`.
- Meaningful ARIA roles, `aria-label`, and `aria-expanded` attributes on dynamic widgets.

#### 4.3 View States & Interactivity Coverage
- **Every asynchronous data-dependent view must provide all 4 states**:
  1. **Loading State**: Content-shaped shimmer skeletons matching final layout dimensions.
  2. **Empty State**: Custom SVG illustration, clear descriptive message, and a primary action button.
  3. **Error State**: Non-technical explanation, retry button, and error trace link for admins.
  4. **Success / Populated State**: Polished data display with micro-transitions.
- **Every interactive element (buttons, cards, table rows, nav links) must explicitly define**:
  - `hover`: subtle background tint or elevation lift.
  - `active`: tactile pressed scale (e.g. `active:scale-[0.98]`).
  - `focus-visible`: 2px distinct accent ring with offset.
  - `disabled`: reduced opacity (50%), `cursor-not-allowed`, stripped event handlers.

#### 4.4 Responsive Breakpoints & Device Testing
Interfaces must be thoroughly validated across 4 standard viewport widths:
1. **360px** (Compact Mobile / Driver Smartphone)
2. **768px** (Tablet / In-Cab Mounted Terminal)
3. **1280px** (Standard Laptop / Dispatcher Workstation)
4. **1920px** (Ultra-Wide Command Center Wall Display)

#### 4.5 Performance & Cumulative Layout Shift (CLS)
- **Zero Layout Shift (CLS < 0.1)**: Always specify width/height or aspect-ratio on images, map containers, and charts.
- **Lazy Loading**: Heavy components (MapLibre WebGL canvas, Recharts charts, Signature Pad) must be dynamically imported with `next/dynamic` and skeleton fallbacks.
- **Image Optimization**: Serve all imagery through Next.js `<Image />` using modern WebP or AVIF formats.
- **Design System Showcase**: Build and maintain a live `/design-system` route previewing all tokens, typography, buttons, inputs, badges, and modals before constructing full pages.

---

### 5. Mandatory Pre-Launch Checklist (20 Items)

Each item in this checklist is a hard requirement for the platform release:

1. **Response-Time Promise**: Display a realistic, guaranteed support and quote response time (e.g., *"Our dispatch specialists respond within 15 minutes during operating hours"*) directly on contact and quote forms.
2. **Favicon + Tab Title**: Implement brand SVG favicon with dark/light variants and dynamic, contextual tab titles (`<title>Shipment TRK-98124 | LogiPulse</title>`) across every route.
3. **Real Reviews**: Build a verified testimonials section that only displays real, submitted reviews. Render an elegant empty state when no reviews exist. Zero fake testimonials.
4. **Private Storage Bucket**: Store sensitive documents (driver licenses, medical certifications, e-POD photos, invoices) in a private S3 bucket accessed strictly via role-authenticated, time-limited (15-min) signed URLs.
5. **Unique Page Title**: Configure unique, descriptive, search-optimized page titles for every public and dashboard route.
6. **Privacy Policy Page**: Provide a legally compliant Privacy Policy page (`/privacy`) detailing data governance, encryption standards, cookies, and user rights.
7. **Primary CTA Above the Fold**: Prominently display primary call-to-actions (*"Request Live Demo"* and *"Calculate Freight Quote"*) above the fold on the landing page.
8. **Open Graph & Twitter Card Tags**: Implement dynamic Open Graph (`og:title`, `og:image`, `og:description`) and Twitter Card metadata on all public pages for rich social link previews.
9. **AI Usage Disclosure**: Provide a clear badge and modal disclosure wherever AI heuristics or machine learning are used (e.g., AI multi-stop route optimization, automated arrival ETA predictions, support assistant).
10. **Google Analytics (GA4) with Cookie Consent**: Integrate GA4 via environment variable `NEXT_PUBLIC_GA_MEASUREMENT_ID` with an interactive, GDPR/CCPA-compliant cookie consent banner that only initializes tracking after consent.
11. **Sticky Mobile CTA**: Include a floating, non-intrusive bottom action bar on mobile devices (*"Request Quote"* / *"Contact Dispatch"*) on the marketing site.
12. **Fully Responsive Design**: Ensure flawless layout and usability across 360px, 768px, 1280px, and 1920px viewports.
13. **Unique Meta Description**: Write concise, search-optimized `<meta name="description">` tags (150–160 characters) for every public-facing page.
14. **Logistics FAQ Section**: Feature an interactive accordion containing at least 5 logistics-critical FAQs:
    - Transparent pricing & rate calculations
    - Real-time GPS tracking accuracy and refresh rates
    - Service coverage areas & cross-border freight
    - Cargo claims, loss, and damage protection protocol
    - Fleet onboarding and driver setup timeline
15. **Form Validation**: Implement dual-layer (client-side interactive feedback + server-side Zod verification) with clear, actionable error messages on every form.
16. **Thank-You Confirmation States**: Build dedicated confirmation pages/dialogs (`/thank-you` state) with clear next steps and reference numbers after quote requests, contact inquiries, and account signups.
17. **Telemetry & Driver Data Disclosure**: Publish an explicit data collection disclosure explaining what telemetry data is captured (GPS coordinates, speed, braking, shift hours), why it is required (safety & dispatch efficiency), and its retention period (e.g., 90-day rolling raw GPS retention, 7-year audit retention).
18. **Accessible Alt Text**: Provide concise, contextual `alt` descriptions on all meaningful images and mark decorative graphics with `aria-hidden="true"`.
19. **Loading Skeletons on All Async Views**: Display custom-tailored skeleton placeholders matching the exact card/table/map layout during data fetching to prevent any visual jump.
20. **Self-Harm & Crisis Response + Driver Fatigue Wellbeing**:
    - Any integrated AI support or chat assistant must detect distress or self-harm keywords, respond with empathy, refuse to generate harmful instructions, and immediately surface regional crisis helpline resources (e.g., 988 Suicide & Crisis Lifeline, international emergency contacts).
    - Include a dedicated **Driver Wellbeing & Fatigue Support** module in the mobile driver application with shift break recommendations, fatigue self-assessment, and mental health assistance contacts.
