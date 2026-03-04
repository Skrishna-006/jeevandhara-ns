import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/lib/auth";

const AdminCaseDetail = () => {
  useAuthGuard("admin");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCase = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jh_access_token");
      if (!token) {
        setError("No access token");
        setLoading(false);
        return;
      }
      const res = await fetch(
        `http://localhost:8000/api/medical-cases/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setCaseData(data);
      } else {
        if (res.status === 404) {
          setError("Case not found");
        } else {
          const d = await res.json();
          setError(d.detail || d.message || "Error fetching case");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
        Back
      </Button>
      {loading && <p>Loading case details...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}
      {caseData && (
        <div className="bg-card p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Case ID: JD-{caseData.id}</h2>
          <p>
            <strong>Patient Name:</strong> {caseData.patient_full_name}
          </p>
          <p>
            <strong>Hospital:</strong> {caseData.hospital_name}
          </p>
          <p>
            <strong>Disease:</strong> {caseData.disease}
          </p>
          <p>
            <strong>Treatment:</strong> {caseData.treatment_description}
          </p>
          <p>
            <strong>Required Funding:</strong> ₹{caseData.required_funding}
          </p>
          <p>
            <strong>Status:</strong> {caseData.status}
          </p>
          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(caseData.created_at).toLocaleString()}
          </p>
          <p>
            <strong>AI Score:</strong> {caseData.ai_score}
          </p>
          <div>
            <strong>Documents:</strong>
            <ul className="list-disc ml-5">
              {caseData.documents &&
                caseData.documents.map((doc: any) => (
                  <li key={doc.id}>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.document_type} (
                      {new Date(doc.uploaded_at).toLocaleDateString()})
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCaseDetail;
