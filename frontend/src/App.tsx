import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Index from "./pages/Index";
import VerifiedCases from "./pages/VerifiedCases";
import UniversityPortal from "./pages/UniversityPortal";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCaseDetail from "./pages/AdminCaseDetail";
import Dashboard from "./pages/Dashboard";
import RegisterCase from "./pages/RegisterCase";
import Transparency from "./pages/Transparency";
import CaseDetail from "./pages/CaseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import PatientReportsPage from "./pages/PatientReportsPage";
import ProfilePage from "./pages/ProfilePage";
import { canAccess } from "./lib/auth";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({
  element,
  requiredRole,
}: {
  element: React.ReactNode;
  requiredRole?: string;
}) => {
  if (!canAccess(requiredRole as any)) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Layout Routes (no navbar) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main Layout Routes (with navbar) */}
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<VerifiedCases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/transparency" element={<Transparency />} />

            {/* Protected Routes - General User */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route
              path="/register-case"
              element={<ProtectedRoute element={<RegisterCase />} />}
            />

            {/* Protected Routes - University */}
            <Route
              path="/university"
              element={
                <ProtectedRoute
                  element={<UniversityPortal />}
                  requiredRole="university"
                />
              }
            />
            <Route
              path="/university/dashboard"
              element={
                <ProtectedRoute
                  element={<UniversityPortal />}
                  requiredRole="university"
                />
              }
            />
            <Route
              path="/university/payments"
              element={
                <ProtectedRoute
                  element={<PaymentHistoryPage />}
                  requiredRole="university"
                />
              }
            />
            <Route
              path="/university/reports"
              element={
                <ProtectedRoute
                  element={<PatientReportsPage />}
                  requiredRole="university"
                />
              }
            />
            <Route
              path="/university/profile"
              element={
                <ProtectedRoute
                  element={<ProfilePage />}
                  requiredRole="university"
                />
              }
            />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  element={<AdminDashboard />}
                  requiredRole="admin"
                />
              }
            />
            <Route
              path="/admin/medical-case/:id"
              element={
                <ProtectedRoute
                  element={<AdminCaseDetail />}
                  requiredRole="admin"
                />
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
