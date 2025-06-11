// client/src/pages/onboarding/AcademicProfile.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  School,
  AccessTime,
  AccountBalance,
  MenuBook,
  AccountTree,
  Edit,
  Chat,
  ArrowForward,
  Save,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import OnboardingStepper from "../../components/onboarding/WelcomeStep";

function AcademicProfile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    department: "",
    major: "",
    concentration: "",
    academicStatus: "",
    expectedGraduation: {
      semester: "",
      year: "",
    },
  });

  const [options, setOptions] = useState({
    departments: [],
    majors: [],
    concentrations: [],
  });

  const [loading, setLoading] = useState({
    departments: true,
    majors: false,
    concentrations: false,
    saving: false,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      loadMajors(formData.department);
    }
  }, [formData.department]);

  useEffect(() => {
    if (formData.major) {
      loadConcentrations(formData.major);
    }
  }, [formData.major]);

  const loadDepartments = async () => {
    try {
      setLoading((prev) => ({ ...prev, departments: true }));
      const departments = await onboardingService.getDepartments();
      setOptions((prev) => ({ ...prev, departments }));
    } catch (error) {
      setError("Failed to load departments. Please try again.");
      console.error("Error loading departments:", error);
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const loadMajors = async (departmentId) => {
    try {
      setLoading((prev) => ({ ...prev, majors: true }));
      const majors = await onboardingService.getMajors(departmentId);
      setOptions((prev) => ({ ...prev, majors, concentrations: [] }));
      setFormData((prev) => ({ ...prev, major: "", concentration: "" }));
    } catch (error) {
      setError("Failed to load majors. Please try again.");
      console.error("Error loading majors:", error);
    } finally {
      setLoading((prev) => ({ ...prev, majors: false }));
    }
  };

  const loadConcentrations = async (majorId) => {
    try {
      setLoading((prev) => ({ ...prev, concentrations: true }));
      const concentrations = await onboardingService.getConcentrations(majorId);
      setOptions((prev) => ({ ...prev, concentrations }));
      setFormData((prev) => ({ ...prev, concentration: "" }));
    } catch (error) {
      console.error("Error loading concentrations:", error);
      // Concentrations are optional, so don't show error
    } finally {
      setLoading((prev) => ({ ...prev, concentrations: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGraduationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      expectedGraduation: {
        ...prev.expectedGraduation,
        [field]: value,
      },
    }));
  };

  const isFormValid = () => {
    return (
      formData.department &&
      formData.major &&
      formData.academicStatus &&
      formData.expectedGraduation.semester &&
      formData.expectedGraduation.year
    );
  };

  const handleSaveProgress = async () => {
    try {
      setLoading((prev) => ({ ...prev, saving: true }));
      await onboardingService.saveAcademicProfile({
        department_id: formData.department,
        major_id: formData.major,
        concentration_id: formData.concentration || null,
        academic_status: formData.academicStatus,
        expected_graduation: `${formData.expectedGraduation.semester} ${formData.expectedGraduation.year}`,
      });
      // Just save, don't navigate
    } catch (error) {
      setError("Failed to save progress. Please try again.");
      console.error("Error saving progress:", error);
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleContinue = async () => {
    if (!isFormValid()) return;

    try {
      setLoading((prev) => ({ ...prev, saving: true }));
      await onboardingService.saveAcademicProfile({
        department_id: formData.department,
        major_id: formData.major,
        concentration_id: formData.concentration || null,
        academic_status: formData.academicStatus,
        expected_graduation: `${formData.expectedGraduation.semester} ${formData.expectedGraduation.year}`,
      });

      navigate("/onboarding/course-history");
    } catch (error) {
      setError("Failed to save academic profile. Please try again.");
      console.error("Error saving academic profile:", error);
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 7; i++) {
      years.push(currentYear + i);
    }
    return years;
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
        <OnboardingStepper activeStep={0} />

        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Tell us about your academic program
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We'll customize your AI advisor based on your field of study
          </Typography>
        </Box>

        {/* Welcome Card */}
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
                <School sx={{ color: "primary.main", fontSize: 32 }} />
              </Box>
            )}
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Hi {user?.firstName || "there"}, let's get you set up!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                To provide you with the most accurate academic guidance, we need
                to understand your program of study.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <AccessTime
                  sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                />
                <Typography variant="body2" color="text.secondary">
                  This takes less than 2 minutes
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 800, mx: "auto" }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Department Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!formData.department}>
                    <InputLabel>Select Your Department</InputLabel>
                    <Select
                      value={formData.department}
                      label="Select Your Department"
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      disabled={loading.departments}
                    >
                      {loading.departments ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading departments...
                        </MenuItem>
                      ) : (
                        options.departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Choose the department that houses your major
                    </Typography>
                  </FormControl>
                </Grid>

                {/* Major Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!formData.major}>
                    <InputLabel>Select Your Field of Study</InputLabel>
                    <Select
                      value={formData.major}
                      label="Select Your Field of Study"
                      onChange={(e) =>
                        handleInputChange("major", e.target.value)
                      }
                      disabled={!formData.department || loading.majors}
                    >
                      {loading.majors ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading majors...
                        </MenuItem>
                      ) : !formData.department ? (
                        <MenuItem disabled>
                          Please select a department first
                        </MenuItem>
                      ) : (
                        options.majors.map((major) => (
                          <MenuItem key={major.id} value={major.id}>
                            {major.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Your major or primary program of study
                    </Typography>
                  </FormControl>
                </Grid>

                {/* Concentration Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>
                      Choose Your Concentration (Optional)
                    </InputLabel>
                    <Select
                      value={formData.concentration}
                      label="Choose Your Concentration (Optional)"
                      onChange={(e) =>
                        handleInputChange("concentration", e.target.value)
                      }
                      disabled={!formData.major || loading.concentrations}
                    >
                      {loading.concentrations ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading concentrations...
                        </MenuItem>
                      ) : !formData.major ? (
                        <MenuItem disabled>
                          Please select a field of study first
                        </MenuItem>
                      ) : options.concentrations.length === 0 ? (
                        <MenuItem disabled>
                          No concentrations available
                        </MenuItem>
                      ) : (
                        options.concentrations.map((conc) => (
                          <MenuItem key={conc.id} value={conc.id}>
                            {conc.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Your specialized focus area within your major
                    </Typography>
                  </FormControl>
                </Grid>

                {/* Academic Status */}
                <Grid item xs={12}>
                  <FormControl
                    component="fieldset"
                    required
                    error={!formData.academicStatus}
                  >
                    <FormLabel component="legend" sx={{ mb: 2 }}>
                      Current Academic Status
                    </FormLabel>
                    <RadioGroup
                      value={formData.academicStatus}
                      onChange={(e) =>
                        handleInputChange("academicStatus", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="freshman"
                        control={<Radio />}
                        label="New freshman"
                      />
                      <FormControlLabel
                        value="transfer"
                        control={<Radio />}
                        label="Transfer student (with transfer credits)"
                      />
                      <FormControlLabel
                        value="continuing"
                        control={<Radio />}
                        label="Continuing student"
                      />
                      <FormControlLabel
                        value="returning"
                        control={<Radio />}
                        label="Returning student"
                      />
                      <FormControlLabel
                        value="graduate"
                        control={<Radio />}
                        label="Graduate student"
                      />
                    </RadioGroup>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Select your current status at SELU
                    </Typography>
                  </FormControl>
                </Grid>

                {/* Expected Graduation */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Expected Graduation *
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Semester</InputLabel>
                        <Select
                          value={formData.expectedGraduation.semester}
                          label="Semester"
                          onChange={(e) =>
                            handleGraduationChange("semester", e.target.value)
                          }
                        >
                          <MenuItem value="Fall">Fall</MenuItem>
                          <MenuItem value="Spring">Spring</MenuItem>
                          <MenuItem value="Summer">Summer</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Year</InputLabel>
                        <Select
                          value={formData.expectedGraduation.year}
                          label="Year"
                          onChange={(e) =>
                            handleGraduationChange("year", e.target.value)
                          }
                        >
                          {generateYearOptions().map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    When do you plan to graduate? (You can change this later)
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sidebar Information */}
          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Why we ask
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <AccountBalance color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Department helps us show relevant courses and requirements"
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <MenuBook color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Field of study ensures accurate degree planning"
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <AccountTree color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Concentration personalizes course recommendations"
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  </List>
                  <Box
                    sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Edit
                        sx={{ color: "text.secondary", mr: 1, fontSize: 16 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        You can change these anytime
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  bgcolor: "primary.light",
                  border: 1,
                  borderColor: "primary.main",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Chat sx={{ color: "primary.main", mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Questions? Ask our AI
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Not sure what to select? Our AI can help explain your
                        options.
                      </Typography>
                      <Button
                        variant="text"
                        color="primary"
                        size="small"
                        endIcon={<ArrowForward />}
                        sx={{ mt: 1, p: 0 }}
                      >
                        Chat with AI
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Mobile Info Accordion */}
        {isMobile && (
          <Paper
            sx={{
              mt: 3,
              p: 3,
              bgcolor: "primary.light",
              border: 1,
              borderColor: "primary.main",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Why we ask for this information
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Department helps us show relevant courses and requirements"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <MenuBook color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Field of study ensures accurate degree planning"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <AccountTree color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Concentration personalizes course recommendations"
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            </List>
          </Paper>
        )}
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
            <Save sx={{ color: "text.secondary", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Your progress is automatically saved
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="text"
              color="inherit"
              onClick={() => navigate("/")}
            >
              I'll complete this later
            </Button>
            <Button
              variant="outlined"
              onClick={handleSaveProgress}
              disabled={loading.saving}
              startIcon={
                loading.saving ? <CircularProgress size={16} /> : <Save />
              }
            >
              Save Progress
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={!isFormValid() || loading.saving}
              endIcon={<ArrowForward />}
            >
              Continue to Course History
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AcademicProfile;
