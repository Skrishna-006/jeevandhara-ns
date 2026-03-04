/**
 * AuthLayout - Layout for authentication pages (Login, Register)
 * Features:
 * - No navbar, no footer
 * - Centered, minimal design
 * - Perfect for login/registration flows
 */

import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex items-center justify-center min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
