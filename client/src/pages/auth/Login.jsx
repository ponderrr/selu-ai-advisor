import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateEmail } from "../../services/validation/authValidation";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

<<<<<<< Updated upstream
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
=======
    intervalIdRef.current = setInterval(() => {
      setVerificationData((prevData) => {
        if (prevData.resendCooldown > 0) {
          const newCooldown = prevData.resendCooldown - 1;
          if (newCooldown === 0) {
            // Countdown finished. Clear the interval.
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null; // Mark as cleared
            }
          }
          return { ...prevData, resendCooldown: newCooldown };
        } else {
          // Cooldown is already 0 or less.
          // If an interval is somehow still running, clear it.
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null; // Mark as cleared
          }
          return prevData; // No change to state
        }
      });
    }, 1000);

    // Cleanup function for unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []); // Empty dependency array: runs on mount, cleans on unmount.

  const handleEmailSubmit = async (formData) => {
    try {
      setEmailData(formData);

      // For now, simulate sending OTP
      // Replace with actual API call to send OTP
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/send-otp`,
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
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/verify-otp`,
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
        // Backend should now issue an HttpOnly, SameSite cookie upon successful OTP verification.
        // Tokens are no longer stored in localStorage.

        // The login function from AuthContext is called to update client-side auth state.
        // This function should now rely on the HttpOnly cookie.
        // Review AuthContext.login to ensure its parameters (email, code) are still
        // appropriate or if it can be simplified for a cookie-based session.
        const result = await login(emailData.email, code);

        if (result.success) {
          setVerificationData((prev) => ({ ...prev, loading: false })); // Reset loading before navigation
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          // Handle failure from AuthContext.login (e.g., if user fetch failed or login was unsuccessful)
          setVerificationData((prev) => ({
            ...prev,
            loading: false,
            error: result.error || "Login failed after OTP verification.",
          }));
        }
      } else {
        const errorData = await response.json();
        // This error will be caught by the catch block below, which sets loading to false.
        throw new Error(errorData.detail || "Invalid verification code");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationData((prev) => ({
>>>>>>> Stashed changes
        ...prev,
        [name]: "",
      }));
    }
  };

<<<<<<< Updated upstream
  const validateForm = () => {
    const errors = {};
=======
  const handleResendCode = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailData.email }),
        }
      );
>>>>>>> Stashed changes

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (!formData.email.endsWith("@selu.edu")) {
      errors.email = "Please use your SELU email address (@selu.edu)";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
    // Error handling is done by AuthContext
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        backgroundImage: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <School sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            SELU AI Advisor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isSubmitting || isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Sign In"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register" variant="body2">
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
