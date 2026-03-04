/**
 * MainLayout - Layout for authenticated pages with navbar
 * Features:
 * - Includes header/navbar
 * - Includes footer
 * - Used for all protected and public content pages
 */

import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
