import { GraduationCap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  validateUniversityId,
  validateUniversityEmail,
  registerUniversity,
  authenticateUniversity,
  registeredUniversities,
} from "@/lib/universities";
import {
  setSession,
  clearSession,
  isAnyUserLoggedIn,
  getSession,
  getLoggedInUserId,
  useAuthGuard,
  logout,
} from "@/lib/auth";
import UniversityDashboardPage from "./UniversityDashboardPage";
import PaymentHistoryPage from "./PaymentHistoryPage";
import PatientReportsPage from "./PatientReportsPage";
import ProfilePage from "./ProfilePage";

type UniversityRegisterFormProps = { onRegistered: () => void };

const UniversityRegisterForm = ({
  onRegistered,
}: UniversityRegisterFormProps) => {
  useAuthGuard("UNIVERSITY");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [certificates, setCertificates] = useState("");
  const [uniId, setUniId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tryRegister = () => {
    if (!name || !email || !uniId || !password) {
      alert("Please fill required fields");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    const ok = registerUniversity({
      uniId,
      name,
      email,
      address,
      certificates,
      password,
    });
    if (ok) {
      setSubmitted(true);
      onRegistered();
    } else {
      alert("Registration failed: university already registered or pending");
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-accent/10 rounded-md text-center space-y-3">
        <div className="text-lg font-semibold text-foreground">
          ✓ Registration Submitted
        </div>
        <p className="text-sm text-muted-foreground">
          Your university registration request has been submitted to the admin
          for verification.
        </p>
        <p className="text-sm text-accent font-medium">
          Once approved, you'll be able to login with your university ID and
          password.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setAddress("");
            setCertificates("");
            setUniId("");
            setPassword("");
            setConfirm("");
          }}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>University Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>University Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@iitd.ac.in"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Verified Certificates (document)</Label>
        <Input
          type="file"
          onChange={(e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            setCertificates(f ? f.name : "");
          }}
          className="mt-1"
        />
        {certificates && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {certificates}
          </p>
        )}
      </div>
      <div>
        <Label>University ID</Label>
        <Input
          value={uniId}
          onChange={(e) => setUniId(e.target.value)}
          placeholder="UNI-2024-0001"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Confirm Password</Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground"
        onClick={tryRegister}
      >
        Create Account
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Registration requires admin approval
      </p>
    </div>
  );
};

