import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Profile() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Academic Profile
      </Typography>
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary">
          Profile management ready for backend integration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Course history, GPA tracking, and degree requirements will load from
          your backend
        </Typography>
      </Paper>
    </Box>
  );
}

export default Profile;
