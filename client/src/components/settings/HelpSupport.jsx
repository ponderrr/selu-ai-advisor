import React from "react";
import { Box, Paper, Typography } from "@mui/material";

function HelpSupport() {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Help & Support</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will contain contact information, FAQs, and support
          resources.
        </Typography>
      </Paper>
    </Box>
  );
}

export default HelpSupport;
