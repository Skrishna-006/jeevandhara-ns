import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface HospitalOption {
  id: number;
  name: string;
}

interface FileWithType {
  file: File;
  type: "MEDICAL" | "FINANCIAL";
}

interface MedicalCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicalCaseForm({
  onClose,
  onSuccess,
}: MedicalCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  // Patient Details
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  // Medical Details
  const [disease, setDisease] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [doctor, setDoctor] = useState("");
  const [treatment, setTreatment] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [requiredFunding, setRequiredFunding] = useState("");

  // Financial Details
  const [annualIncome, setAnnualIncome] = useState("");
  const [familyMembers, setFamilyMembers] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Salaried");
  const [governmentScheme, setGovernmentScheme] = useState(false);

  // Document uploads
  const [uploadedFiles, setUploadedFiles] = useState<FileWithType[]>([]);

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      setHospitalsLoading(true);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          setError("No access token found");
          setHospitalsLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/hospitals/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          setError("Failed to load hospitals");
          setHospitalsLoading(false);
          return;
        }

        const data = await res.json();
        setHospitals(data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
        setError("Error loading hospitals");
      } finally {
        setHospitalsLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "MEDICAL" | "FINANCIAL",
  ) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        file,
        type: docType,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const countFilesByType = (type: "MEDICAL" | "FINANCIAL"): number => {
    return uploadedFiles.filter((f) => f.type === type).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation: All required fields
    if (
      !patientName ||
      !age ||
      !contact ||
      !address ||
      !disease ||
      !hospitalId ||
      !doctor ||
      !treatment ||
      !estimatedCost ||
      !requiredFunding ||
      !annualIncome ||
      !familyMembers ||
      !employmentStatus
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Validation: Required funding <= estimated cost
    if (parseFloat(requiredFunding) > parseFloat(estimatedCost)) {
      setError("Required funding cannot exceed estimated cost");
      setLoading(false);
      return;
    }

    // Validation: At least 1 medical AND 1 financial document
    const medicalDocs = countFilesByType("MEDICAL");
    const financialDocs = countFilesByType("FINANCIAL");
    if (medicalDocs === 0) {
      setError("Please upload at least 1 medical document");
      setLoading(false);
      return;
    }
    if (financialDocs === 0) {
      setError("Please upload at least 1 financial document");
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setError("No access token found. Please login again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("patient_full_name", patientName);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("contact_number", contact);
      formData.append("address", address);
      formData.append("disease", disease);
      formData.append("hospital", hospitalId);
      formData.append("treating_doctor", doctor);
      formData.append("treatment_description", treatment);
      formData.append("estimated_cost", estimatedCost);
      formData.append("required_funding", requiredFunding);
      formData.append("annual_family_income", annualIncome);
      formData.append("family_members_count", familyMembers);
      formData.append("employment_status", employmentStatus);
      formData.append(
        "government_scheme_enrolled",
        governmentScheme ? "true" : "false",
      );

      // Add files
      uploadedFiles.forEach((item) => {
        formData.append("uploaded_files", item.file);
      });

      // Add file types
      uploadedFiles.forEach((item) => {
        formData.append("file_types", item.type);
      });

      const res = await fetch("http://localhost:8000/api/medical-cases/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          data.error || data.detail || data.message || "Failed to submit case",
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting case:", err);
      setError(err.message || "Failed to submit medical case");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Case Submitted
          </h2>
          <p className="text-sm text-muted-foreground">
            Your medical case has been submitted successfully. Redirecting to
            your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            Register Medical Case
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Patient Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="patient_name" className="text-xs">
                    Patient Name *
                  </Label>
                  <Input
                    id="patient_name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-xs">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-xs">
                    Gender *
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="contact" className="text-xs">
                    Contact Number *
                  </Label>
                  <Input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="+91 9999999999"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-xs">
                    Address *
                  </Label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    rows={2}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            {/* Medical Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Medical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="disease" className="text-xs">
                    Disease *
                  </Label>
                  <Input
                    id="disease"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="Disease name"
                  />
                </div>
                <div>
                  <Label htmlFor="hospital" className="text-xs">
                    Hospital *
                  </Label>
                  <select
                    id="hospital"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    disabled={hospitalsLoading}
                  >
                    <option value="">
                      {hospitalsLoading ? "Loading..." : "Select Hospital"}
                    </option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="doctor" className="text-xs">
                    Treating Doctor *
                  </Label>
                  <Input
                    id="doctor"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="Doctor name"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_cost" className="text-xs">
                    Estimated Cost (₹) *
                  </Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="required_funding" className="text-xs">
                    Required Funding (₹) *
                  </Label>
                  <Input
                    id="required_funding"
                    type="number"
                    step="0.01"
                    value={requiredFunding}
                    onChange={(e) => setRequiredFunding(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="treatment" className="text-xs">
                    Treatment Description *
                  </Label>
                  <textarea
                    id="treatment"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    rows={2}
                    placeholder="Describe the treatment required"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="annual_income" className="text-xs">
                    Annual Family Income (₹) *
                  </Label>
                  <Input
                    id="annual_income"
                    type="number"
                    step="0.01"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="family_members" className="text-xs">
                    Family Members Count *
                  </Label>
                  <Input
                    id="family_members"
                    type="number"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                    className="mt-1 text-sm"
                    placeholder="Number of members"
                  />
                </div>
                <div>
                  <Label htmlFor="employment" className="text-xs">
                    Employment Status *
                  </Label>
                  <select
                    id="employment"
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Daily wage">Daily wage</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="govt_scheme"
                    type="checkbox"
                    checked={governmentScheme}
                    onChange={(e) => setGovernmentScheme(e.target.checked)}
                    className="w-4 h-4 rounded border-input"
                  />
                  <Label
                    htmlFor="govt_scheme"
                    className="text-xs cursor-pointer"
                  >
                    Enrolled in Government Assistance Scheme
                  </Label>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Upload Documents *
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                At least 1 medical document AND 1 financial document required
              </p>

              {/* Medical Documents */}
              <div className="mb-4">
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Medical Documents{" "}
                  {countFilesByType("MEDICAL") > 0 &&
                    `(${countFilesByType("MEDICAL")})`}
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-3 bg-muted/30">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "MEDICAL")}
                    className="w-full text-sm"
                    id="medical-files"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG (medical reports, prescriptions, test results)
                  </p>
                </div>
              </div>

              {/* Financial Documents */}
              <div className="mb-3">
                <label className="text-xs font-medium text-foreground mb-2 block">
                  Financial Documents{" "}
                  {countFilesByType("FINANCIAL") > 0 &&
                    `(${countFilesByType("FINANCIAL")})`}
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-3 bg-muted/30">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "FINANCIAL")}
                    className="w-full text-sm"
                    id="financial-files"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG (income proof, government ID, bank statements)
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    {uploadedFiles.length} file
                    {uploadedFiles.length !== 1 ? "s" : ""} selected:
                  </p>
                  <div className="space-y-1">
                    {uploadedFiles.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-background rounded text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-foreground truncate block">
                            ✓ {item.file.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {item.type === "FINANCIAL" ?
                              "Financial"
                            : "Medical"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-destructive hover:bg-destructive/10 rounded px-2 py-1 shrink-0 whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer with Buttons */}
        <div className="flex gap-2 p-6 border-t border-border bg-muted/20 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "Submitting..." : "Submit Case"}
          </Button>
        </div>
      </div>
    </div>
  );
}
