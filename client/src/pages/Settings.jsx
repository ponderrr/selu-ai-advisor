import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { settingsService } from "../services/api/settings";

// Import setting components
import SettingsSidebar from "../components/settings/SettingsSidebar";
import ProfileInformation from "../components/settings/ProfileInformation";
import SecurityAuthentication from "../components/settings/SecurityAuthentication";
import PrivacyDataControls from "../components/settings/PrivacyDataControls";
import AIAssistantPreferences from "../components/settings/AIAssistantPreferences";
import AcademicSettings from "../components/settings/AcademicSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import HelpSupport from "../components/settings/HelpSupport";

function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await settingsService.getUserProfile();
      setUserProfile(profile);
    } catch (err) {
      setError("Failed to load user profile");
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const updated = await settingsService.updateUserProfile(updatedData);
      setUserProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    }
  };

  const renderActiveSection = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    switch (activeSection) {
      case "profile":
        return (
          <ProfileInformation
            userProfile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        );
      case "security":
        return <SecurityAuthentication />;
      case "privacy":
        return <PrivacyDataControls />;
      case "ai-preferences":
        return <AIAssistantPreferences />;
      case "academic":
        return <AcademicSettings userProfile={userProfile} />;
      case "notifications":
        return <NotificationSettings />;
      case "help":
        return <HelpSupport />;
      default:
        return (
          <ProfileInformation
            userProfile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: { xs: 0, sm: 0, md: "256px" }, p: 3 }}>
        {/* Breadcrumb and Header */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link
              color="inherit"
              href="/"
              sx={{
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
              }}
            >
              Dashboard
            </Link>
            <Typography color="text.primary">Account Settings</Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <Typography variant="h6" color="white">
                  ⚙️
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                Account Settings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        </Box>

        {/* Success Message */}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Active Section Content */}
        {renderActiveSection()}

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <Box sx={{ color: "success.main", mr: 1 }}>🔒</Box>
            <Typography variant="body2">Secure connection</Typography>
          </Box>
          <Typography variant="caption">
            Last security review: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            © 2024 Southeastern Louisiana University. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Settings;
