import React, { useState, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { RoleGuard } from "./components/RoleGuard";
import { CustomerChatbot } from "./components/CustomerChatbot";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { getDefaultPathForRole } from "./utils/rolePermissions";

// Code-Split Dynamic Route Imports for Fast Initial Page Load
const Login = React.lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const Overview = React.lazy(() => import("./pages/Overview").then((m) => ({ default: m.Overview })));
const Shipments = React.lazy(() => import("./pages/Shipments").then((m) => ({ default: m.Shipments })));
const DispatchBoard = React.lazy(() => import("./pages/DispatchBoard").then((m) => ({ default: m.DispatchBoard })));
const Fleet = React.lazy(() => import("./pages/Fleet").then((m) => ({ default: m.Fleet })));
const Drivers = React.lazy(() => import("./pages/Drivers").then((m) => ({ default: m.Drivers })));
const RoutesPage = React.lazy(() => import("./pages/Routes").then((m) => ({ default: m.Routes })));
const Maintenance = React.lazy(() => import("./pages/Maintenance").then((m) => ({ default: m.Maintenance })));
const FuelExpenses = React.lazy(() => import("./pages/FuelExpenses").then((m) => ({ default: m.FuelExpenses })));
const Billing = React.lazy(() => import("./pages/Billing").then((m) => ({ default: m.Billing })));
const Analytics = React.lazy(() => import("./pages/Analytics").then((m) => ({ default: m.Analytics })));
const AuditLogs = React.lazy(() => import("./pages/AuditLogs").then((m) => ({ default: m.AuditLogs })));
const DriverPortal = React.lazy(() => import("./pages/DriverPortal").then((m) => ({ default: m.DriverPortal })));
const PublicTrack = React.lazy(() => import("./pages/PublicTrack").then((m) => ({ default: m.PublicTrack })));
const CustomerTrackOrder = React.lazy(() => import("./pages/CustomerTrackOrder").then((m) => ({ default: m.CustomerTrackOrder })));
const CustomerBookDelivery = React.lazy(() => import("./pages/CustomerBookDelivery").then((m) => ({ default: m.CustomerBookDelivery })));
const CustomerSupport = React.lazy(() => import("./pages/CustomerSupport").then((m) => ({ default: m.CustomerSupport })));

// Ultra-fast lightweight Suspense Fallback
const PageLoadingFallback = () => (
  <div className="w-full min-h-[40vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted-foreground">
    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <span>Loading Module...</span>
  </div>
);

// Protected Layout Shell Wrapper with RoleGuard
const AppLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>
    </div>
  );
};

// Smart Role-Aware Home Redirect
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const destination = getDefaultPathForRole(user?.role);
  return <Navigate to={destination} replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollProgressBar />
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Public Unauthenticated Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/track/:trackingNumber" element={<PublicTrack />} />

                {/* Smart Default Landing Route */}
                <Route path="/" element={<HomeRedirect />} />

                {/* Authenticated Dashboard Routes */}
                <Route
                  path="/overview"
                  element={
                    <AppLayout>
                      <Overview />
                    </AppLayout>
                  }
                />
                <Route
                  path="/map"
                  element={<Navigate to="/overview" replace />}
                />
                <Route
                  path="/shipments"
                  element={
                    <AppLayout>
                      <Shipments />
                    </AppLayout>
                  }
                />
                <Route
                  path="/dispatch-board"
                  element={
                    <AppLayout>
                      <DispatchBoard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/fleet"
                  element={
                    <AppLayout>
                      <Fleet />
                    </AppLayout>
                  }
                />
                <Route
                  path="/drivers"
                  element={
                    <AppLayout>
                      <Drivers />
                    </AppLayout>
                  }
                />
                <Route
                  path="/routes"
                  element={
                    <AppLayout>
                      <RoutesPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <AppLayout>
                      <Maintenance />
                    </AppLayout>
                  }
                />
                <Route
                  path="/fuel-expenses"
                  element={
                    <AppLayout>
                      <FuelExpenses />
                    </AppLayout>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <AppLayout>
                      <Billing />
                    </AppLayout>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <AppLayout>
                      <Analytics />
                    </AppLayout>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <AppLayout>
                      <AuditLogs />
                    </AppLayout>
                  }
                />
                <Route
                  path="/driver-portal"
                  element={
                    <AppLayout>
                      <DriverPortal />
                    </AppLayout>
                  }
                />

                {/* Customer Specific Endpoints */}
                <Route
                  path="/track-order"
                  element={
                    <AppLayout>
                      <CustomerTrackOrder />
                    </AppLayout>
                  }
                />
                <Route
                  path="/book-shipment"
                  element={
                    <AppLayout>
                      <CustomerBookDelivery />
                    </AppLayout>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <AppLayout>
                      <CustomerSupport />
                    </AppLayout>
                  }
                />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>

            {/* Global Customer Support AI Chatbot Widget */}
            <CustomerChatbot />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
