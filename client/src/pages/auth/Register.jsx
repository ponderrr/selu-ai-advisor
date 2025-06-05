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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  School,
  Badge,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  validateEmail,
  validatePassword,
} from "../../services/validation/authValidation";

const degreePrograms = [
  "Computer Science",
  "Information Technology",
  "Cybersecurity",
  "Software Engineering",
];

const academicYears = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate Student",
];

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    wNumber: "",
    // Consider lazy-generating this only if needed, and ensure 7 digits.
    degreeProgram: "",
    academicYear: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/register`,
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
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/verify-registration`,
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
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}auth/resend-registration-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registrationData.email }),
        }
      );
>>>>>>> Stashed changes

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (!formData.email.endsWith("@selu.edu")) {
      errors.email = "Please use your SELU email address (@selu.edu)";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.degreeProgram) {
      errors.degreeProgram = "Please select your degree program";
    }

    if (!formData.academicYear) {
      errors.academicYear = "Please select your academic year";
    }

    // W Number validation (optional, will be auto-generated if not provided)
    if (formData.wNumber && !/^W\d{7}$/.test(formData.wNumber)) {
      errors.wNumber = "W Number must be in format W1234567";
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
    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      wNumber: formData.wNumber || generateRandomWNumber(), // 7-digit guaranteed helper, see below
      degreeProgram: formData.degreeProgram,
      academicYear: formData.academicYear,
      degreeProgram: formData.degreeProgram,
      academicYear: formData.academicYear,
      degreeProgram: formData.degreeProgram,
      academicYear: formData.academicYear,
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate("/", { replace: true });
    }
    // Error handling is done by AuthContext
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        py: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 500,
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
            Join SELU AI Advisor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Name Fields */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              required
              autoComplete="given-name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              required
              autoComplete="family-name"
            />
          </Box>

          {/* Email Field */}
          <TextField
            fullWidth
            label="SELU Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />

          {/* W Number Field */}
          <TextField
            fullWidth
            label="W Number (Optional)"
            name="wNumber"
            value={formData.wNumber}
            onChange={handleChange}
            error={!!formErrors.wNumber}
            helperText={
              formErrors.wNumber || "Leave blank to auto-generate (W1234567)"
            }
            margin="normal"
            placeholder="W1234567"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Badge />
                </InputAdornment>
              ),
            }}
          />

          {/* Degree Program and Academic Year */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl fullWidth error={!!formErrors.degreeProgram}>
              <InputLabel>Degree Program</InputLabel>
              <Select
                name="degreeProgram"
                value={formData.degreeProgram}
                onChange={handleChange}
                label="Degree Program"
              >
                {degreePrograms.map((program) => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.degreeProgram && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {formErrors.degreeProgram}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!formErrors.academicYear}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                label="Academic Year"
              >
                {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.academicYear && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {formErrors.academicYear}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Password Field */}
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
            autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            margin="normal"
            required
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
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
              "Create Account"
            )}
          </Button>

          {/* Login Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
