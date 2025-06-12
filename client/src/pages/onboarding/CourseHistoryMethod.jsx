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
  useTheme,
  useMediaQuery,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  School,
  SmartToy,
  CloudUpload,
  CheckCircle,
  Schedule,
  ArrowBack,
  ArrowForward,
  Search,
  Bullseye,
  Speed,
  Shield,
  AccessTime,
  AutoFixHigh,
  ListAlt,
  ExpandMore,
  Help,
  Phone,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";

function CourseHistoryMethod() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState("ai"); // Default to AI
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
        await onboardingService.saveCourseHistoryMethod(
          "skip",
          "no_courses_yet"
        );
        await onboardingService.completeOnboarding();
        navigate("/");
      } catch (error) {
        setError("Failed to complete onboarding. Please try again.");
        console.error("Error completing onboarding:", error);
      } finally {
        setLoading(false);
      }
    } else if (selectedMethod === "ai") {
      try {
        setLoading(true);
        await onboardingService.saveCourseHistoryMethod("ai_upload");
        navigate("/onboarding/transcript-upload");
      } catch (error) {
        setError("Failed to save selection. Please try again.");
        console.error("Error saving method:", error);
      } finally {
        setLoading(false);
      }
    } else if (selectedMethod === "manual") {
      try {
        setLoading(true);
        await onboardingService.saveCourseHistoryMethod("manual");
        navigate("/onboarding/manual-entry");
      } catch (error) {
        setError("Failed to save selection. Please try again.");
        console.error("Error saving method:", error);
      } finally {
        setLoading(false);
      }
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

        {/* Introduction Card */}
        <Paper sx={{ p: 3, mb: 4, maxWidth: 800, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!isMobile && (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "primary.light",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                }}
              >
                <Schedule sx={{ color: "primary.main", fontSize: 32 }} />
              </Box>
            )}
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                To provide accurate academic guidance, we need to know what
                courses you've already completed.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose the method that works best for you:
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 800, mx: "auto" }}>
            {error}
          </Alert>
        )}

        {/* Method Selection Cards */}
        <Grid container spacing={3} sx={{ maxWidth: 1200, mx: "auto", mb: 4 }}>
          {/* AI Upload Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                border: 2,
                borderColor:
                  selectedMethod === "ai" ? "primary.main" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => handleMethodSelect("ai")}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "primary.light",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SmartToy sx={{ color: "primary.main", fontSize: 32 }} />
                  </Box>
                  <Chip
                    label="RECOMMENDED"
                    size="small"
                    sx={{
                      bgcolor: "secondary.main",
                      color: "primary.main",
                      fontWeight: "bold",
                    }}
                  />
                </Box>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Upload Transcript Image
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Let AI extract your course information automatically
                </Typography>

                <List dense sx={{ my: 2 }}>
                  {[
                    "Upload a photo or scan of your transcript",
                    "AI automatically identifies completed courses",
                    "Matches courses to SELU requirements",
                    "Review and confirm before saving",
                    "Fastest setup - takes about 2 minutes",
                  ].map((text, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle
                          sx={{ color: "primary.main", fontSize: 20 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  <Chip label="Powered by AI" size="small" variant="outlined" />
                  <Chip
                    label="Secure & Private"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label="99% accuracy rate"
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <AccessTime sx={{ color: "primary.main", fontSize: 20 }} />
                  <Typography variant="body2">Quick and easy</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Manual Entry Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                border: 2,
                borderColor:
                  selectedMethod === "manual" ? "primary.main" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => handleMethodSelect("manual")}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "grey.100",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ListAlt sx={{ color: "grey.600", fontSize: 32 }} />
                  </Box>
                </Box>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Manual Course Selection
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Search and select courses from the SELU catalog
                </Typography>

                <List dense sx={{ my: 2 }}>
                  {[
                    "Search through all SELU courses",
                    "Select exactly what you've taken",
                    "Add grades and semesters",
                    "Complete control over your data",
                    "No file upload required",
                  ].map((text, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle
                          sx={{ color: "primary.main", fontSize: 20 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  <Chip
                    label="Complete control"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label="Comprehensive search"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label="No uploads needed"
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Search sx={{ color: "grey.600", fontSize: 20 }} />
                  <Typography variant="body2">Manual but precise</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Comparison Table */}
        <Paper sx={{ p: 3, mb: 4, maxWidth: 800, mx: "auto" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Not sure which to choose?
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>AI Upload</TableCell>
                  <TableCell>Manual Entry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Time required</TableCell>
                  <TableCell>~2 minutes</TableCell>
                  <TableCell>~10-15 minutes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Accuracy</TableCell>
                  <TableCell>Very high</TableCell>
                  <TableCell fontWeight="medium">Perfect</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Privacy</TableCell>
                  <TableCell>Transcript analyzed</TableCell>
                  <TableCell fontWeight="medium">No uploads</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Effort</TableCell>
                  <TableCell fontWeight="medium">Minimal</TableCell>
                  <TableCell>Moderate</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* FAQ Section */}
        <Paper
          sx={{ p: 3, mb: 4, maxWidth: 800, mx: "auto", bgcolor: "grey.50" }}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="medium">
                Need help deciding?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Is my transcript data secure?
              </Typography>
              <Typography variant="body2" gutterBottom>
                Yes, your transcript is processed locally and deleted after
                analysis. We only store the extracted course information that
                you approve.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                What if AI misses some courses?
              </Typography>
              <Typography variant="body2" gutterBottom>
                You can review and edit everything before confirming. Any
                missing courses can be added manually after the AI processing is
                complete.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* No Courses Option */}
        <Paper sx={{ p: 3, mb: 4, maxWidth: 800, mx: "auto" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={noCourses}
                onChange={handleNoCoursesChange}
                color="primary"
              />
            }
            label="I don't have any completed courses yet"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Skip to degree planning if you're a new freshman
          </Typography>
        </Paper>
      </Box>

      {/* Bottom Action Bar */}
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
            <CheckCircle sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Method selected:{" "}
              <Typography component="span" fontWeight="medium">
                {getMethodDisplay()}
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedMethod("ai");
                setNoCourses(false);
              }}
            >
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
        </Box>
      </Paper>
    </Box>
  );
}

export default CourseHistoryMethod;
