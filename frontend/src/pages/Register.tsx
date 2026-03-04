/**
 * Register Page
 * Clean registration flow with proper error handling and redirects
 */

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { registerUser } from "@/lib/api";
import { Mail, Lock, User, Loader } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // OTP-related state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear OTP verification when email changes
    if (name === "email") {
      setOtpVerified(false);
      setOtpSent(false);
      setOtp("");
    }
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // OTP must be verified before submitting
    if (!otpVerified) {
      setGeneralError("Please verify your OTP before registering.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = { ...formData, otp: otp.trim() };
      const result = await registerUser(payload);

      if (result.success) {
        // Redirect to login with success message in query param
        navigate("/login?registered=true");
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setFieldErrors(result.errors);
        } else {
          setGeneralError(
            result.message || "Registration failed. Please try again.",
          );
        }
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // OTP helpers (additional UI) for registration
  // -------------------------------------------------------------------------

  const startResendCountdown = () => {
    setResendTimer(30);
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const id = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    if (!formData.email.trim()) {
      setOtpError("Please enter an email address first");
      return;
    }
    setIsSendingOtp(true);
    try {
      const emailValue = formData.email.trim();
      console.log("[DEBUG] Sending OTP request with email:", emailValue);
      const res = await fetch("http://127.0.0.1:8000/api/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOtpError(data.detail || data.message || "Failed to send OTP");
        return;
      }
      setOtpSent(true);
      setOtpSuccess("OTP sent to your email");
      startResendCountdown();
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    if (otp.trim().length !== 6) {
      setOtpError("Please enter a 6-digit code");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOtpError(data.detail || data.message || "OTP verification failed");
        setOtpVerified(false);
      } else {
        setOtpSuccess("OTP verified");
        setOtpVerified(true);
      }
    } catch (err: any) {
      setOtpError(err.message || "OTP verification failed");
      setOtpVerified(false);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Register to get started with JeevanDhara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {generalError && (
              <Alert variant="destructive">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading || otpSent}
                  className="pl-10"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Send OTP Button - visible before OTP is sent */}
            {!otpSent && (
              <Button
                type="button"
                className="w-full"
                onClick={handleSendOtp}
                disabled={isSendingOtp || !formData.email.trim()}
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}

            {/* OTP Success Message */}
            {otpSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-700">
                  {otpSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* OTP Input Section - visible after OTP is sent */}
            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isVerifyingOtp || isLoading}
                />
                {otpError && (
                  <p className="text-sm text-destructive">{otpError}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otp.trim().length !== 6}
                    className="flex-1"
                  >
                    {isVerifyingOtp ? "Verifying…" : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || isSendingOtp}
                  >
                    {resendTimer > 0 ? `${resendTimer}s` : "Resend"}
                  </Button>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
              {fieldErrors.password_confirm && (
                <p className="text-sm text-destructive">
                  {fieldErrors.password_confirm}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
