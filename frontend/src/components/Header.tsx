import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { isAuthenticated, logout, getUserRole } from "@/lib/auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/cases", label: "Verified Cases" },
  { to: "/transparency", label: "Transparency" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(getUserRole());

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated());
      setUserRole(getUserRole());
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const getDashboardUrl = () => {
    switch (userRole) {
      case "university":
        return "/university-dashboard";
      case "admin":
        return "/admin";
      case "user":
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <img
              src="/logo.jpeg"
              alt="JeevanDhara logo"
              className="w-8 h-8 object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-foreground tracking-tight">
              JeevanDhara
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              Verified Medical Funding
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            // Home link is always enabled
            if (link.to === "/") {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-white hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              );
            }

            // Protected links - only show if authenticated
            if (!authenticated) {
              return null;
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.to ?
                    "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {authenticated ?
            <>
              <Link to={getDashboardUrl()}>
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          : <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          }
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ?
            <X className="w-6 h-6" />
          : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => {
              if (link.to !== "/" && !authenticated) {
                return null;
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.to ?
                      "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/10"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {authenticated && (
              <>
                <Link
                  to={getDashboardUrl()}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}

            {!authenticated && (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-start" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
