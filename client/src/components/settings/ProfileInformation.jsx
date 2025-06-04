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

function ProfileInformation({
  userProfile,
  onUpdate,
  onSaveCompletion,
  onProfileRefreshNeeded,
}) {
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
  const [graduationOptions, setGraduationOptions] = useState([]);

  // Helper function to generate current semester
  const generateCurrentSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Month is 0-indexed

    if (month >= 1 && month <= 5) {
      // Jan - May
      return `Spring ${year}`;
    } else if (month >= 6 && month <= 7) {
      // Jun - Jul
      return `Summer ${year}`;
    } else {
      // Aug - Dec
      return `Fall ${year}`;
    }
  };

  // Helper function to generate graduation options
  const generateGraduationOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    let termYear = currentYear;
    // Determine start term based on current month to provide relevant future options
    const currentMonth = new Date().getMonth(); // 0-Jan, 4-May, 7-Aug
    let termCounter; // 0 for Spring, 1 for Summer, 2 for Fall

    if (currentMonth <= 4) {
      // Currently Spring or earlier
      termCounter = 0; // Start with Spring current_year
    } else if (currentMonth <= 7) {
      // Currently Summer or earlier
      termCounter = 1; // Start with Summer current_year
    } else {
      // Currently Fall
      termCounter = 2; // Start with Fall current_year
    }

    const termNames = ["Spring", "Summer", "Fall"];

    for (let i = 0; i < 8; i++) {
      // Generate next 8 terms (approx 2.5-3 years)
      const term = termNames[termCounter % 3];
      const year = termYear + Math.floor(termCounter / 3);
      options.push(`${term} ${year}`);
      termCounter++;
    }
    return options;
  };

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
        currentSemester:
          userProfile.academic?.currentSemester || generateCurrentSemester(),
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
      // Simulate fetching graduation terms - replace with actual API call if available
      // const gradTermsData = await settingsService.getAvailableGraduationTerms();
      // setGraduationOptions(gradTermsData);

      // Fallback to generated options if API call fails or is not available
      setGraduationOptions(generateGraduationOptions());

      const [majorsData, concentrationsData] = await Promise.all([
        settingsService.getAvailableMajors(),
        settingsService.getAvailableConcentrations(formData.major),
      ]);
      setMajors(majorsData);
      setConcentrations(concentrationsData);
    } catch (error) {
      console.error("Error loading academic options:", error);
      // Fallback data for majors and concentrations
      setMajors(["Computer Science", "Information Technology", "Data Science"]);
      setConcentrations([
        "Software Engineering",
        "Cybersecurity",
        "Data Science",
        "General Computer Science",
      ]);
      // Fallback for graduation options if initial generation also had an issue (unlikely here)
      if (graduationOptions.length === 0) {
        setGraduationOptions(generateGraduationOptions());
      }
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

    if (!file) {
      return;
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (file.size > MAX_FILE_SIZE) {
      if (onSaveCompletion) {
        onSaveCompletion("File is too large. Maximum size is 2MB.", false);
      }
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      if (onSaveCompletion) {
        onSaveCompletion(
          "Invalid file type. Please upload a JPG, PNG, or GIF image.",
          false
        );
      }
      return;
    }

    try {
      setLoading(true);
      await settingsService.uploadProfilePhoto(file);

      // Trigger parent to refresh profile data
      if (onProfileRefreshNeeded) {
        await onProfileRefreshNeeded();
      }

      if (onSaveCompletion) {
        onSaveCompletion(
          "Photo uploaded successfully! Your profile has been updated.",
          true
        );
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      if (onSaveCompletion) {
        onSaveCompletion("Error uploading photo. Please try again.", false);
      }
    } finally {
      setLoading(false);
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
      if (onSaveCompletion) {
        onSaveCompletion("Profile updated successfully!", true);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      if (onSaveCompletion) {
        onSaveCompletion("Failed to update profile. Please try again.", false);
      }
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
                {graduationOptions.map((term) => (
                  <MenuItem key={term} value={term}>
                    {term}
                  </MenuItem>
                ))}
                {/* Fallback if options are empty, though unlikely with generator */}
                {graduationOptions.length === 0 && (
                  <MenuItem value="" disabled>
                    Loading options...
                  </MenuItem>
                )}
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
