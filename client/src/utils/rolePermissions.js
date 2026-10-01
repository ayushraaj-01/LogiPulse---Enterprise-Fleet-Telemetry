import {
  LayoutDashboard,
  Package,
  KanbanSquare,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Navigation,
  LifeBuoy,
  PlusCircle,
} from "lucide-react";

/**
 * Role-Based Access Control (RBAC) Module Configuration
 *
 * ROLES:
 * 1. ADMIN: Complete unrestricted system access across all modules.
 * 2. DISPATCHER: Operational control (Overview, Shipments, Dispatch Board, Fleet, Drivers, Routes, Maintenance).
 * 3. DRIVER: Driver workflow (Driver Portal, My Route, Fuel Log, Vehicle Maintenance).
 * 4. CUSTOMER: Customer Portal (My Orders, Track My Consignment, Book Freight, Invoices, Support).
 *    * CUSTOMER CANNOT SEE LIVE LOCATIONS OF THE ENTIRE FLEET! ONLY TRACKS THEIR OWN ORDER *
 * 5. FINANCE: Accounting (Overview, Invoicing & Billing, Fuel & Expenses, Freight Analytics, Audit Logs).
 */

export const ROLE_CONFIG = {
  ADMIN: {
    label: "Admin",
    badge: "Full Access",
    defaultPath: "/overview",
    description: "Complete system governance, audit trails, fleet settings, and user management.",
    allowedPaths: [
      "/overview",
      "/shipments",
      "/dispatch-board",
      "/fleet",
      "/drivers",
      "/routes",
      "/maintenance",
      "/fuel-expenses",
      "/billing",
      "/analytics",
      "/audit-logs",
      "/driver-portal",
      "/track-order",
      "/book-shipment",
      "/support",
    ],
  },
  DISPATCHER: {
    label: "Dispatcher",
    badge: "Live Routes",
    defaultPath: "/overview",
    description: "Real-time dispatching, Kanban assignments, route planning, fleet tracking, and driver management.",
    allowedPaths: [
      "/overview",
      "/shipments",
      "/dispatch-board",
      "/fleet",
      "/drivers",
      "/routes",
      "/maintenance",
    ],
  },
  DRIVER: {
    label: "Driver",
    badge: "Driver App",
    defaultPath: "/driver-portal",
    description: "Mobile driver console, manifest stops, e-POD signature capture, vehicle inspection, and fuel logs.",
    allowedPaths: [
      "/driver-portal",
      "/routes",
      "/fuel-expenses",
      "/maintenance",
    ],
  },
  CUSTOMER: {
    label: "Customer",
    badge: "Track & Book",
    defaultPath: "/track-order",
    description: "Track consignments with live OTP, book freight deliveries, view invoices, and contact support.",
    allowedPaths: [
      "/track-order",
      "/shipments",
      "/book-shipment",
      "/billing",
      "/support",
    ],
  },
  FINANCE: {
    label: "Finance",
    badge: "Invoices",
    defaultPath: "/billing",
    description: "Invoicing console, rate card rules, fuel & toll expense auditing, and financial settlements.",
    allowedPaths: [
      "/overview",
      "/billing",
      "/fuel-expenses",
      "/analytics",
      "/audit-logs",
      "/shipments",
    ],
  },
};

// All Navigation Items across modules
export const ALL_NAV_ITEMS = [
  // Dispatch & Admin Modules
  {
    id: "overview",
    title: "Overview",
    path: "/overview",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DISPATCHER", "FINANCE"],
  },

  // Customer Specific Modules
  {
    id: "track-order",
    title: "Track My Consignment",
    path: "/track-order",
    icon: Navigation,
    badge: "Live Status",
    roles: ["CUSTOMER", "ADMIN"],
  },
  {
    id: "book-shipment",
    title: "Book Freight (Porter)",
    path: "/book-shipment",
    icon: PlusCircle,
    badge: "Instant Fare",
    roles: ["CUSTOMER", "ADMIN"],
  },

  // Common Shipments Module
  {
    id: "shipments",
    title: "Shipments & Orders",
    path: "/shipments",
    icon: Package,
    roles: ["ADMIN", "DISPATCHER", "CUSTOMER", "FINANCE"],
  },

  // Dispatch & Operations Modules
  {
    id: "dispatch-board",
    title: "Dispatch Board",
    path: "/dispatch-board",
    icon: KanbanSquare,
    badge: "Live",
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    id: "fleet",
    title: "Fleet Assets",
    path: "/fleet",
    icon: Truck,
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    id: "drivers",
    title: "Drivers",
    path: "/drivers",
    icon: Users,
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    id: "routes",
    title: "Route Optimizer",
    path: "/routes",
    icon: Route,
    roles: ["ADMIN", "DISPATCHER", "DRIVER"],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
    roles: ["ADMIN", "DISPATCHER", "DRIVER"],
  },
  {
    id: "fuel-expenses",
    title: "Fuel & Expenses",
    path: "/fuel-expenses",
    icon: Fuel,
    roles: ["ADMIN", "FINANCE", "DRIVER"],
  },
  {
    id: "billing",
    title: "Invoicing & Billing",
    path: "/billing",
    icon: Receipt,
    roles: ["ADMIN", "FINANCE", "CUSTOMER"],
  },
  {
    id: "analytics",
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "FINANCE"],
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    path: "/audit-logs",
    icon: ShieldCheck,
    roles: ["ADMIN", "FINANCE"],
  },
  {
    id: "support",
    title: "Help & Claims Center",
    path: "/support",
    icon: LifeBuoy,
    roles: ["CUSTOMER", "ADMIN"],
  },
];

/**
 * Filter navigation items based on current active user role
 */
export const getNavItemsForRole = (role) => {
  const normalizedRole = (role || "").toUpperCase();
  if (normalizedRole === "ADMIN") {
    return ALL_NAV_ITEMS;
  }
  return ALL_NAV_ITEMS.filter((item) => item.roles.includes(normalizedRole));
};

/**
 * Verify if a role is authorized to view a particular path
 */
export const isPathAllowedForRole = (role, path) => {
  const normalizedRole = (role || "CUSTOMER").toUpperCase();
  if (normalizedRole === "ADMIN") return true;

  const config = ROLE_CONFIG[normalizedRole];
  if (!config) return false;

  return config.allowedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
};

/**
 * Get default redirect path for a role
 */
export const getDefaultPathForRole = (role) => {
  const normalizedRole = (role || "CUSTOMER").toUpperCase();
  return ROLE_CONFIG[normalizedRole]?.defaultPath || "/overview";
};
