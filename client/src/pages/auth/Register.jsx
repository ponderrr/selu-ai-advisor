import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api/auth";
import AuthLayout from "../../components/auth/AuthLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import EmailVerificationForm from "../../components/auth/EmailVerificationForm";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState("signup");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [verificationData, setVerificationData] = useState({
    loading: false,
    error: null,
    resendCooldown: 0,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const clearError = () => setError(null);

  // ✅ CORRECTED: Use user-provided W-number, don't generate
  const handleRegistrationSubmit = async (formData) => {
    try {
      setLoading(true);
      clearError();

      // Prepare registration payload with user's W-number (if provided)
      const registrationPayload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        wNumber: formData.studentId?.trim().toUpperCase() || null, // ✅ Use user input or null
        academic: {
          status: formData.status,
          expectedGraduation: formData.expectedGraduation,
          classStanding: formData.classStanding,
          major: formData.major || "Computer Science",
        },
        preferredName: formData.preferredName,
        agreements: {
          termsOfService: formData.agreeTerms,
          codeOfConduct: formData.agreeCode,
          ferpaConsent: true,
        },
      };

      // Store registration data for verification step
      setRegistrationData(registrationPayload);

      // Use the proper registration endpoint that triggers OTP
      const response = await authService.register(registrationPayload);

      console.log("Registration initiated:", response);

      // Move to verification step
      setCurrentStep("verification");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerificationSubmit = async ({ code }) => {
    try {
      setVerificationData((prev) => ({ ...prev, loading: true, error: null }));

      // Verify the OTP code
      const response = await authService.verifyRegistration(
        registrationData.email,
        code
      );

      console.log("Verification successful:", response);

      // Redirect to login with success message
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please login with your credentials.",
          email: registrationData.email,
        },
      });
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Handle OTP resend
  const handleResendCode = async () => {
    try {
      setVerificationData((prev) => ({ ...prev, loading: true, error: null }));

      await authService.resendRegistrationOTP(registrationData.email);

      console.log("OTP resent successfully");

      // Start cooldown timer
      setVerificationData((prev) => ({
        ...prev,
        loading: false,
        resendCooldown: 60,
      }));

      // Countdown timer
      const countdown = setInterval(() => {
        setVerificationData((prev) => {
          if (prev.resendCooldown <= 1) {
            clearInterval(countdown);
            return { ...prev, resendCooldown: 0 };
          }
          return { ...prev, resendCooldown: prev.resendCooldown - 1 };
        });
      }, 1000);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setVerificationData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
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
          isRegistration={true}
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
