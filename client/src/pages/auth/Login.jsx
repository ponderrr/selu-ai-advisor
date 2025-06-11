import React, { useState, useEffect, useRef } from "react";
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

  const intervalIdRef = useRef(null);
  const [currentStep, setCurrentStep] = useState("signin");
  const [emailData, setEmailData] = useState({
    email: "",
    rememberDevice: false,
  });
  const [verificationData, setVerificationData] = useState({
    loading: false,
    error: null,
    resendCooldown: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setVerificationData((prevData) => {
        if (prevData.resendCooldown > 0) {
          const newCooldown = prevData.resendCooldown - 1;
          if (newCooldown === 0) {
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
            }
          }
          return { ...prevData, resendCooldown: newCooldown };
        } else {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          return prevData;
        }
      });
    }, 1000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  const handleEmailSubmit = async (formData) => {
    try {
      setEmailData(formData);

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
          resendCooldown: 120,
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Email submission error:", err);
    }
  };

  const handleVerificationSubmit = async (code) => {
    try {
      setVerificationData((prev) => ({ ...prev, loading: true, error: null }));

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
        const result = await login(emailData.email, code);
        if (result.success) {
          setVerificationData((prev) => ({ ...prev, loading: false }));
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          setVerificationData((prev) => ({
            ...prev,
            loading: false,
            error: fallback.error || "User already verified, but login failed.",
          }));
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