const UniversityPortal = () => {
  // protect the page: only university users may access
  useAuthGuard("UNIVERSITY");

  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("jh_uni_logged_in") === "true";
    } catch (e) {
      return false;
    }
  });
  const [uniId, setUniId] = useState(() => {
    try {
      return localStorage.getItem("jh_uni_id") || "";
    } catch (e) {
      return "";
    }
  });
  const [uniPass, setUniPass] = useState("");
  // view controls which sidebar page is shown after login
  const [view, setView] = useState<
    "dashboard" | "payments" | "reports" | "profile"
  >("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  // if the user logs out via the navbar, clear session
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Persist loggedIn state
  useEffect(() => {
    if (loggedIn) {
      try {
        localStorage.setItem("jh_uni_logged_in", "true");
        localStorage.setItem("jh_uni_id", uniId);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem("jh_uni_logged_in");
        localStorage.removeItem("jh_uni_id");
      } catch (e) {}
    }
  }, [loggedIn, uniId]);

  // sync view with URL so sidebar links work and can be bookmarked
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes("university-dashboard")) {
      setView("dashboard");
    } else if (pathname.includes("university-payments")) {
      setView("payments");
    } else if (pathname.includes("university-reports")) {
      setView("reports");
    } else if (pathname.includes("university-profile")) {
      setView("profile");
    } else if (pathname.endsWith("/university")) {
      setView("dashboard");
    }
  }, [location.pathname]);

  // Check if already logged in via global session
  useEffect(() => {
    const session = getSession();
    if (session?.userType === "university" && session?.userId) {
      setLoggedIn(true);
      setUniId(session.userId);
    }
  }, []);

  // sample static data used by all sections
  const approvedPatients = [
    {
      name: "Meena Devi",
      hospital: "Fortis Hospital",
      amount: "₹60,000",
      status: "Approved",
    },
    {
      name: "Anjali Verma",
      hospital: "Max Healthcare",
      amount: "₹45,000",
      status: "Approved",
    },
    {
      name: "Ravi Kumar",
      hospital: "City Hospital",
      amount: "₹75,000",
      status: "Approved",
    },
  ];
  const paymentHistory = [
    {
      date: "2026-02-20",
      patient: "Meena Devi",
      amount: "₹60,000",
      status: "Paid",
    },
    {
      date: "2026-02-18",
      patient: "Anjali Verma",
      amount: "₹45,000",
      status: "Paid",
    },
    {
      date: "2026-02-15",
      patient: "Ravi Kumar",
      amount: "₹75,000",
      status: "Paid",
    },
  ];
  const reports = [
    { caseId: "JD-2847", hospital: "AIIMS Delhi", report: "View" },
    { caseId: "JD-2845", hospital: "CMC Vellore", report: "View" },
  ];
  const profileInfo = {
    university: "IIT Delhi",
    contact: "contact@iitd.ac.in",
    phone: "+91 11 2659 7135",
  };

  // helper to render sidebar content using dedicated page components
  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <UniversityDashboardPage />;

      case "payments":
        return <PaymentHistoryPage />;

      case "reports":
        return <PatientReportsPage />;

      case "profile":
        return <ProfilePage />;

      default:
        return null;
    }
  };

  const [mode, setMode] = useState<"login" | "register">("login");

  // Show login screen if not logged in and viewing root /university path
  if (!loggedIn && location.pathname === "/university") {
    return (
      <div className="py-10">
        <div className="container max-w-3xl">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  University Login / Register
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sign in with your University ID or create a new account
                </p>
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="flex space-x-2 mb-6">
              <button
                className={`px-4 py-2 rounded ${
                  mode === "login" ?
                    "bg-primary text-primary-foreground"
                  : "bg-muted/10"
                }`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  mode === "register" ?
                    "bg-primary text-primary-foreground"
                  : "bg-muted/10"
                }`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            {mode === "login" ?
              <div className="p-4 bg-muted/10 rounded-md">
                <h2 className="font-semibold mb-3">University Login</h2>
                <div className="space-y-3">
                  <div>
                    <Label>University ID</Label>
                    <Input
                      value={uniId}
                      onChange={(e) => setUniId(e.target.value)}
                      placeholder="UNI-2024-0001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      id="university-pass"
                      value={uniPass}
                      onChange={(e) => setUniPass(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={() => {
                      if (!uniId || !uniPass) {
                        alert("Please enter university ID and password");
                        return;
                      }
                      if (authenticateUniversity(uniId, uniPass)) {
                        setLoggedIn(true);
                        setSession("university", uniId);
                        navigate("/university-dashboard");
                      } else {
                        alert(
                          "ℹ️ Invalid credentials OR your registration is pending admin approval.\n\nIf you just registered, please wait for admin verification before logging in.",
                        );
                      }
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Demo: Try UNI-2024-0001 / admin123 (pre-approved)
                </p>
              </div>
            : <div className="p-4 bg-muted/10 rounded-md">
                <h2 className="font-semibold mb-3">University Registration</h2>
                <UniversityRegisterForm onRegistered={() => setMode("login")} />
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if logged in
  if (loggedIn) {
    return (
      <div className="flex min-h-screen">
        {/* sidebar */}
        <nav className="w-64 bg-slate-50 border-r border-border p-6">
          <h2 className="text-lg font-bold mb-6">College Management</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <button
                className={`w-full text-left ${view === "dashboard" ? "font-semibold text-accent" : ""}`}
                onClick={() => navigate("/university-dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left ${view === "payments" ? "font-semibold text-accent" : ""}`}
                onClick={() => navigate("/university-payments")}
              >
                Payment History
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left ${view === "reports" ? "font-semibold text-accent" : ""}`}
                onClick={() => navigate("/university-reports")}
              >
                Patient Reports
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left ${view === "profile" ? "font-semibold text-accent" : ""}`}
                onClick={() => navigate("/university-profile")}
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
        {/* main content */}
        <main className="flex-1 p-8 bg-white">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">
              {view === "dashboard" ?
                "Dashboard"
              : view.charAt(0).toUpperCase() + view.slice(1).replace(/s$/, "")}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoggedIn(false);
                clearSession();
                navigate("/university");
              }}
            >
              Logout
            </Button>
          </div>
          {renderContent()}
        </main>
      </div>
    );
  }

  // Fallback: redirect to login if no match
  navigate("/university");
  return null;
};
export default UniversityPortal;
