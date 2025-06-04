import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Alert,
  Link,
  CircularProgress,
  Paper,
  Tooltip,
} from "@mui/material";
import { HelpOutline, Info } from "@mui/icons-material";
import { validateEmail } from "../../services/validation/authValidation";

const SignUpForm = ({
  onSwitchToSignIn,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    // Eligibility
    status: "current",
    studentId: "",

    // Basic Info
    email: "",
    firstName: "",
    lastName: "",
    preferredName: "",

    // Academic Info
    expectedGraduation: "",
    classStanding: "",

    // Agreements
    agreeTerms: false,
    agreeCode: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [showStatusHelp, setShowStatusHelp] = useState(false);

  const graduationOptions = [
    "Fall 2024",
    "Spring 2025",
    "Fall 2025",
    "Spring 2026",
    "Fall 2026",
    "Spring 2027",
  ];

  const standingOptions = [
    "Freshman",
    "Sophomore",
    "Junior",
    "Senior",
    "Graduate",
  ];

  const statusOptions = [
    { value: "current", label: "Current SELU Computer Science student" },
    { value: "interested", label: "SELU student interested in CS" },
    { value: "prospective", label: "Prospective SELU CS student" },
    { value: "faculty", label: "Faculty/Staff (different access level)" },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (!formData.email.endsWith("@selu.edu")) {
      errors.email = "Please use your SELU email address (@selu.edu)";
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    // Academic info validation
    if (!formData.expectedGraduation) {
      errors.expectedGraduation = "Expected graduation is required";
    }
    if (!formData.classStanding) {
      errors.classStanding = "Class standing is required";
    }

    // Student ID validation (if provided)
    if (formData.studentId && !/^W\d{7}$/.test(formData.studentId)) {
      errors.studentId = "Student ID must be in format W1234567";
    }

    // Agreement validation
    if (!formData.agreeTerms) {
      errors.agreeTerms =
        "You must agree to the Terms of Service and Privacy Policy";
    }
    if (!formData.agreeCode) {
      errors.agreeCode = "You must agree to abide by the SELU Code of Conduct";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Join SELU CS Advisor!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Get started with your personalized academic guidance
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignIn}
            sx={{
              color: "primary.main",
              fontWeight: "medium",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Eligibility Verification */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="medium">
              Verify Your SELU Status
            </Typography>
            <Tooltip
              title="We need to verify your status to provide appropriate access levels and academic content."
              arrow
            >
              <Button
                size="small"
                startIcon={<HelpOutline />}
                onClick={() => setShowStatusHelp(!showStatusHelp)}
                sx={{ ml: 1, minWidth: "auto", p: 0.5 }}
              >
                Why do we ask?
              </Button>
            </Tooltip>
          </Box>

          <RadioGroup
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            sx={{ mb: 2 }}
          >
            {statusOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio color="primary" />}
                label={option.label}
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>

          <TextField
            fullWidth
            label="Student ID (optional)"
            value={formData.studentId}
            onChange={(e) => handleChange("studentId", e.target.value)}
            error={!!formErrors.studentId}
            helperText={formErrors.studentId}
            placeholder="W0000000"
            size="small"
          />

          {showStatusHelp && (
            <Alert severity="info" sx={{ mt: 2 }}>
              We use this information to customize your experience and provide
              appropriate access to academic resources and advising features.
            </Alert>
          )}
        </Paper>

        {/* Account Creation Form */}
        <Box sx={{ space: 3 }}>
          {/* Email */}
          <TextField
            fullWidth
            label="SELU Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!formErrors.email}
            helperText={
              formErrors.email || "Use your official SELU email address"
            }
            placeholder="your.name@selu.edu"
            margin="normal"
            required
          />

          {/* Name Fields */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              required
            />
          </Box>

          {/* Preferred Name */}
          <TextField
            fullWidth
            label="Preferred Name (optional)"
            value={formData.preferredName}
            onChange={(e) => handleChange("preferredName", e.target.value)}
            placeholder="What should the AI call you?"
            margin="normal"
          />

          {/* Academic Information */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl fullWidth error={!!formErrors.expectedGraduation}>
              <InputLabel>Expected Graduation *</InputLabel>
              <Select
                value={formData.expectedGraduation}
                label="Expected Graduation *"
                onChange={(e) =>
                  handleChange("expectedGraduation", e.target.value)
                }
              >
                {graduationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.expectedGraduation && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {formErrors.expectedGraduation}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!formErrors.classStanding}>
              <InputLabel>Class Standing *</InputLabel>
              <Select
                value={formData.classStanding}
                label="Class Standing *"
                onChange={(e) => handleChange("classStanding", e.target.value)}
              >
                {standingOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.classStanding && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {formErrors.classStanding}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Terms and Privacy */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              By creating an account, you agree to our:
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      handleChange("agreeTerms", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{" "}
                    <Link
                      href="#"
                      color="primary"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="#"
                      color="primary"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ alignItems: "flex-start" }}
              />
              {formErrors.agreeTerms && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", ml: 4 }}
                >
                  {formErrors.agreeTerms}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeCode}
                    onChange={(e) =>
                      handleChange("agreeCode", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to abide by the SELU Code of Conduct
                  </Typography>
                }
                sx={{ alignItems: "flex-start" }}
              />
              {formErrors.agreeCode && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", ml: 4 }}
                >
                  {formErrors.agreeCode}
                </Typography>
              )}
            </Box>

            {/* FERPA Notice */}
            <Alert
              severity="info"
              icon={<Info />}
              sx={{
                mb: 3,
                bgcolor: "info.light",
                border: 1,
                borderColor: "info.main",
              }}
            >
              <Typography variant="body2">
                Your educational records are protected under FERPA. We maintain
                strict privacy and security protocols to safeguard your
                information.
              </Typography>
            </Alert>

            {/* Create Account Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "medium",
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUpForm;
