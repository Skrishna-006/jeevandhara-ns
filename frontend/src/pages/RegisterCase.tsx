import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/lib/auth";
import MedicalCaseForm from "@/components/MedicalCaseForm";

const RegisterCase = () => {
  // Protect this page - only normal users (role="user")
  useAuthGuard("user");

  const navigate = useNavigate();

  const handleFormClose = () => {
    navigate("/dashboard");
  };

  const handleFormSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <MedicalCaseForm onClose={handleFormClose} onSuccess={handleFormSuccess} />
  );
};

export default RegisterCase;
