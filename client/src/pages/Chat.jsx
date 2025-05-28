import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Chat() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Chat Assistant
      </Typography>
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary">
          Chat interface ready for backend connection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This will connect to your FastAPI backend for real-time AI
          conversations
        </Typography>
      </Paper>
    </Box>
  );
}

export default Chat;
