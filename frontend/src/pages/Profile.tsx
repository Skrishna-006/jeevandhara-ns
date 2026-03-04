import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getSession, logout, useAuthGuard } from "@/lib/auth";

interface MedicalCase {
  id: number;
  patient_full_name: string;
  disease: string;
  hospital_name: string;
  required_funding: number;
  status: string;
  created_at: string;
}

export default function Profile() {
  // Protect this page - only normal users (role="user")
  useAuthGuard("user");

  const navigate = useNavigate();
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = getSession();

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("jh_access_token");
        if (!accessToken) {
          setError("No access token found");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "http://localhost:8000/api/medical-cases/my-cases/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.detail || data.message || "Failed to fetch cases");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setCases(data);
      } catch (err: any) {
        console.error("Error fetching cases:", err);
        setError(err.message || "Failed to fetch medical cases");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-accent/10 text-accent";
      case "HOSPITAL_VERIFIED":
        return "bg-success/10 text-success";
      case "FUNDED":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome, {session?.userId || "User"}
              </p>
            </div>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Medical Cases Section */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Medical Cases</h2>
          </div>

          {loading && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">Loading your cases...</p>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 bg-destructive/10 border-b border-destructive/20">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          {!loading && !error && cases.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No medical cases submitted yet.
              </p>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {!loading && !error && cases.length > 0 && (
            <div className="divide-y divide-border">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          Case #{caseItem.id}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                            caseItem.status,
                          )}`}
                        >
                          {caseItem.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Patient:{" "}
                        <span className="font-medium text-foreground">
                          {caseItem.patient_full_name}
                        </span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Disease:{" "}
                          </span>
                          <span className="text-foreground font-medium">
                            {caseItem.disease}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Hospital:{" "}
                          </span>
                          <span className="text-foreground font-medium">
                            {caseItem.hospital_name || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Required Funding:{" "}
                          </span>
                          <span className="text-foreground font-medium">
                            ₹
                            {Number(caseItem.required_funding).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Submitted:{" "}
                          </span>
                          <span className="text-foreground font-medium">
                            {formatDate(caseItem.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
