import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Save } from "@mui/icons-material";
import { settingsService } from "../../services/api/settings";

function ProfileInformation({ userProfile, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: "",
    preferredName: "",
    studentId: "",
    seluEmail: "",
    secondaryEmail: "",
    major: "",
    concentration: "",
    expectedGraduation: "",
    academicStanding: "",
    currentSemester: "",
    campus: "",
    phoneNumber: "",
    preferredCommunication: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState([]);
  const [concentrations, setConcentrations] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName:
          `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
        preferredName: userProfile.preferredName || userProfile.firstName || "",
        studentId: userProfile.wNumber || "",
        seluEmail: userProfile.email || "",
        secondaryEmail: userProfile.secondaryEmail || "",
        major: userProfile.academic?.major || "",
        concentration: userProfile.academic?.concentration || "",
        expectedGraduation: userProfile.academic?.expectedGraduation || "",
        academicStanding: userProfile.academic?.standing || "Good Standing",
        currentSemester: userProfile.academic?.currentSemester || "Fall 2024",
        campus: userProfile.academic?.campus || "Hammond Campus",
        phoneNumber: userProfile.contact?.phoneNumber || "",
        preferredCommunication: userProfile.contact?.preferredMethod || "Email",
        emergencyContactName: userProfile.contact?.emergencyName || "",
        emergencyContactPhone: userProfile.contact?.emergencyPhone || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    loadAcademicOptions();
  }, []);

  const loadAcademicOptions = async () => {
    try {
      const [majorsData, concentrationsData] = await Promise.all([
        settingsService.getAvailableMajors(),
        settingsService.getAvailableConcentrations(formData.major),
      ]);
      setMajors(majorsData);
      setConcentrations(concentrationsData);
    } catch (error) {
      console.error("Error loading academic options:", error);
      // Fallback data
      setMajors(["Computer Science", "Information Technology", "Data Science"]);
      setConcentrations([
        "Software Engineering",
        "Cybersecurity",
        "Data Science",
        "General Computer Science",
      ]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMajorChange = async (major) => {
    setFormData((prev) => ({
      ...prev,
      major,
      concentration: "", // Reset concentration when major changes
    }));

    try {
      const concentrationsData =
        await settingsService.getAvailableConcentrations(major);
      setConcentrations(concentrationsData);
    } catch (error) {
      console.error("Error loading concentrations:", error);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        await settingsService.uploadProfilePhoto(file);
        // Trigger a refresh of user profile
        window.location.reload(); // For now, could be improved with state update
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Split full name into first and last
      const nameParts = formData.fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ");

      const updateData = {
        firstName,
        lastName,
        preferredName: formData.preferredName,
        secondaryEmail: formData.secondaryEmail,
        academic: {
          major: formData.major,
          concentration: formData.concentration,
          expectedGraduation: formData.expectedGraduation,
        },
        contact: {
          phoneNumber: formData.phoneNumber,
          preferredMethod: formData.preferredCommunication,
          emergencyName: formData.emergencyContactName,
          emergencyPhone: formData.emergencyContactPhone,
        },
      };

      await onUpdate(updateData);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Basic Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: "divider" }}
        >
          Basic Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Photo */}
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={userProfile?.avatar}
                sx={{ width: 128, height: 128, mb: 2 }}
              >
                {formData.preferredName?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Button
                component="label"
                variant="outlined"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <PhotoCamera />
                }
                disabled={loading}
                sx={{ borderColor: "grey.300", color: "text.primary" }}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
              </Button>
            </Box>
          </Grid>

          {/* Profile Fields */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preferred Name"
                  value={formData.preferredName}
                  onChange={(e) =>
                    handleInputChange("preferredName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: "grey.50" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SELU Email"
                  value={formData.seluEmail}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: "grey.50" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Secondary Email (Optional)"
                  placeholder="Personal contact email"
                  value={formData.secondaryEmail}
                  onChange={(e) =>
                    handleInputChange("secondaryEmail", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Academic Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: "divider" }}
        >
          Academic Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Major</InputLabel>
              <Select
                value={formData.major}
                label="Major"
                onChange={(e) => handleMajorChange(e.target.value)}
              >
                {majors.map((major) => (
                  <MenuItem key={major} value={major}>
                    {major}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Concentration/Track</InputLabel>
              <Select
                value={formData.concentration}
                label="Concentration/Track"
                onChange={(e) =>
                  handleInputChange("concentration", e.target.value)
                }
              >
                {concentrations.map((concentration) => (
                  <MenuItem key={concentration} value={concentration}>
                    {concentration}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Expected Graduation</InputLabel>
              <Select
                value={formData.expectedGraduation}
                label="Expected Graduation"
                onChange={(e) =>
                  handleInputChange("expectedGraduation", e.target.value)
                }
              >
                <MenuItem value="Spring 2026">Spring 2026</MenuItem>
                <MenuItem value="Fall 2025">Fall 2025</MenuItem>
                <MenuItem value="Spring 2025">Spring 2025</MenuItem>
                <MenuItem value="Fall 2024">Fall 2024</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "56px",
                px: 2,
                bgcolor: "grey.50",
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
              }}
            >
              <Typography sx={{ mr: 2 }}>
                {formData.academicStanding}
              </Typography>
              <Chip label="Active" color="success" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "56px",
                px: 2,
                bgcolor: "grey.50",
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
              }}
            >
              <Typography>{formData.currentSemester}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "56px",
                px: 2,
                bgcolor: "grey.50",
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
              }}
            >
              <Typography>{formData.campus}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact Preferences Section */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: "divider" }}
        >
          Contact Preferences
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Preferred Communication Method</InputLabel>
              <Select
                value={formData.preferredCommunication}
                label="Preferred Communication Method"
                onChange={(e) =>
                  handleInputChange("preferredCommunication", e.target.value)
                }
              >
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
                <MenuItem value="App Notifications">App Notifications</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Emergency Contact Information (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    handleInputChange("emergencyContactName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyContactPhone", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
            sx={{ bgcolor: "primary.main" }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProfileInformation;
