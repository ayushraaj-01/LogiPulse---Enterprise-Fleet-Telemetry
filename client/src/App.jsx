import React, { useState } from "react";
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

// Pages
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import { Shipments } from "./pages/Shipments";
import { DispatchBoard } from "./pages/DispatchBoard";
import { Fleet } from "./pages/Fleet";
import { Drivers } from "./pages/Drivers";
import { Routes as RoutesPage } from "./pages/Routes";
import { Maintenance } from "./pages/Maintenance";
import { FuelExpenses } from "./pages/FuelExpenses";
import { Billing } from "./pages/Billing";
import { Analytics } from "./pages/Analytics";
import { AuditLogs } from "./pages/AuditLogs";
import { DriverPortal } from "./pages/DriverPortal";
import { PublicTrack } from "./pages/PublicTrack";
import { CustomerTrackOrder } from "./pages/CustomerTrackOrder";
import { CustomerBookDelivery } from "./pages/CustomerBookDelivery";
import { CustomerSupport } from "./pages/CustomerSupport";

// Protected Layout Shell Wrapper with RoleGuard
const AppLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-mono text-xs">
        Initializing LogiPulse MERN Session...
      </div>
    );
  }

  if (!isAuthenticated) {
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
            <Routes>
            {/* Public Unauthenticated Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/track/:trackingNumber" element={<PublicTrack />} />

            {/* Smart Default Landing Route */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Authenticated Dashboard Routes (Enforced by RoleGuard) */}
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

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* 24/7 AI Customer Support Chatbot Widget */}
          <CustomerChatbot />
        </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
