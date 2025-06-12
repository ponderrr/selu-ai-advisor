import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PieChart,
  Download,
  School,
  CalendarToday,
  Badge,
  CheckCircle,
  Chat,
  NavigateNext,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/api/dashboard";
import ProgressOverview from "../components/progress/ProgressOverview";
import RequirementsBreakdown from "../components/progress/RequirementsBreakdown";
import SemesterTimeline from "../components/progress/SemesterTimeline";
import GraduationChecklist from "../components/progress/GraduationChecklist";

function Profile() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [semesterData, setSemesterData] = useState(null);
  const [graduationData, setGraduationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Mock data
  const getMockProgressData = (basicData = null) => ({
    student: {
      name:
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : "John Smith",
      program: "Computer Science BS",
      expectedGraduation: "Spring 2026",
      studentId: user?.w_number || "W00123456",
      status: "On Track",
    },
    overview: {
      totalCredits: basicData?.total_required || 120,
      completedCredits: basicData?.completed_hours || 78,
      percentage: basicData?.progress_percentage || 65,
      gpa: {
        overall: 3.53,
        major: 3.67,
      },
    },
    categories: [
      {
        name: "Core CS Requirements",
        completed: 24,
        total: 30,
        percentage: 80,
        color: "#1976d2",
        courses: [
          {
            code: "CS 161",
            title: "Algorithm Design I",
            credits: 3,
            status: "Completed",
            grade: "A",
            semester: "Fall 2022",
          },
          {
            code: "CS 162",
            title: "Algorithm Design II",
            credits: 3,
            status: "Completed",
            grade: "B+",
            semester: "Spring 2023",
          },
          {
            code: "CS 375",
            title: "Computer Networks",
            credits: 3,
            status: "In Progress",
            grade: "-",
            semester: "Spring 2024",
          },
        ],
      },
      {
        name: "Mathematics Requirements",
        completed: 15,
        total: 18,
        percentage: 83,
        color: "#9c27b0",
        courses: [
          {
            code: "MATH 200",
            title: "Calculus I",
            credits: 3,
            status: "Completed",
            grade: "B+",
            semester: "Fall 2022",
          },
          {
            code: "MATH 241",
            title: "Linear Algebra",
            credits: 3,
            status: "In Progress",
            grade: "-",
            semester: "Spring 2024",
          },
        ],
      },
      {
        name: "General Education Requirements",
        completed: 30,
        total: 39,
        percentage: 77,
        color: "#4caf50",
        subcategories: {
          "English Composition": [
            {
              code: "ENGL 101",
              title: "Composition I",
              status: "Completed",
              grade: "A",
              semester: "Fall 2022",
            },
          ],
          Science: [
            {
              code: "PHYS 221",
              title: "Physics I",
              status: "Completed",
              grade: "B",
              semester: "Fall 2022",
            },
          ],
        },
      },
      {
        name: "Free Electives",
        completed: 9,
        total: 33,
        percentage: 27,
        color: "#ff9800",
        courses: [
          {
            code: "BUS 205",
            title: "Business Communication",
            credits: 3,
            status: "Completed",
            grade: "A-",
            semester: "Fall 2023",
          },
        ],
      },
    ],
  });

  const getMockSemesterData = () => [
    {
      semester: "Fall 2022",
      status: "Completed",
      statusColor: "success",
      courses: [
        { code: "CS 161", title: "Algorithm Design I", grade: "A" },
        { code: "MATH 200", title: "Calculus I", grade: "B+" },
      ],
      credits: 15,
      semesterGPA: 3.7,
      cumulativeGPA: 3.7,
    },
    {
      semester: "Spring 2024",
      status: "Current",
      statusColor: "info",
      courses: [
        { code: "CS 375", title: "Computer Networks", grade: "In Progress" },
      ],
      credits: 15,
      projectedGPA: "3.50-3.70",
    },
  ];

  const getMockGraduationData = () => ({
    summary: {
      creditsCompleted: 78,
      totalCredits: 120,
      gpa: 3.53,
      majorGpa: 3.67,
      creditsInProgress: 15,
      remainingRequirements: 3,
      completedRequirements: 8,
    },
    institutional: [
      {
        title: "Minimum 120 credit hours",
        description: "78 of 120 credits completed (65%)",
        status: "in-progress",
        details: "42 credits remaining",
      },
    ],
    academic: [
      {
        title: "Core Computer Science Requirements",
        description: "24 of 30 credits completed (80%)",
        status: "in-progress",
        details: "Missing: CS 401, CS 410",
      },
    ],
  });

  const loadAllProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [detailedProgress, semesterTimeline, graduationRequirements] =
        await Promise.allSettled([
          dashboardService.getDetailedProgress(),
          dashboardService.getSemesterTimeline(),
          dashboardService.getGraduationRequirements(),
        ]);

      if (detailedProgress.status === "fulfilled") {
        setProgressData(detailedProgress.value);
      } else {
        console.error(
          "Failed to load detailed progress:",
          detailedProgress.reason
        );
        try {
          const basicProgress = await dashboardService.getDegreeProgress();
          setProgressData(getMockProgressData(basicProgress));
        } catch (fallbackError) {
          console.error("Fallback progress also failed:", fallbackError);
          setProgressData(getMockProgressData());
        }
      }

      if (semesterTimeline.status === "fulfilled") {
        setSemesterData(semesterTimeline.value);
      } else {
        console.error(
          "Failed to load semester timeline:",
          semesterTimeline.reason
        );
        setSemesterData(getMockSemesterData());
      }

      if (graduationRequirements.status === "fulfilled") {
        setGraduationData(graduationRequirements.value);
      } else {
        console.error(
          "Failed to load graduation requirements:",
          graduationRequirements.reason
        );
        setGraduationData(getMockGraduationData());
      }
    } catch (err) {
      console.error("Failed to load progress data:", err);
      setError("Failed to load degree progress data");
      setProgressData(getMockProgressData());
      setSemesterData(getMockSemesterData());
      setGraduationData(getMockGraduationData());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllProgressData();
  }, [loadAllProgressData]);

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      await dashboardService.downloadProgressReport("pdf");
    } catch (error) {
      console.error("Failed to download report:", error);
      setError("Failed to download report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleAskAI = () => {
    window.location.href = "/chat?context=progress";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !progressData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadAllProgressData} variant="contained">
          Retry Loading
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          Some data may be unavailable: {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            color="inherit"
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Degree Progress</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PieChart sx={{ color: "primary.main", mr: 2, fontSize: 32 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Degree Progress
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadReport}
            disabled={downloadingReport}
            sx={{
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
            }}
          >
            {downloadingReport ? (
              <CircularProgress size={20} />
            ) : (
              "Download Report"
            )}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {progressData?.student?.name || "Student"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 3 },
                alignItems: { xs: "flex-start", sm: "center" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <School fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {progressData?.student?.program || "Computer Science BS"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Expected Graduation:{" "}
                  {progressData?.student?.expectedGraduation || "Spring 2026"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  ID: {progressData?.student?.studentId || "W00123456"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<CheckCircle />}
              label={progressData?.student?.status || "On Track"}
              color="success"
              variant="filled"
              sx={{ bgcolor: "success.light", color: "success.dark" }}
            />
            <Button
              startIcon={<Chat />}
              onClick={handleAskAI}
              sx={{
                color: "primary.main",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Ask AI About My Progress
            </Button>
          </Box>
        </Box>
      </Paper>

      {progressData && <ProgressOverview data={progressData} />}
      {progressData && (
        <RequirementsBreakdown
          categories={progressData.categories}
          progressData={progressData}
        />
      )}
      {semesterData && <SemesterTimeline semesterData={semesterData} />}
      {graduationData && <GraduationChecklist data={graduationData} />}
    </Box>
  );
}

export default Profile;
