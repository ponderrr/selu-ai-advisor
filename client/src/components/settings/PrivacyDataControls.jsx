import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function PrivacyDataControls() {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Privacy & Data Controls</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will contain FERPA compliance info, data permissions, and
          export options.
        </Typography>
      </Paper>
    </Box>
  );
}

export default PrivacyDataControls;
