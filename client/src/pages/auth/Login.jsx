import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import {
  AuthLayout,
  SignInForm,
  EmailVerificationForm,
} from "../../components/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [currentStep, setCurrentStep] = useState("signin"); // "signin" | "verification"
  const [emailData, setEmailData] = useState({
    email: "",
    rememberDevice: false,
  });
  const [verificationData, setVerificationData] = useState({
    loading: false,
    error: null,
    resendCooldown: 0,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

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

  const handleEmailSubmit = async (formData) => {
    try {
      setEmailData(formData);

      // For now, simulate sending OTP
      // Replace with actual API call to send OTP
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            rememberDevice: formData.rememberDevice,
          }),
        }
      );

      if (response.ok) {
        setCurrentStep("verification");
        setVerificationData((prev) => ({
          ...prev,
          loading: false,
          error: null,
          resendCooldown: 120, // 2 minutes
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Email submission error:", err);
      // Handle error through auth context or local state
    }
  };

  const handleVerificationSubmit = async (code) => {
    try {
      setVerificationData((prev) => ({ ...prev, loading: true, error: null }));

      // Call your verification endpoint
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailData.email,
            code,
            rememberDevice: emailData.rememberDevice,
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

        // Get user data and update auth context
        const result = await login(emailData.email, code); // This might need to be adapted

        if (result.success) {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
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
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailData.email }),
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
    setCurrentStep("signin");
    setVerificationData({
      loading: false,
      error: null,
      resendCooldown: 0,
    });
    clearError();
  };

  const handleSwitchToSignUp = () => {
    navigate("/register");
  };

  return (
    <AuthLayout>
      {currentStep === "signin" && (
        <SignInForm
          onSwitchToSignUp={handleSwitchToSignUp}
          onEmailSubmit={handleEmailSubmit}
          loading={isLoading}
          error={error}
        />
      )}

      {currentStep === "verification" && (
        <EmailVerificationForm
          email={emailData.email}
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

export default Login;
