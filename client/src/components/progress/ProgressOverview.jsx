import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const DegreeCircularProgress = ({
  percentage,
  completedCredits,
  totalCredits,
  size = 200,
}) => {
  const canvasRef = useRef(null);
  const theme = useTheme();
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 12;
    ctx.stroke();

    // Progress arc
    const progressAngle = (percentage / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + progressAngle
    );
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [percentage, theme, size]);

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ display: "block" }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="text.primary">
          {Math.round(percentage)}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {completedCredits} of {totalCredits} Credits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed
        </Typography>
      </Box>
    </Box>
  );
};

const CategoryProgress = ({ category }) => {
  return (
    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight="medium">
          {category.name}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {Math.round(category.percentage)}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={category.percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "grey.200",
          mb: 1,
          "& .MuiLinearProgress-bar": {
            bgcolor: category.color,
            borderRadius: 4,
          },
        }}
      />

      <Typography variant="caption" color="text.secondary">
        {category.completed} of {category.total} credits completed
      </Typography>
    </Paper>
  );
};

const GPAChart = ({ overallGPA, majorGPA }) => {
  const canvasRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions accounting for device pixel ratio
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    // Scale the context to ensure correct drawing
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Simple bar chart for GPA
    const barWidth = 40;
    const barSpacing = 60;
    const maxHeight = 60;
    const baseline = 70;

    // Overall GPA bar
    const overallHeight = (overallGPA / 4.0) * maxHeight;
    ctx.fillStyle = theme.palette.primary.main;
    ctx.fillRect(30, baseline - overallHeight, barWidth, overallHeight);

    // Major GPA bar
    const majorHeight = (majorGPA / 4.0) * maxHeight;
    ctx.fillStyle = theme.palette.secondary.main;
    ctx.fillRect(
      30 + barSpacing,
      baseline - majorHeight,
      barWidth,
      majorHeight
    );

    // Labels
    ctx.fillStyle = "#666";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText(overallGPA.toFixed(2), 30 + barWidth / 2, baseline + 15);
    ctx.fillText(
      majorGPA.toFixed(2),
      30 + barSpacing + barWidth / 2,
      baseline + 15
    );
  }, [overallGPA, majorGPA, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={100}
      style={{ width: "100%", height: "80px" }}
    />
  );
};

function ProgressOverview({ data }) {
  if (!data) {
    return (
      <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Degree Progress Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No progress data available
        </Typography>
      </Paper>
    );
  }

  // Extract data with fallbacks
  const overview = data.overview || {};
  const categories = data.categories || [];
  const student = data.student || {};

  const completedCredits = overview.completedCredits || 0;
  const totalCredits = overview.totalCredits || 120;
  const percentage = overview.percentage || 0;
  const gpa = overview.gpa || { overall: 0, major: 0 };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Degree Progress Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Main Progress Circle */}
        <Grid item xs={12} lg={5}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <DegreeCircularProgress
              percentage={percentage}
              completedCredits={completedCredits}
              totalCredits={totalCredits}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 2,
                color:
                  student.status === "On Track"
                    ? "success.main"
                    : "warning.main",
              }}
            >
              <CheckCircle sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                {student.status === "On Track"
                  ? `On track to graduate ${student.expectedGraduation || "Spring 2026"}`
                  : student.status || "Status unknown"}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Category Progress */}
        <Grid item xs={12} lg={7}>
          <Grid container spacing={2}>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <CategoryProgress category={category} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: "grey.50", textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* GPA Overview */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium">
                    GPA Overview
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          mr: 0.5,
                        }}
                      />
                      <Typography variant="caption">Overall</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "secondary.main",
                          mr: 0.5,
                        }}
                      />
                      <Typography variant="caption">CS Major</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ height: 80 }}>
                  {gpa.overall > 0 || gpa.major > 0 ? (
                    <GPAChart overallGPA={gpa.overall} majorGPA={gpa.major} />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        GPA data not available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ProgressOverview;
