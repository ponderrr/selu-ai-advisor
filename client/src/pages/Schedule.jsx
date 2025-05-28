import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Schedule() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Schedule Optimizer
      </Typography>
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary">
          AI schedule optimization ready for backend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Preference settings and semester planning will connect to your AI
          backend
        </Typography>
      </Paper>
    </Box>
  );
}

export default Schedule;
