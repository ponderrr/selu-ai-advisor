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

  const handleLoginSubmit = async (formData) => {
    try {
      clearError();
      setEmailData(formData);

      const result = await login(formData.email, formData.password);
      if (result.success) {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        // Error is now handled by AuthContext and available via the error prop
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleSwitchToSignUp = () => {
    navigate("/register");
  };

  return (
    <AuthLayout>
      {currentStep === "signin" && (
        <SignInForm
          onSwitchToSignUp={handleSwitchToSignUp}
          onLoginSubmit={handleLoginSubmit}
          loading={isLoading}
          error={error}
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
