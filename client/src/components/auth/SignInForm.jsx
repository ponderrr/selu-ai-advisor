import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  InputAdornment,
  Link,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Email, ArrowForward, School, Lock } from "@mui/icons-material";
import { validateEmail } from "../../services/validation/authValidation";

const SignInForm = ({
  onSwitchToSignUp,
  onEmailSubmit,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    rememberDevice: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (!formData.email.endsWith("@selu.edu")) {
      errors.email = "Please use your SELU email address (@selu.edu)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onEmailSubmit) {
      onEmailSubmit(formData);
    }
  };

  const handleSSO = (provider) => {
    // SSO implementation would go here
    console.log(`SSO login with ${provider}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Sign in to your academic advisor account
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          New to SELU CS Advisor?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToSignUp}
            sx={{
              color: "primary.main",
              fontWeight: "medium",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Create Account
          </Link>
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Email Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="SELU Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email || "Please use your SELU email address"}
          placeholder="your.name@selu.edu"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "medium",
            mb: 3,
          }}
        >
          {loading ? "Sending..." : "Continue with Email"}
        </Button>

        {/* Remember Device */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.rememberDevice}
              onChange={(e) => handleChange("rememberDevice", e.target.checked)}
              color="primary"
            />
          }
          label="Remember this device for 30 days"
          sx={{ mb: 2 }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => console.log("Trouble signing in")}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Having trouble signing in?
          </Link>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ position: "relative", my: 4 }}>
        <Divider />
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            px: 2,
            color: "text.secondary",
          }}
        >
          Or sign in with
        </Typography>
      </Box>

      {/* SSO Options */}
      <Stack spacing={1.5}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => handleSSO("selu")}
          startIcon={<School />}
          sx={{
            py: 1.5,
            mb: 1.5,
            borderColor: "grey.300",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "grey.50",
            },
          }}
        >
          SELU Single Sign-On
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => handleSSO("microsoft")}
          startIcon={
            <Box
              component="span"
              sx={{
                width: 20,
                height: 20,
                background: "linear-gradient(45deg, #00BCF2, #0078D4)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              M
            </Box>
          }
          sx={{
            py: 1.5,
            borderColor: "grey.300",
            color: "text.primary",
            "&:hover": {
              borderColor: "#0078D4",
              bgcolor: "grey.50",
            },
          }}
        >
          Microsoft 365
        </Button>
      </Stack>

      {/* Security Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: 1,
          borderColor: "grey.200",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lock sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            Secure login powered by SELU IT
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignInForm;
