import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  School,
  Schedule,
  SmartToy,
  Notifications,
  ArrowBack,
  Check,
  AccessTime,
  CalendarToday,
  Psychology,
  Settings,
  Celebration,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import { OnboardingStepper } from ".";

function Preferences() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState({
    // Schedule Preferences
    maxCreditsPerSemester: 15,
    preferredTimeOfDay: "any", // morning, afternoon, evening, any
    avoidEarlyClasses: false,
    avoidLateClasses: false,
    preferredDays: "any", // mwf, tth, any

    // Academic Preferences
    prioritizeGraduation: true,
    allowSummerCourses: true,
    preferOnline: false,

    // AI Assistant Preferences
    communicationStyle: "friendly", // professional, friendly, concise
    detailLevel: "balanced", // brief, balanced, detailed
    reminderFrequency: "weekly", // daily, weekly, monthly, never

    // Notification Preferences
    emailNotifications: true,
    scheduleReminders: true,
    deadlineAlerts: true,
    courseRecommendations: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handlePreferenceChange = (category, field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAndComplete = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save preferences
      await onboardingService.savePreferences(preferences);

      // Complete onboarding
      await onboardingService.completeOnboarding();

      // Navigate to dashboard
      navigate("/");
    } catch (error) {
      setError("Failed to save preferences. Please try again.");
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderSchedulePreferences = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Schedule sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Schedule Preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum Credits Per Semester
            </Typography>
            <Slider
              value={preferences.maxCreditsPerSemester}
              onChange={(_, value) =>
                handlePreferenceChange(
                  "schedule",
                  "maxCreditsPerSemester",
                  value
                )
              }
              min={12}
              max={21}
              step={3}
              marks={[
                { value: 12, label: "12" },
                { value: 15, label: "15" },
                { value: 18, label: "18" },
                { value: 21, label: "21" },
              ]}
              valueLabelDisplay="on"
            />
            <Typography variant="caption" color="text.secondary">
              Recommended: 15 credits for full-time students
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Preferred Time of Day</InputLabel>
              <Select
                value={preferences.preferredTimeOfDay}
                label="Preferred Time of Day"
                onChange={(e) =>
                  handlePreferenceChange(
                    "schedule",
                    "preferredTimeOfDay",
                    e.target.value
                  )
                }
              >
                <MenuItem value="any">Any time</MenuItem>
                <MenuItem value="morning">Morning (8 AM - 12 PM)</MenuItem>
                <MenuItem value="afternoon">Afternoon (12 PM - 5 PM)</MenuItem>
                <MenuItem value="evening">Evening (5 PM - 9 PM)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Preferred Days</InputLabel>
              <Select
                value={preferences.preferredDays}
                label="Preferred Days"
                onChange={(e) =>
                  handlePreferenceChange(
                    "schedule",
                    "preferredDays",
                    e.target.value
                  )
                }
              >
                <MenuItem value="any">Any days</MenuItem>
                <MenuItem value="mwf">Monday/Wednesday/Friday</MenuItem>
                <MenuItem value="tth">Tuesday/Thursday</MenuItem>
                <MenuItem value="weekdays">Weekdays only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.avoidEarlyClasses}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "schedule",
                        "avoidEarlyClasses",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Avoid classes before 9 AM"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.avoidLateClasses}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "schedule",
                        "avoidLateClasses",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Avoid classes after 6 PM"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAcademicPreferences = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Psychology sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Academic Preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.prioritizeGraduation}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "academic",
                      "prioritizeGraduation",
                      e.target.checked
                    )
                  }
                />
              }
              label="Prioritize graduation timeline over course preferences"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              When enabled, the AI will prioritize courses that help you
              graduate on time
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.allowSummerCourses}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "academic",
                      "allowSummerCourses",
                      e.target.checked
                    )
                  }
                />
              }
              label="Include summer courses in schedule planning"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Summer courses can help you graduate faster or take lighter loads
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.preferOnline}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "academic",
                      "preferOnline",
                      e.target.checked
                    )
                  }
                />
              }
              label="Prefer online/hybrid courses when available"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Useful if you need flexibility for work or other commitments
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAIPreferences = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <SmartToy sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            AI Assistant Preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Communication Style
              </FormLabel>
              <RadioGroup
                value={preferences.communicationStyle}
                onChange={(e) =>
                  handlePreferenceChange(
                    "ai",
                    "communicationStyle",
                    e.target.value
                  )
                }
              >
                <FormControlLabel
                  value="professional"
                  control={<Radio />}
                  label="Professional - Formal and direct"
                />
                <FormControlLabel
                  value="friendly"
                  control={<Radio />}
                  label="Friendly - Conversational and supportive"
                />
                <FormControlLabel
                  value="concise"
                  control={<Radio />}
                  label="Concise - Brief and to the point"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Detail Level
              </FormLabel>
              <RadioGroup
                value={preferences.detailLevel}
                onChange={(e) =>
                  handlePreferenceChange("ai", "detailLevel", e.target.value)
                }
              >
                <FormControlLabel
                  value="brief"
                  control={<Radio />}
                  label="Brief - Quick answers and summaries"
                />
                <FormControlLabel
                  value="balanced"
                  control={<Radio />}
                  label="Balanced - Moderate detail and context"
                />
                <FormControlLabel
                  value="detailed"
                  control={<Radio />}
                  label="Detailed - Comprehensive explanations"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Reminder Frequency</InputLabel>
              <Select
                value={preferences.reminderFrequency}
                label="Reminder Frequency"
                onChange={(e) =>
                  handlePreferenceChange(
                    "ai",
                    "reminderFrequency",
                    e.target.value
                  )
                }
              >
                <MenuItem value="never">Never</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              How often should the AI remind you about upcoming deadlines and
              tasks?
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderNotificationPreferences = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Notifications sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Notification Preferences
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "notifications",
                      "emailNotifications",
                      e.target.checked
                    )
                  }
                />
              }
              label="Email notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive important updates via email
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.scheduleReminders}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "notifications",
                      "scheduleReminders",
                      e.target.checked
                    )
                  }
                />
              }
              label="Schedule reminders"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Get reminded about registration dates and deadlines
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.deadlineAlerts}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "notifications",
                      "deadlineAlerts",
                      e.target.checked
                    )
                  }
                />
              }
              label="Deadline alerts"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Get alerted about assignment and course deadlines
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.courseRecommendations}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "notifications",
                      "courseRecommendations",
                      e.target.checked
                    )
                  }
                />
              }
              label="Course recommendations"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive AI-powered course suggestions based on your progress
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSummary = () => (
    <Card
      sx={{
        mb: 3,
        bgcolor: "primary.light",
        border: 1,
        borderColor: "primary.main",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Settings sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Preference Summary
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Schedule Settings
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CalendarToday sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${preferences.maxCreditsPerSemester} credits per semester`}
                  secondary={`${preferences.preferredTimeOfDay} classes preferred`}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              AI Assistant
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <SmartToy sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${preferences.communicationStyle} communication style`}
                  secondary={`${preferences.detailLevel} detail level`}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          You can change any of these preferences later from your account
          settings.
        </Alert>
      </CardContent>
    </Card>
  );

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

      <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4 }}>
        <OnboardingStepper activeStep={2} />

        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Customize Your Experience
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Set your preferences to personalize your AI academic advisor
          </Typography>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Back to Previous Step
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        {renderSchedulePreferences()}
        {renderAcademicPreferences()}
        {renderAIPreferences()}
        {renderNotificationPreferences()}
        {renderSummary()}

        {/* Completion Message */}
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "success.light",
            border: 1,
            borderColor: "success.main",
          }}
        >
          <Celebration sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            color="success.dark"
          >
            You're Almost Done!
          </Typography>
          <Typography variant="body1" color="success.dark" gutterBottom>
            Click "Complete Setup" to finish your onboarding and start using
            your personalized AI academic advisor.
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
            <Typography variant="body2" color="text.secondary">
              All preferences can be changed later
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button variant="text" onClick={() => navigate("/")}>
              Skip Preferences
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAndComplete}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : <Check />}
              sx={{ minWidth: 160 }}
            >
              {saving ? "Saving..." : "Complete Setup"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Preferences;
