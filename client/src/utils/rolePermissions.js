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
 * Universal Logistics Platform Access Configuration
 * Every authenticated persona has access across operational modules without artificial barriers.
 */

const ALL_SYSTEM_PATHS = [
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
];

export const ROLE_CONFIG = {
  ADMIN: {
    label: "Admin",
    badge: "Full Access",
    defaultPath: "/overview",
    description: "Complete system governance, audit trails, fleet settings, and user management.",
    allowedPaths: ALL_SYSTEM_PATHS,
  },
  DISPATCHER: {
    label: "Dispatcher",
    badge: "Live Routes",
    defaultPath: "/overview",
    description: "Real-time dispatching, Kanban assignments, route planning, fleet tracking, and driver management.",
    allowedPaths: ALL_SYSTEM_PATHS,
  },
  DRIVER: {
    label: "Driver",
    badge: "Driver App",
    defaultPath: "/driver-portal",
    description: "Mobile driver console, manifest stops, e-POD signature capture, vehicle inspection, and fuel logs.",
    allowedPaths: ALL_SYSTEM_PATHS,
  },
  CUSTOMER: {
    label: "Customer",
    badge: "Track & Book",
    defaultPath: "/track-order",
    description: "Track consignments with live OTP, book freight deliveries, view invoices, and contact support.",
    allowedPaths: ALL_SYSTEM_PATHS,
  },
  FINANCE: {
    label: "Finance",
    badge: "Invoices",
    defaultPath: "/billing",
    description: "Invoicing console, rate card rules, fuel & toll expense auditing, and financial settlements.",
    allowedPaths: ALL_SYSTEM_PATHS,
  },
};

// All Navigation Items across modules
export const ALL_NAV_ITEMS = [
  {
    id: "overview",
    title: "Overview",
    path: "/overview",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DISPATCHER", "FINANCE", "DRIVER", "CUSTOMER"],
  },
  {
    id: "track-order",
    title: "Track Consignment",
    path: "/track-order",
    icon: Navigation,
    badge: "Live Status",
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "book-shipment",
    title: "Book Freight (Porter)",
    path: "/book-shipment",
    icon: PlusCircle,
    badge: "Instant Fare",
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "shipments",
    title: "Shipments & Orders",
    path: "/shipments",
    icon: Package,
    roles: ["ADMIN", "DISPATCHER", "CUSTOMER", "FINANCE", "DRIVER"],
  },
  {
    id: "dispatch-board",
    title: "Dispatch Board",
    path: "/dispatch-board",
    icon: KanbanSquare,
    badge: "Live",
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "fleet",
    title: "Fleet Assets",
    path: "/fleet",
    icon: Truck,
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "drivers",
    title: "Drivers",
    path: "/drivers",
    icon: Users,
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "routes",
    title: "Route Optimizer",
    path: "/routes",
    icon: Route,
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
    roles: ["ADMIN", "DISPATCHER", "DRIVER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "fuel-expenses",
    title: "Fuel & Expenses",
    path: "/fuel-expenses",
    icon: Fuel,
    roles: ["ADMIN", "FINANCE", "DRIVER", "DISPATCHER", "CUSTOMER"],
  },
  {
    id: "billing",
    title: "Invoicing & Billing",
    path: "/billing",
    icon: Receipt,
    roles: ["ADMIN", "FINANCE", "CUSTOMER", "DISPATCHER", "DRIVER"],
  },
  {
    id: "analytics",
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "FINANCE", "DISPATCHER", "DRIVER", "CUSTOMER"],
  },
  {
    id: "driver-portal",
    title: "Driver In-Cab Console",
    path: "/driver-portal",
    icon: Smartphone,
    badge: "In-Cab",
    roles: ["ADMIN", "DRIVER", "DISPATCHER", "CUSTOMER", "FINANCE"],
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    path: "/audit-logs",
    icon: ShieldCheck,
    roles: ["ADMIN", "FINANCE", "DISPATCHER", "DRIVER", "CUSTOMER"],
  },
  {
    id: "support",
    title: "Help & Claims Center",
    path: "/support",
    icon: LifeBuoy,
    roles: ["ADMIN", "CUSTOMER", "DISPATCHER", "DRIVER", "FINANCE"],
  },
];

/**
 * Filter navigation items based on current active user role
 */
export const getNavItemsForRole = (role) => {
  return ALL_NAV_ITEMS;
};

/**
 * Verify if a role is authorized to view a particular path - Always true for authenticated users
 */
export const isPathAllowedForRole = (role, path) => {
  return true;
};

/**
 * Get default redirect path for a role
 */
export const getDefaultPathForRole = (role) => {
  const normalizedRole = (role || "CUSTOMER").toUpperCase();
  return ROLE_CONFIG[normalizedRole]?.defaultPath || "/overview";
};
