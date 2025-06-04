import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import {
  CheckCircle,
  AutorenewOutlined,
  RadioButtonUnchecked,
} from "@mui/icons-material";

const ChecklistItem = ({ title, description, status, details }) => {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle sx={{ color: "success.main", mr: 2 }} />;
      case "in-progress":
        return <AutorenewOutlined sx={{ color: "info.main", mr: 2 }} />;
      default:
        return <RadioButtonUnchecked sx={{ color: "grey.400", mr: 2 }} />;
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
      <Box sx={{ flexShrink: 0, mt: 0.5 }}>{getIcon()}</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {details && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {details}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Fallback mock data
const getMockGraduationData = () => ({
  institutional: [
    {
      title: "Minimum 120 credit hours",
      description: "78 of 120 credits completed (65%)",
      status: "in-progress",
      details: "42 credits remaining",
    },
    {
      title: "Minimum 2.0 cumulative GPA",
      description: "Current: 3.53 GPA",
      status: "completed",
      details: "Requirement exceeded",
    },
    {
      title: "Minimum 2.0 CS major GPA",
      description: "Current: 3.67 CS GPA",
      status: "completed",
      details: "Requirement exceeded",
    },
    {
      title: "Complete all core CS courses",
      description: "24 of 30 core CS credits completed",
      status: "in-progress",
      details: "6 credits remaining: CS 401, CS 410",
    },
    {
      title: "Complete capstone project",
      description: "CS 485 - Senior Capstone Project",
      status: "not-started",
      details: "Typically taken in final semester",
    },
  ],
  academic: [
    {
      title: "Core Computer Science Requirements",
      description: "24 of 30 credits completed (80%)",
      status: "in-progress",
      details: "Missing: CS 401 (Operating Systems), CS 410 (Database Systems)",
    },
    {
      title: "Mathematics Requirements",
      description: "15 of 18 credits completed (83%)",
      status: "in-progress",
      details: "Missing: MATH 312 (Numerical Analysis)",
    },
    {
      title: "General Education Requirements",
      description: "30 of 39 credits completed (77%)",
      status: "in-progress",
      details: "Missing: 1 Social Science course, remaining Arts credits",
    },
    {
      title: "Free Electives",
      description: "9 of 33 credits completed (27%)",
      status: "in-progress",
      details: "24 elective credits remaining - consider specialization area",
    },
    {
      title: "Writing Intensive Requirement",
      description: "2 WI courses required across curriculum",
      status: "in-progress",
      details: "1 completed (ENGL 102), 1 remaining (typically in major)",
    },
    {
      title: "Residency Requirement",
      description: "Minimum 30 credits at SELU",
      status: "completed",
      details: "48 credits completed at SELU",
    },
  ],
  summary: {
    creditsCompleted: 78,
    totalCredits: 120,
    overallProgress: 65,
    cumulativeGPA: 3.53,
    expectedGraduation: "Spring 2026",
  },
});

function GraduationChecklist({ data }) {
  // Use provided data or fallback to mock data
  const graduationData =
    data && (data.institutional || data.academic)
      ? data
      : getMockGraduationData();

  const institutionalRequirements = graduationData.institutional || [];
  const academicRequirements = graduationData.academic || [];
  const summary = graduationData.summary || getMockGraduationData().summary;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Graduation Requirements Checklist
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Institutional Requirements */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Institutional Requirements
            </Typography>
            {institutionalRequirements.length > 0 ? (
              institutionalRequirements.map((requirement, index) => (
                <ChecklistItem
                  key={`institutional-${index}`}
                  title={requirement.title}
                  description={requirement.description}
                  status={requirement.status}
                  details={requirement.details}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No institutional requirements data available
              </Typography>
            )}
          </Grid>

          {/* Academic Requirements */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Academic Requirements
            </Typography>
            {academicRequirements.length > 0 ? (
              academicRequirements.map((requirement, index) => (
                <ChecklistItem
                  key={`academic-${index}`}
                  title={requirement.title}
                  description={requirement.description}
                  status={requirement.status}
                  details={requirement.details}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No academic requirements data available
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Summary Box */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: "primary.light",
            borderRadius: 2,
            border: 1,
            borderColor: "primary.main",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Graduation Status Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Credits Completed
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {summary.creditsCompleted} / {summary.totalCredits}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {summary.overallProgress}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Cumulative GPA
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {summary.cumulativeGPA}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Est. Graduation
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {summary.expectedGraduation}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default GraduationChecklist;
