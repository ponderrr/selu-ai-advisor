import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";
import { Chat, Schedule, Person } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to SELU AI Advisor, {user?.firstName || "Student"}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Your intelligent academic planning assistant is ready to help.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Chat Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get instant answers about degree requirements, course planning,
                and academic policies.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Chat />}
                onClick={() => navigate("/chat")}
              >
                Start Chat
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Schedule Optimizer
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Let AI create an optimized semester-by-semester plan to
                graduation.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={() => navigate("/schedule")}
              >
                Plan Schedule
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage your course history and degree progress tracking.
              </Typography>
              {user?.degreeProgram && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={user.degreeProgram}
                    color="primary"
                    size="small"
                  />
                  {user?.academicYear && (
                    <Chip
                      label={user.academicYear}
                      color="secondary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<Person />}
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
