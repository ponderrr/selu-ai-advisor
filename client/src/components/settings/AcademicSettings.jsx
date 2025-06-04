import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function AcademicSettings({ userProfile }) {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Academic Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will contain additional academic preferences and
          settings.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AcademicSettings;
