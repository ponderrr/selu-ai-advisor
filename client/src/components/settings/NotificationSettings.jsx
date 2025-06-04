import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function NotificationSettings() {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Notification Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will contain email, SMS, and app notification
          preferences.
        </Typography>
      </Paper>
    </Box>
  );
}

export default NotificationSettings;
