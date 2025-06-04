import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Link,
  Paper,
  Stack,
} from "@mui/material";
import { MailOutline, ArrowBack } from "@mui/icons-material";

const EmailVerificationForm = ({
  email,
  onVerify,
  onResendCode,
  onBackToEmail,
  loading = false,
  error = null,
  resendCooldown = 0,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("");
      const newCode = [...code];

      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char;
        }
      });

      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      setFocusIndex(nextIndex);
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusIndex(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusIndex(index + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6 && onVerify) {
      onVerify(fullCode);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box>
      {/* Header with Icon */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Paper
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <MailOutline sx={{ fontSize: 40 }} />
        </Paper>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Check Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We sent a verification code to{" "}
          <Box component="span" fontWeight="medium">
            {email}
          </Box>
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Verification Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Enter verification code
        </Typography>

        {/* Code Input Fields */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 4,
          }}
        >
          {code.map((digit, index) => (
            <Box
              key={index}
              component="input"
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setFocusIndex(index)}
              sx={{
                width: 48,
                height: 56,
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                border: 2,
                borderColor: focusIndex === index ? "primary.main" : "grey.300",
                borderRadius: 1,
                outline: "none",
                backgroundColor: "transparent",
                transition: "border-color 0.2s",
                "&:focus": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 2px rgba(2, 105, 55, 0.2)",
                },
              }}
            />
          ))}
        </Box>

        {/* Verify Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={!isCodeComplete || loading}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "medium",
            mb: 3,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        {/* Resend and Back Links */}
        <Box sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Didn't receive it?{" "}
              {resendCooldown > 0 ? (
                <Box component="span" color="text.disabled">
                  Resend code ({formatCountdown(resendCooldown)})
                </Box>
              ) : (
                <Link
                  component="button"
                  variant="body2"
                  onClick={onResendCode}
                  sx={{
                    color: "primary.main",
                    fontWeight: "medium",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Resend code
                </Link>
              )}
            </Typography>

            <Link
              component="button"
              variant="body2"
              onClick={onBackToEmail}
              sx={{
                color: "primary.main",
                fontWeight: "medium",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Use a different email
            </Link>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default EmailVerificationForm;
