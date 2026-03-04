import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User,
  BarChart3,
  Heart,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getSession, getUserEmail, getAccessToken } from "@/lib/auth";

interface MedicalCase {
  id: number;
  patient_full_name: string;
  disease: string;
  hospital: number;
  hospital_name?: string;
  required_funding: number;
  estimated_cost: number;
  status: string;
  created_at: string;
  ai_credibility_score?: number;
  ai_recommendation?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(getSession());
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication on mount
    const session = getSession();
    const email = getUserEmail();
    setCurrentSession(session);
    setUserEmail(email);
    setIsLoading(false);

    // Redirect to login if not authenticated or wrong role
    if (!session || session.userType !== "user") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch user's medical cases
  useEffect(() => {
    const fetchUserCases = async () => {
      setCasesLoading(true);
      setCasesError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          setCasesError("No authentication token found");
          setCasesLoading(false);
          return;
        }

        const res = await fetch(
          "http://localhost:8000/api/medical-cases/my-cases/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          const data = await res.json();
          setCasesError(
            data.detail || data.message || "Failed to fetch your cases",
          );
          setCasesLoading(false);
          return;
        }

        const data = await res.json();
        setCases(data);
      } catch (err: any) {
        console.error("Error fetching cases:", err);
        setCasesError(err.message || "Error loading your cases");
      } finally {
        setCasesLoading(false);
      }
    };

    if (currentSession && currentSession.userType === "user") {
      fetchUserCases();
    }
  }, [currentSession]);

  useEffect(() => {
    // Update loading state when session changes
    if ((!currentSession || currentSession.userType !== "user") && !isLoading) {
      navigate("/login");
    }
  }, [currentSession, navigate, isLoading]);

  useEffect(() => {
    // Listen for session changes
    const onSessionChange = (e: any) => {
      setCurrentSession(e.detail);
    };
    window.addEventListener("jh:session-changed", onSessionChange);
    return () =>
      window.removeEventListener("jh:session-changed", onSessionChange);
  }, []);

  if (!currentSession) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back to JeevanDhara
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info Card */}
        <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Your Profile
              </h2>
              <p className="text-sm text-muted-foreground">
                You are authenticated and logged in
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Email</p>
              <p className="text-sm font-semibold text-foreground">
                {userEmail || "Loading..."}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                User ID
              </p>
              <p className="text-sm font-semibold text-foreground">
                {currentSession?.userId || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`grid md:grid-cols-3 gap-6 mb-8`}>
          {/* Register Medical Case */}
          <div
            className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer border-accent/30 hover:border-accent/60"
            onClick={() => navigate("/register-case")}
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Register Medical Case
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Submit a new medical case for verification and funding
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:bg-accent/10"
            >
              Register Now →
            </Button>
          </div>

          <div
            className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/cases")}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Verified Cases
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse and support verified medical cases
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
            >
              View Cases →
            </Button>
          </div>

          {/* Transparency */}
          <div
            className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/transparency")}
          >
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View funding details and reports
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-success hover:bg-success/10"
            >
              View Report →
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Welcome to JeevanDhara
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            A verified medical funding platform dedicated to supporting patients
            in need. Browse cases, contribute to medical expenses, and make a
            difference.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            Return to Home
          </Button>
        </div>

        {/* Your Uploaded Cases Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Your Uploaded Cases
          </h2>

          {casesLoading ?
            <div className="flex items-center justify-center py-12 bg-white border border-border rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Loading your cases...</p>
              </div>
            </div>
          : casesError ?
            <div className="bg-white border border-destructive/30 rounded-lg p-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Error loading cases
                </p>
                <p className="text-sm text-muted-foreground">{casesError}</p>
              </div>
            </div>
          : cases.length === 0 ?
            <div className="bg-white border border-dashed border-border rounded-lg p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                You haven't uploaded any cases yet.
              </p>
              <Button
                onClick={() => navigate("/register-case")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Register Your First Case
              </Button>
            </div>
          : <div className="grid gap-6">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {caseItem.patient_full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {caseItem.disease}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                            caseItem.status === "approved" ?
                              "bg-success/10 text-success"
                            : caseItem.status === "rejected" ?
                              "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                          }`}
                        >
                          {caseItem.status?.charAt(0).toUpperCase() +
                            caseItem.status?.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Estimated Cost:
                          </span>
                          <span className="font-semibold text-foreground">
                            ₹{caseItem.estimated_cost?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Required Funding:
                          </span>
                          <span className="font-semibold text-foreground">
                            ₹{caseItem.required_funding?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      {caseItem.ai_credibility_score !== undefined && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">
                              AI Credibility Score
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-accent"
                                  style={{
                                    width: `${caseItem.ai_credibility_score}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {caseItem.ai_credibility_score}%
                              </span>
                            </div>
                          </div>

                          {caseItem.ai_recommendation && (
                            <div>
                              <p className="text-xs text-muted-foreground font-medium mb-1">
                                AI Recommendation
                              </p>
                              <p className="text-sm text-foreground">
                                {caseItem.ai_recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-4">
                        Uploaded on{" "}
                        {new Date(caseItem.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
