import React from "react";
import { Box, Typography, Paper, Chip, Divider } from "@mui/material";

// Fallback mock data
const getMockSemesterData = () => [
  {
    semester: "Fall 2022",
    status: "Completed",
    statusColor: "success",
    courses: [
      { code: "CS 161", title: "Algorithm Design I", grade: "A" },
      { code: "MATH 200", title: "Calculus I", grade: "B+" },
      { code: "ENGL 101", title: "Composition I", grade: "A" },
    ],
    credits: 15,
    semesterGPA: 3.7,
    cumulativeGPA: 3.7,
  },
  {
    semester: "Spring 2023",
    status: "Completed",
    statusColor: "success",
    courses: [
      { code: "CS 162", title: "Algorithm Design II", grade: "B+" },
      { code: "MATH 201", title: "Calculus II", grade: "B" },
      { code: "ENGL 102", title: "Composition II", grade: "B+" },
    ],
    credits: 15,
    semesterGPA: 3.2,
    cumulativeGPA: 3.45,
  },
  {
    semester: "Spring 2024",
    status: "Current",
    statusColor: "info",
    courses: [
      { code: "CS 375", title: "Computer Networks", grade: "In Progress" },
      { code: "MATH 241", title: "Linear Algebra", grade: "In Progress" },
      {
        code: "CS 425",
        title: "Software Project Management",
        grade: "In Progress",
      },
    ],
    credits: 15,
    projectedGPA: "3.50-3.70",
  },
  {
    semester: "Fall 2024",
    status: "Planned",
    statusColor: "default",
    courses: [
      { code: "CS 401", title: "Operating Systems", grade: "Planned" },
      { code: "MATH 312", title: "Numerical Analysis", grade: "Planned" },
      { code: "CS 410", title: "Database Systems", grade: "Planned" },
    ],
    credits: 15,
  },
];

const SemesterCard = ({ semester, isCurrentSemester = false }) => {
  return (
    <Paper
      sx={{
        width: 256,
        p: 2,
        flexShrink: 0,
        border: isCurrentSemester ? 2 : 0,
        borderColor: isCurrentSemester ? "primary.main" : "transparent",
        opacity: semester.status === "Planned" ? 0.75 : 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {semester.semester}
        </Typography>
        <Chip
          label={semester.status}
          color={semester.statusColor}
          size="small"
        />
      </Box>

      {/* Courses */}
      <Box sx={{ mb: 2 }}>
        {semester.courses && semester.courses.length > 0 ? (
          semester.courses.map((course, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
              }}
            >
              <Typography variant="body2" title={course.title}>
                {course.code}
              </Typography>
              <Typography
                variant="body2"
                color={
                  course.grade === "In Progress"
                    ? "info.main"
                    : course.grade === "Planned"
                      ? "text.secondary"
                      : "text.primary"
                }
              >
                {course.grade}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No courses available
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="caption">Credits:</Typography>
        <Typography variant="caption">{semester.credits || 0}</Typography>
      </Box>

      {semester.semesterGPA && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="caption" fontWeight="medium">
            Semester GPA:
          </Typography>
          <Typography variant="caption" fontWeight="medium">
            {semester.semesterGPA}
          </Typography>
        </Box>
      )}

      {semester.cumulativeGPA && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" fontWeight="medium">
            Cumulative GPA:
          </Typography>
          <Typography variant="caption" fontWeight="medium">
            {semester.cumulativeGPA}
          </Typography>
        </Box>
      )}

      {semester.projectedGPA && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" fontWeight="medium">
            Projected GPA:
          </Typography>
          <Typography variant="caption" fontWeight="medium">
            {semester.projectedGPA}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

function SemesterTimeline({ semesterData }) {
  // Use provided data or fallback to mock data
  const semesters =
    semesterData && semesterData.length > 0
      ? semesterData
      : getMockSemesterData();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Semester Timeline
      </Typography>

      <Box
        sx={{
          overflow: "auto",
          pb: 2,
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "grey.100",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.400",
            borderRadius: 4,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            minWidth: "fit-content",
            pb: 1,
          }}
        >
          {semesters.map((semester, index) => (
            <SemesterCard
              key={`${semester.semester}-${index}`}
              semester={semester}
              isCurrentSemester={semester.status === "Current"}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default SemesterTimeline;
