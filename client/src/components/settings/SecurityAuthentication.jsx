import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function SecurityAuthentication() {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Security & Authentication</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will contain 2FA settings, session management, and login
          history.
        </Typography>
      </Paper>
    </Box>
  );
}

export default SecurityAuthentication;
