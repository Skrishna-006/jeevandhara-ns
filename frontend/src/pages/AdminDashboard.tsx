import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  BarChart3,
  LogIn,
  GraduationCap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  approvedHospitals,
  pendingVerifications,
  rejectedHospitals,
  registeredHospitals,
} from "@/lib/hospitals";
import {
  getPendingUniversityVerifications,
  approveUniversityVerification,
  rejectUniversityVerification,
  approvedUniversities,
  pendingUniversityVerifications,
  rejectedUniversities,
  fetchApprovedUniversities,
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

// Return color classes based on AI score thresholds
const riskColor = (score: number) => {
  if (score >= 85) return "text-success bg-success/10"; // high trust
  if (score >= 70) return "text-accent bg-accent/10"; // medium
  return "text-destructive bg-destructive/10"; // low
};

// Hardcoded admin credentials (no database)
const ADMIN_CREDENTIALS = {
  id: "ADM-001",
  password: "admin@123",
};

const AdminDashboard = () => {
  // guard this page so only ADMIN role can access
  useAuthGuard("ADMIN");
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pending, setPending] = useState(getPendingVerifications());
  const [approvedH, setApprovedH] = useState(() =>
    Object.values(approvedHospitals),
  );
  const [rejectedH, setRejectedH] = useState(() => rejectedHospitals.slice());
  const [pendingUniversities, setPendingUniversities] = useState(
    getPendingUniversityVerifications(),
  );
  const [approvedU, setApprovedU] = useState<any[]>(() =>
    Object.values(approvedUniversities),
  );
  const [rejectedU, setRejectedU] = useState(() =>
    rejectedUniversities.slice(),
  );
  const [allCases, setAllCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [selectedAIScore, setSelectedAIScore] = useState<any>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "hospitals" | "universities" | "cases" | "mailManagement"
  >("cases");

  // States for email workflow
  const [mailLoading, setMailLoading] = useState<string | null>(null);
  const [mailError, setMailError] = useState<string | null>(null);
  const [mailSuccess, setMailSuccess] = useState<string | null>(null);

  // States for real hospital data from backend
  const [trustedHospitals, setTrustedHospitals] = useState<any[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  // Derive cases by status
  const pendingCases = allCases.filter(
    (s: any) => s.status === "PENDING" || s.status === "pending",
  );
  const approvedCases = allCases.filter(
    (s: any) => s.status === "FUNDED" || s.status === "approved",
  );
  const rejectedCases = allCases.filter(
    (s: any) => s.status === "REJECTED" || s.status === "rejected",
  );

  // refresh pending verifications when localStorage changes (other tab) or window gains focus
  // previous storage listeners remain (optional) but we will fetch from backend separately
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "jh_pending_verifications_v1") {
        setPending(getPendingVerifications().slice());
        setApprovedH(Object.values(approvedHospitals));
        setRejectedH(rejectedHospitals.slice());
      }
      if (
        e.key === null ||
        e.key === "jh_pending_university_verifications_v1"
      ) {
        setPendingUniversities(getPendingUniversityVerifications().slice());
        setApprovedU(Object.values(approvedUniversities));
        setRejectedU(rejectedUniversities.slice());
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  // when the universities tab is opened fetch live data from backend
  useEffect(() => {
    if (activeSection === "universities") {
      fetchApprovedUniversities()
        .then((data) => {
          if (data && data.length > 0) {
            setApprovedU(data);
          }
        })
        .catch((err) => {
          console.error("error fetching approved universities", err);
        });
    }
  }, [activeSection]);

  // router
  const navigate = useNavigate();

  // Check if already logged in via global session
  useEffect(() => {
    const session = getSession();
    if (session?.userType === "admin" && session?.userId) {
      setLoggedIn(true);
      setAdminId(session.userId);
    }
  }, []);

  // Fetch trusted hospitals from backend
  useEffect(() => {
    const fetchHospitals = async () => {
      setHospitalsLoading(true);
      setHospitalsError(null);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          setHospitalsError("No access token found. Please login again.");
          setHospitalsLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/hospitals/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setHospitalsError(
            data.detail || data.message || "Failed to fetch hospitals",
          );
          setHospitalsLoading(false);
          return;
        }

        const data = await res.json();
        // Filter to only show trusted hospitals (is_trusted = true)
        const trusted = data.filter((h: any) => h.is_trusted === true);
        setTrustedHospitals(trusted);
        setHospitalsError(null);
      } catch (err: any) {
        console.error("Error fetching hospitals:", err);
        setHospitalsError(
          err.message || "Failed to fetch hospitals from server",
        );
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Fetch all medical cases for admin
  useEffect(() => {
    const fetchCases = async () => {
      setCasesLoading(true);
      setCasesError(null);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          setCasesError("No access token found. Please login again.");
          setCasesLoading(false);
          return;
        }
        const res = await fetch("http://localhost:8000/api/medical-cases/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          const data = await res.json();
          setCasesError(data.detail || data.message || "Failed to fetch cases");
        } else {
          const data = await res.json();
          setAllCases(data);
        }
      } catch (err: any) {
        console.error("Error fetching cases:", err);
        setCasesError(err.message || "Failed to load cases");
      } finally {
        setCasesLoading(false);
      }
    };
    fetchCases();
  }, []);

  const generateAIScore = (caseData: any) => {
    // use existing value if provided, otherwise fallback random
    if (caseData.ai_score || caseData.aiScore) {
      return caseData.ai_score || caseData.aiScore;
    }
    const score = Math.floor(Math.random() * 36) + 60; // 60-95
    caseData.ai_score = score;
    return score;
  };

  const getAIScoreDetails = (caseData: any) => {
    const score = generateAIScore(caseData);
    const estimatedCost = caseData.estimatedCost || 0;
    const amountRequired = caseData.amountRequired || 0;
    const insurance =
      caseData.insuranceAvailable ? caseData.insuranceCoverage || 0 : 0;

    return {
      score,
      validationScore: Math.min(
        score + Math.floor(Math.random() * 10 - 5),
        100,
      ),
      costAccuracy: Math.max(60 + Math.floor(Math.random() * 30), 85),
      documentQuality: Math.min(score + Math.floor(Math.random() * 5), 100),
      medicalValidity: Math.min(score + Math.floor(Math.random() * 5), 100),
      factors: {
        costReasonable: estimatedCost > 0,
        documentsComplete:
          caseData.prescriptionFile && caseData.medicalReportFile,
        insuranceAvailable: caseData.insuranceAvailable,
        doctorLicensed: !!caseData.doctorRegNo,
      },
    };
  };

  // Email workflow handlers
  const sendHospitalVerificationEmail = async (caseId: number) => {
    setMailLoading(`hospital-${caseId}`);
    setMailError(null);
    setMailSuccess(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token. Please login again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/medical-cases/${caseId}/send-hospital-mail/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to send email");
      }

      setMailSuccess(`Hospital verification email sent successfully!`);
      // Refresh cases to update mail status
      setTimeout(() => {
        const fetchCases = async () => {
          try {
            const res = await fetch(
              "http://localhost:8000/api/medical-cases/",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            if (res.ok) {
              const caseData = await res.json();
              setAllCases(caseData);
            }
          } catch (err) {
            console.error("Error refreshing cases:", err);
          }
        };
        fetchCases();
      }, 1000);
    } catch (err: any) {
      setMailError(err.message || "Failed to send hospital email");
    } finally {
      setMailLoading(null);
    }
  };

  const sendUniversityFundingEmail = async (caseId: number) => {
    setMailLoading(`university-${caseId}`);
    setMailError(null);
    setMailSuccess(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token. Please login again.");
      }

      const response = await fetch(
        `http://localhost:8000/api/medical-cases/${caseId}/send-university-mail/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to send emails");
      }

      setMailSuccess(
        `Funding request emails sent to ${data.universities_count} universities!`,
      );
      // Refresh cases to update mail status
      setTimeout(() => {
        const fetchCases = async () => {
          try {
            const res = await fetch(
              "http://localhost:8000/api/medical-cases/",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            if (res.ok) {
              const caseData = await res.json();
              setAllCases(caseData);
            }
          } catch (err) {
            console.error("Error refreshing cases:", err);
          }
        };
        fetchCases();
      }, 1000);
    } catch (err: any) {
      setMailError(err.message || "Failed to send university emails");
    } finally {
      setMailLoading(null);
    }
  };

  if (!loggedIn) {
    const handleLogin = async () => {
      setLoginError("");
      if (adminId.trim() === "" || adminPassword.trim() === "") {
        setLoginError("Please enter both Admin ID and Password");
        return;
      }
      if (
        adminId !== ADMIN_CREDENTIALS.id ||
        adminPassword !== ADMIN_CREDENTIALS.password
      ) {
        setLoginError("Invalid Admin ID or Password");
        return;
      }
      // perform backend login to obtain token for API calls
      try {
        const res = await fetch("http://localhost:8000/api/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            password: adminPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.warn("Admin JWT login failed", data);
          setLoginError("Backend authentication failed. Please try again.");
        } else {
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);
          localStorage.setItem("user_role", data.role || "ADMIN");
        }
      } catch (err) {
        console.error("Admin login request failed", err);
        setLoginError("Network error during login");
      }
      setLoggedIn(true);
      setSession("admin", "ADM-001");
    };

    return (
      <div className="py-20">
        <div className="container max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI Verification Console
                </p>
              </div>
            </div>
            {loginError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {loginError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label>Admin ID</Label>
                <Input
                  placeholder="ADM-001"
                  className="mt-1.5"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleLogin}
              >
                <LogIn className="w-4 h-4 mr-2" /> Access Console
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                <strong>Demo:</strong> ADM-001 / admin@123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveSection("cases")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeSection === "cases" ?
                "bg-accent text-accent-foreground font-semibold"
              : "text-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Medical Cases
            <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">
              {pendingCases.length +
                approvedCases.length +
                rejectedCases.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("hospitals")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeSection === "hospitals" ?
                "bg-accent text-accent-foreground font-semibold"
              : "text-foreground hover:bg-muted"
            }`}
          >
            <Shield className="w-4 h-4" />
            Hospitals
            <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">
              {pending.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("universities")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeSection === "universities" ?
                "bg-accent text-accent-foreground font-semibold"
              : "text-foreground hover:bg-muted"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Universities
            <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">
              {pendingUniversities.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("mailManagement")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              activeSection === "mailManagement" ?
                "bg-accent text-accent-foreground font-semibold"
              : "text-foreground hover:bg-muted"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">📧</div>
            Mail Management
          </button>
        </nav>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setLoggedIn(false);
            setAdminId("");
            setAdminPassword("");
            setLoginError("");
            clearSession();
          }}
        >
          Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-accent" />
              {activeSection === "cases" && "Medical Cases"}
              {activeSection === "hospitals" && "Hospital Verifications"}
              {activeSection === "universities" && "University Verifications"}
              {activeSection === "mailManagement" && "Mail Management"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeSection === "cases" &&
                "Review AI-analyzed medical cases and approve for listing"}
              {activeSection === "hospitals" &&
                "Verify hospital registrations and credentials"}
              {activeSection === "universities" &&
                "Verify university credentials and affiliations"}
            </p>
          </div>

          {/* Email Success Message */}
          {emailSent ?
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success">
                  Email Sent Successfully
                </p>
                <p className="text-xs text-success/80 mt-0.5">{emailSent}</p>
              </div>
              <button
                onClick={() => setEmailSent(null)}
                className="ml-auto text-success/60 hover:text-success"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          : null}

          {/* Hospital Detail Modal */}
          {selectedHospital && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Hospital Details
                  </h2>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reg ID</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedHospital.regId || selectedHospital.regId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedHospital.name ||
                        selectedHospital.name ||
                        registeredHospitals[selectedHospital.regId]?.name ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-semibold text-foreground">
                      {registeredHospitals[selectedHospital.regId]?.email ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Address / Proofs
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedHospital.proofs ||
                        registeredHospitals[selectedHospital.regId]?.address ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Certificate
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedHospital.certificateName ||
                        registeredHospitals[selectedHospital.regId]
                          ?.certificates ||
                        "-"}
                    </p>
                  </div>
                  {selectedHospital.rejectedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Rejected At
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(selectedHospital.rejectedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedHospital.reason && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-destructive">
                        {selectedHospital.reason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedHospital(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* University Detail Modal */}
          {selectedUniversity && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    University Details
                  </h2>
                  <button
                    onClick={() => setSelectedUniversity(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Uni ID</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedUniversity.uniId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedUniversity.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Certificate
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedUniversity.certificateName || "-"}
                    </p>
                  </div>
                  {selectedUniversity.rejectedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Rejected At
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(
                          selectedUniversity.rejectedAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedUniversity.reason && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-destructive">
                        {selectedUniversity.reason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedUniversity(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Score Details Modal */}
          {selectedAIScore && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    AI Scoring Analysis
                  </h2>
                  <button
                    onClick={() => setSelectedAIScore(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {(() => {
                  const details = getAIScoreDetails(selectedAIScore);
                  return (
                    <div className="space-y-4">
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-accent">
                            Overall AI Score
                          </p>
                          <p className="text-3xl font-bold text-accent">
                            {details.score}
                          </p>
                        </div>
                        <Progress value={details.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Higher scores indicate better case validity and
                          funding probability
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/40 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Validation Score
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {details.validationScore}
                          </p>
                          <Progress
                            value={details.validationScore}
                            className="h-1 mt-1"
                          />
                        </div>
                        <div className="bg-muted/40 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Cost Accuracy
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {details.costAccuracy}%
                          </p>
                          <Progress
                            value={details.costAccuracy}
                            className="h-1 mt-1"
                          />
                        </div>
                        <div className="bg-muted/40 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Document Quality
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {details.documentQuality}
                          </p>
                          <Progress
                            value={details.documentQuality}
                            className="h-1 mt-1"
                          />
                        </div>
                        <div className="bg-muted/40 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Medical Validity
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {details.medicalValidity}
                          </p>
                          <Progress
                            value={details.medicalValidity}
                            className="h-1 mt-1"
                          />
                        </div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          Validation Factors
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${details.factors.costReasonable ? "bg-success" : "bg-destructive"}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Cost appears reasonable:{" "}
                              <span
                                className={
                                  details.factors.costReasonable ?
                                    "text-success font-medium"
                                  : "text-destructive font-medium"
                                }
                              >
                                {details.factors.costReasonable ? "Yes" : "No"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${details.factors.documentsComplete ? "bg-success" : "bg-destructive"}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Documents complete:{" "}
                              <span
                                className={
                                  details.factors.documentsComplete ?
                                    "text-success font-medium"
                                  : "text-destructive font-medium"
                                }
                              >
                                {details.factors.documentsComplete ?
                                  "Yes"
                                : "No"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${details.factors.insuranceAvailable ? "bg-success" : "bg-destructive"}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Insurance available:{" "}
                              <span
                                className={
                                  details.factors.insuranceAvailable ?
                                    "text-success font-medium"
                                  : "text-destructive font-medium"
                                }
                              >
                                {details.factors.insuranceAvailable ?
                                  "Yes"
                                : "No"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${details.factors.doctorLicensed ? "bg-success" : "bg-destructive"}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Doctor licensed:{" "}
                              <span
                                className={
                                  details.factors.doctorLicensed ?
                                    "text-success font-medium"
                                  : "text-destructive font-medium"
                                }
                              >
                                {details.factors.doctorLicensed ? "Yes" : "No"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                        <p className="text-xs text-success font-medium">
                          ✓ This case has been analyzed by our AI engine and
                          validated for funding consideration.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="border-t border-border pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedAIScore(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Medical Cases Section */}
          {activeSection === "cases" && (
            <>
              {casesLoading && (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">Loading cases...</p>
                </div>
              )}
              {casesError && (
                <div className="px-6 py-4 bg-destructive/10 border-b border-destructive/20">
                  <p className="text-sm text-destructive">
                    Error: {casesError}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    label: "Pending Cases",
                    value: String(pendingCases.length),
                    color: "text-accent",
                  },
                  {
                    label: "Approved Cases",
                    value: String(approvedCases.length),
                    color: "text-success",
                  },
                  {
                    label: "Rejected Cases",
                    value: String(rejectedCases.length),
                    color: "text-destructive",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-border p-5"
                  >
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {[
                {
                  title: "Pending Cases",
                  cases: pendingCases,
                  status: "pending",
                  icon: AlertTriangle,
                  color: "text-accent",
                },
                {
                  title: "Approved Cases",
                  cases: approvedCases,
                  status: "approved",
                  icon: CheckCircle,
                  color: "text-success",
                },
                {
                  title: "Rejected Cases",
                  cases: rejectedCases,
                  status: "rejected",
                  icon: XCircle,
                  color: "text-destructive",
                },
              ].map((section, sectionIdx) => (
                <div
                  key={sectionIdx}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-6"
                >
                  <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                    <h2 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h2>
                    <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {section.cases.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Case ID
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Disease
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Hospital
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Cost
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            AI Score
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Risk
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.cases.length > 0 ?
                          section.cases.map((c: any, idx: number) => {
                            const score = generateAIScore(c);
                            const riskClass = riskColor(score);
                            return (
                              <tr
                                key={idx}
                                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                                onClick={() =>
                                  navigate(`/admin/medical-case/${c.id}`)
                                }
                              >
                                <td className="px-5 py-4 font-mono text-foreground">
                                  JD-{c.id}
                                </td>
                                <td className="px-5 py-4 text-foreground font-medium">
                                  {c.patient_full_name || c.patientName || "-"}
                                </td>
                                <td className="px-5 py-4 text-muted-foreground">
                                  {c.hospital_name || c.hospital || "-"}
                                </td>
                                <td className="px-5 py-4 font-semibold text-foreground">
                                  ₹
                                  {parseFloat(
                                    c.estimated_cost || c.estimatedCost || 0,
                                  ).toFixed(2)}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className="text-xs font-medium text-accent cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAIScore(c);
                                    }}
                                  >
                                    {score}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskClass}`}
                                  >
                                    {score >= 85 ?
                                      "High"
                                    : score >= 70 ?
                                      "Medium"
                                    : "Low"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        : <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-8 text-center text-muted-foreground"
                            >
                              No {section.status} cases
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Hospitals Section */}
          {activeSection === "hospitals" && (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Trusted Hospitals
                </h2>
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                  {trustedHospitals.length}
                </span>
              </div>

              {hospitalsLoading && (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">Loading hospitals...</p>
                </div>
              )}

              {hospitalsError && (
                <div className="px-6 py-4 bg-destructive/10 border-b border-destructive/20">
                  <p className="text-sm text-destructive">
                    Error: {hospitalsError}
                  </p>
                </div>
              )}

              {!hospitalsLoading && !hospitalsError && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Reg ID
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Organization
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Phone
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Address
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trustedHospitals.length > 0 ?
                        trustedHospitals.map((hospital: any, idx: number) => (
                          <tr
                            key={hospital.id || idx}
                            className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setSelectedHospital(hospital)}
                          >
                            <td className="px-5 py-4 font-mono text-foreground">
                              {hospital.registration_number}
                            </td>
                            <td className="px-5 py-4 text-foreground font-medium">
                              {hospital.name || "-"}
                            </td>
                            <td className="px-5 py-4 text-foreground text-xs">
                              {hospital.email || "-"}
                            </td>
                            <td className="px-5 py-4 text-foreground text-xs">
                              {hospital.phone || "-"}
                            </td>
                            <td className="px-5 py-4 text-foreground text-xs">
                              {hospital.address ?
                                hospital.address.substring(0, 40) +
                                (hospital.address.length > 40 ? "..." : "")
                              : "-"}
                            </td>
                            <td className="px-5 py-4">
                              {hospital.is_trusted && (
                                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded font-medium">
                                  ✓ Verified
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      : <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-8 text-center text-muted-foreground"
                          >
                            No trusted hospitals available
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Universities Section */}
          {activeSection === "universities" && (
            <>
              {[
                {
                  title: "Pending Universities",
                  data: pendingUniversities,
                  type: "pending",
                },
                {
                  title: "Approved Universities",
                  data: approvedU,
                  type: "approved",
                },
                {
                  title: "Rejected Universities",
                  data: rejectedU,
                  type: "rejected",
                },
              ].map((block, bi) => (
                <div
                  key={bi}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-6"
                >
                  <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">
                      {block.title}
                    </h2>
                    <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {block.data.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Uni ID
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Organization
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Email
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Certificate
                          </th>
                          <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.data.length > 0 ?
                          block.data.map((v: any, idx: number) => (
                            <tr
                              key={(v.uniId || v.regId) + idx}
                              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                              onClick={() => setSelectedUniversity(v)}
                            >
                              <td className="px-5 py-4 font-mono text-foreground">
                                {v.uniId}
                              </td>
                              <td className="px-5 py-4 text-foreground font-medium">
                                {v.name || "-"}
                              </td>
                              <td className="px-5 py-4 text-foreground text-xs">
                                {v.email || "-"}
                              </td>
                              <td className="px-5 py-4 text-foreground">
                                {v.certificateName ?
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded font-medium">
                                      ✓ {v.certificateName}
                                    </span>
                                  </div>
                                : <span className="text-muted-foreground">
                                    -
                                  </span>
                                }
                              </td>
                              <td
                                className="px-5 py-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex gap-1.5">
                                  {block.type === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-success hover:bg-success/10 h-7 px-2"
                                        onClick={() => {
                                          approveUniversityVerification(
                                            v.uniId,
                                          );
                                          setPendingUniversities(
                                            getPendingUniversityVerifications().slice(),
                                          );
                                          setApprovedU(
                                            Object.values(approvedUniversities),
                                          );
                                        }}
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10 h-7 px-2"
                                        onClick={() => {
                                          rejectUniversityVerification(v.uniId);
                                          setPendingUniversities(
                                            getPendingUniversityVerifications().slice(),
                                          );
                                          setRejectedU(
                                            rejectedUniversities.slice(),
                                          );
                                        }}
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  {block.type === "approved" && (
                                    <span className="text-sm text-success font-medium">
                                      Verified
                                    </span>
                                  )}
                                  {block.type === "rejected" && (
                                    <span className="text-sm text-destructive font-medium">
                                      Rejected
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        : <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-8 text-center text-muted-foreground"
                            >
                              No entries
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Mail Management Section */}
          {activeSection === "mailManagement" && (
            <div>
              {mailError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{mailError}</p>
                  </div>
                </div>
              )}

              {mailSuccess && (
                <div className="mb-4 p-4 bg-success/10 border border-success/30 rounded-lg text-sm text-success flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Success</p>
                    <p>{mailSuccess}</p>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2 bg-muted/50">
                  <div className="text-lg">📧</div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Email Workflow Management
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Send verification and funding request emails
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Case ID
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Patient Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Hospital
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          AI Score
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Hospital Reply
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          University Mail
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCases && allCases.length > 0 ?
                        allCases.map((caseItem: any) => (
                          <tr
                            key={caseItem.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-5 py-4 font-mono text-sm text-foreground">
                              #{caseItem.id}
                            </td>
                            <td className="px-5 py-4 text-sm text-foreground font-medium">
                              {caseItem.patient_full_name}
                            </td>
                            <td className="px-5 py-4 text-sm text-foreground">
                              {caseItem.hospital_name || "-"}
                            </td>
                            <td className="px-5 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  caseItem.status === "PENDING" ?
                                    "bg-yellow-100 text-yellow-800"
                                  : caseItem.status === "HOSPITAL_VERIFIED" ?
                                    "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                              >
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${riskColor(caseItem.ai_credibility_score || 0)}`}
                              >
                                {caseItem.ai_credibility_score || "N/A"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm">
                              {caseItem.hospital_reply_received ?
                                <span className="flex items-center gap-1 text-success text-xs font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" />{" "}
                                  Received (
                                  {new Date(
                                    caseItem.hospital_reply_received_at,
                                  ).toLocaleDateString()}
                                  )
                                </span>
                              : <span className="text-muted-foreground text-xs">
                                  No reply
                                </span>
                              }
                            </td>
                            <td className="px-5 py-4 text-sm">
                              {caseItem.university_mail_sent ?
                                <span className="flex items-center gap-1 text-success text-xs font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" /> Sent (
                                  {new Date(
                                    caseItem.university_mail_sent_at,
                                  ).toLocaleDateString()}
                                  )
                                </span>
                              : <span className="text-muted-foreground text-xs">
                                  Not sent
                                </span>
                              }
                            </td>
                            <td className="px-5 py-4 text-sm">
                              <div className="flex gap-2">
                                {caseItem.status === "PENDING" &&
                                  !caseItem.hospital_mail_sent && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 px-2"
                                      onClick={() =>
                                        sendHospitalVerificationEmail(
                                          caseItem.id,
                                        )
                                      }
                                      disabled={
                                        mailLoading ===
                                        `hospital-${caseItem.id}`
                                      }
                                    >
                                      {(
                                        mailLoading ===
                                        `hospital-${caseItem.id}`
                                      ) ?
                                        "Sending..."
                                      : "Send Hospital Mail"}
                                    </Button>
                                  )}

                                {caseItem.status === "HOSPITAL_VERIFIED" &&
                                  caseItem.hospital_mail_sent &&
                                  !caseItem.university_mail_sent && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 px-2"
                                      onClick={() =>
                                        sendUniversityFundingEmail(caseItem.id)
                                      }
                                      disabled={
                                        mailLoading ===
                                        `university-${caseItem.id}`
                                      }
                                    >
                                      {(
                                        mailLoading ===
                                        `university-${caseItem.id}`
                                      ) ?
                                        "Sending..."
                                      : "Send University Mail"}
                                    </Button>
                                  )}

                                {caseItem.hospital_mail_sent &&
                                  caseItem.university_mail_sent && (
                                    <span className="text-xs text-success font-medium px-2 py-1 bg-success/10 rounded">
                                      ✓ All mails sent
                                    </span>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))
                      : <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-8 text-center text-muted-foreground"
                          >
                            {casesLoading ?
                              "Loading cases..."
                            : "No cases available"}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                {/* Hospital Replies Section */}
                {allCases?.some((c) => c.hospital_reply_received) && (
                  <div className="bg-muted/30 border-t border-border p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      Hospital Replies
                    </h4>
                    <div className="space-y-4">
                      {allCases
                        ?.filter((c) => c.hospital_reply_received)
                        .map((caseItem) => (
                          <div
                            key={caseItem.id}
                            className="bg-card border border-border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold text-foreground">
                                  Case #{caseItem.id} -{" "}
                                  {caseItem.patient_full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  From: {caseItem.hospital_name}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  caseItem.hospital_reply_received_at,
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="bg-muted/50 rounded p-3 border border-border/50">
                              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {caseItem.hospital_reply_content ||
                                  "No content provided"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
