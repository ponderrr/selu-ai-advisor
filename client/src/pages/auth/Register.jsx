import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import {
  AuthLayout,
  SignUpForm,
  EmailVerificationForm,
} from "../../components/auth";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [currentStep, setCurrentStep] = useState("signup"); // "signup" | "verification"
  const [registrationData, setRegistrationData] = useState(null);
  const [verificationData, setVerificationData] = useState({
    loading: false,
    error: null,
    resendCooldown: 0,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle countdown timer for resend
  useEffect(() => {
    let timer;
    if (verificationData.resendCooldown > 0) {
      timer = setInterval(() => {
        setVerificationData((prev) => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verificationData.resendCooldown]);

  const generateWNumber = () => {
    // Generate a 7-digit W number (you might want to get this from backend)
    const randomDigits = Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0");
    return `W${randomDigits}`;
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      const registrationPayload = {
        // User basic info
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        wNumber: formData.studentId || generateWNumber(),

        // Academic info
        academic: {
          status: formData.status,
          expectedGraduation: formData.expectedGraduation,
          classStanding: formData.classStanding,
          major: "Computer Science", // Default for now
        },

        // Preferences
        preferredName: formData.preferredName,

        // Agreements
        agreements: {
          termsOfService: formData.agreeTerms,
          codeOfConduct: formData.agreeCode,
          ferpaConsent: true,
        },
      };

      setRegistrationData(registrationPayload);

      // Send registration request that triggers email verification
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationPayload),
        }
      );

      if (response.ok) {
        // Move to verification step
        setCurrentStep("verification");
        setVerificationData((prev) => ({
          ...prev,
          loading: false,
          error: null,
          resendCooldown: 120, // 2 minutes
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Error will be handled by auth context
    }
  };

  const handleVerificationSubmit = async (code) => {
    try {
      setVerificationData((prev) => ({ ...prev, loading: true, error: null }));

      // Verify the email and complete registration
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/verify-registration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registrationData.email,
            code,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Store tokens if provided
        if (data.access_token) {
          localStorage.setItem("authToken", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);
        }

        // Complete registration through auth context
        const result = await register(registrationData);

        if (result.success) {
          navigate("/", { replace: true });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid verification code");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationData((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/resend-registration-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registrationData.email }),
        }
      );

      if (response.ok) {
        setVerificationData((prev) => ({
          ...prev,
          resendCooldown: 120,
          error: null,
        }));
      } else {
        throw new Error("Failed to resend code");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setVerificationData((prev) => ({
        ...prev,
        error: "Failed to resend code. Please try again.",
      }));
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep("signup");
    setVerificationData({
      loading: false,
      error: null,
      resendCooldown: 0,
    });
    clearError();
  };

  const handleSwitchToSignIn = () => {
    navigate("/login");
  };

  return (
    <AuthLayout showTestimonial={currentStep === "signup"}>
      {currentStep === "signup" && (
        <SignUpForm
          onSwitchToSignIn={handleSwitchToSignIn}
          onSubmit={handleRegistrationSubmit}
          loading={isLoading}
          error={error}
        />
      )}

      {currentStep === "verification" && (
        <EmailVerificationForm
          email={registrationData?.email}
          onVerify={handleVerificationSubmit}
          onResendCode={handleResendCode}
          onBackToEmail={handleBackToEmail}
          loading={verificationData.loading}
          error={verificationData.error}
          resendCooldown={verificationData.resendCooldown}
        />
      )}

      {/* Footer */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "grey.100",
          py: 2,
          px: 4,
          borderTop: 1,
          borderColor: "grey.200",
        }}
      >
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Southeastern Louisiana University
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {[
              "Privacy Policy",
              "Terms of Service",
              "FERPA Information",
              "Contact Support",
            ].map((link) => (
              <Typography
                key={link}
                variant="body2"
                component="button"
                onClick={() => console.log(`Navigate to ${link}`)}
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
