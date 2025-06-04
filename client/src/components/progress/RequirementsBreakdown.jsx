import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  ExpandMore,
  Computer,
  Calculate,
  MenuBook,
  Lightbulb,
  Check,
  AutorenewOutlined,
  RadioButtonUnchecked,
} from "@mui/icons-material";

const getStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return <Check sx={{ fontSize: 16 }} />;
    case "In Progress":
      return <AutorenewOutlined sx={{ fontSize: 16 }} />;
    default:
      return <RadioButtonUnchecked sx={{ fontSize: 16 }} />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "info";
    default:
      return "default";
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "Core CS Requirements":
      return <Computer sx={{ color: "#1976d2" }} />;
    case "Mathematics Requirements":
      return <Calculate sx={{ color: "#9c27b0" }} />;
    case "General Education Requirements":
      return <MenuBook sx={{ color: "#4caf50" }} />;
    case "Free Electives":
      return <Lightbulb sx={{ color: "#ff9800" }} />;
    default:
      return <MenuBook sx={{ color: "#666" }} />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case "Core CS Requirements":
      return "#1976d2";
    case "Mathematics Requirements":
      return "#9c27b0";
    case "General Education Requirements":
      return "#4caf50";
    case "Free Electives":
      return "#ff9800";
    default:
      return "#666";
  }
};

// Fallback mock data (only used if no real data provided)
const getMockRequirementsData = () => ({
  "Core CS Requirements": {
    completed: 24,
    total: 30,
    percentage: 80,
    courses: [
      {
        code: "CS 161",
        title: "Algorithm Design and Implementation I",
        credits: 3,
        status: "Completed",
        grade: "A",
        semester: "Fall 2022",
      },
      {
        code: "CS 162",
        title: "Algorithm Design and Implementation II",
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
      {
        code: "CS 401",
        title: "Operating Systems",
        credits: 3,
        status: "Not Started",
        grade: "-",
        semester: "Fall 2024",
      },
    ],
  },
  "Mathematics Requirements": {
    completed: 15,
    total: 18,
    percentage: 83,
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
        code: "MATH 201",
        title: "Calculus II",
        credits: 3,
        status: "Completed",
        grade: "B",
        semester: "Spring 2023",
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
});

function RequirementsBreakdown({ categories, progressData }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Convert categories prop to requirements data structure
  const getRequirementsData = () => {
    if (!progressData?.categories || progressData.categories.length === 0) {
      console.log("No progressData.categories found, using mock data");
      return getMockRequirementsData();
    }

    const requirementsData = {};

    progressData.categories.forEach((category) => {
      requirementsData[category.name] = {
        completed: category.completed || 0,
        total: category.total || 0,
        percentage: category.percentage || 0,
        courses: category.courses || [],
        subcategories: category.subcategories || null,
      };
    });

    return requirementsData;
  };

  const requirementsData = getRequirementsData();

  const renderCourseTable = (courses) => {
    if (!courses || courses.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No course data available
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Course Code
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Course Title
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Credits
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Grade
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                Semester
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={`${course.code}-${course.semester}`} hover>
                <TableCell sx={{ fontWeight: 500 }}>{course.code}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(course.status)}
                    label={course.status}
                    size="small"
                    color={getStatusColor(course.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{course.grade || "-"}</TableCell>
                <TableCell>{course.semester || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderGeneralEducation = (subcategories) => {
    if (!subcategories) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No subcategory data available
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {Object.entries(subcategories).map(([subcat, courses]) => (
          <Grid item xs={12} md={6} key={subcat}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                {subcat}
              </Typography>
              {courses && courses.length > 0 ? (
                courses.map((course, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getStatusIcon(course.status)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {course.code}: {course.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {course.grade !== "-"
                        ? `${course.grade} (${course.semester})`
                        : course.semester}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No courses in this subcategory
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderElectiveRecommendations = (remainingCredits) => (
    <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
        Remaining Free Electives: {remainingCredits} credits
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Consider courses from these recommended areas:
      </Typography>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <Chip
            label="Business & Entrepreneurship"
            variant="outlined"
            size="small"
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Chip
            label="Advanced CS Topics"
            variant="outlined"
            size="small"
            sx={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Chip
            label="Communication & Leadership"
            variant="outlined"
            size="small"
            sx={{ width: "100%" }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  if (!requirementsData || Object.keys(requirementsData).length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Detailed Requirements Breakdown
        </Typography>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No requirements data available. Please check your backend
            connection.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Detailed Requirements Breakdown
      </Typography>

      {Object.entries(requirementsData).map(([categoryName, categoryData]) => (
        <Accordion
          key={categoryName}
          expanded={expanded === categoryName}
          onChange={handleChange(categoryName)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                mr: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {getCategoryIcon(categoryName)}
                <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
                  {categoryName}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={categoryData.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getCategoryColor(categoryName),
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {categoryData.completed}/{categoryData.total}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {categoryName === "General Education Requirements" ? (
              renderGeneralEducation(categoryData.subcategories)
            ) : categoryName === "Free Electives" ? (
              <Box>
                {renderCourseTable(categoryData.courses)}
                {categoryData.total > categoryData.completed &&
                  renderElectiveRecommendations(
                    categoryData.total - categoryData.completed
                  )}
              </Box>
            ) : (
              renderCourseTable(categoryData.courses)
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export default RequirementsBreakdown;
