import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  School,
  SmartToy,
  CloudUpload,
  CheckCircle,
  Schedule,
  Bullseye,
  AutoAwesome,
  ListAlt,
  Search,
  Tune,
  Shield,
  ArrowBack,
  ArrowForward,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import OnboardingStepper from "../../components/onboarding/WelcomeStep";

function CourseHistoryMethod() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState("ai");
  const [noCourses, setNoCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setNoCourses(false);
  };

  const handleNoCoursesChange = (event) => {
    setNoCourses(event.target.checked);
    if (event.target.checked) {
      setSelectedMethod("");
    } else {
      setSelectedMethod("ai");
    }
  };

  const handleContinue = async () => {
    if (noCourses) {
      try {
        setLoading(true);
        await onboardingService.completeOnboarding();
        navigate("/");
      } catch (error) {
        setError("Failed to complete onboarding. Please try again.");
        console.error("Error completing onboarding:", error);
      } finally {
        setLoading(false);
      }
    } else if (selectedMethod === "ai") {
      navigate("/onboarding/transcript-upload");
    } else if (selectedMethod === "manual") {
      navigate("/onboarding/manual-entry");
    }
  };

  const getMethodDisplay = () => {
    if (noCourses) return "Skip Course Entry";
    if (selectedMethod === "ai") return "AI Upload";
    if (selectedMethod === "manual") return "Manual Entry";
    return "No method selected";
  };

  const getContinueButtonText = () => {
    if (noCourses) return "Skip to Degree Planning";
    if (selectedMethod === "ai") return "Continue with AI Upload";
    if (selectedMethod === "manual") return "Continue with Manual Entry";
    return "Continue";
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", boxShadow: 1, py: 2, px: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <School sx={{ color: "white" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            CS Advisor
          </Typography>
          <Chip
            label="BETA"
            size="small"
            sx={{
              ml: 1,
              bgcolor: "secondary.main",
              color: "primary.main",
              fontWeight: "bold",
            }}
          />
        </Box>
      </Box>

      {/* BODY */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, py: 4 }}>
        <OnboardingStepper activeStep={1} />

        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            How would you like to add your completed courses?
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            We'll use this information to track your degree progress and suggest
            next steps
          </Typography>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/onboarding/academic-profile")}
            sx={{ mt: 2 }}
          >
            Back to Academic Profile
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 800, mx: "auto" }}>
            {error}
          </Alert>
        )}

        {/* Buttons */}
        <Paper sx={{ p: 3, mb: 4, maxWidth: 800, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircle sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Method selected:{" "}
              <Typography component="span" fontWeight="medium">
                {getMethodDisplay()}
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={() => setSelectedMethod("")}>
              Change Selection
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={(!selectedMethod && !noCourses) || loading}
              endIcon={
                loading ? <CircularProgress size={16} /> : <ArrowForward />
              }
            >
              {getContinueButtonText()}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Bottom Bar */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Selected Method:&nbsp;
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {getMethodDisplay()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/onboarding/academic-profile")}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={(!selectedMethod && !noCourses) || loading}
              endIcon={
                loading ? <CircularProgress size={16} /> : <ArrowForward />
              }
            >
              {getContinueButtonText()}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default CourseHistoryMethod;
