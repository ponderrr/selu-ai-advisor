import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  School,
  Search,
  Add,
  Delete,
  ArrowBack,
  ArrowForward,
  Save,
  FilterList,
  ExpandMore,
  BookmarkAdd,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import { OnboardingStepper } from "../../components/onboarding";
import debounce from "lodash/debounce";

function ManualEntry() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    level: "",
    credits: "",
  });

  const debouncedLoadCourses = useCallback(
    debounce(async (search, filterParams) => {
      try {
        setLoading(true);
        const coursesData = await onboardingService.searchCourses(
          search,
          filterParams
        );
        setCourses(coursesData);
        setError(null);
      } catch (error) {
        setError("Failed to load courses. Please try again.");
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const loadCourses = async (search = "", filterParams = {}) => {
    debouncedLoadCourses(search, filterParams);
  };

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        !filters.department || course.department === filters.department;

      const matchesLevel = !filters.level || course.level === filters.level;

      const matchesCredits =
        !filters.credits || course.credits.toString() === filters.credits;

      return (
        matchesSearch && matchesDepartment && matchesLevel && matchesCredits
      );
    });
  }, [courses, searchQuery, filters]);

  const handleSearch = (newQuery) => {
    setSearchQuery(newQuery);
    if (newQuery.length >= 2) {
      loadCourses(newQuery, filters);
    }
  };

  const handleFilterChange = async (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    await loadCourses(searchQuery, newFilters);
  };

  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: `${course.code}-${Date.now()}`, // Unique ID for selected course
      grade: "",
      semester: "",
      year: new Date().getFullYear(),
    };

    setSelectedCourses((prev) => [...prev, newCourse]);
  };

  const removeCourse = (courseId) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const updateCourse = (courseId, field, value) => {
    setSelectedCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );
  };

  const handleSaveAndContinue = async () => {
    if (selectedCourses.length === 0) {
      setError("Please add at least one course or go back to skip this step.");
      return;
    }

    // Validate all courses have required fields
    const incompleteCourses = selectedCourses.filter(
      (course) => !course.grade || !course.semester || !course.year
    );

    if (incompleteCourses.length > 0) {
      setError(
        "Please fill in all grade, semester, and year fields for selected courses."
      );
      return;
    }

    try {
      setSaving(true);
      await onboardingService.saveCourseHistory(selectedCourses);
      navigate("/onboarding/preferences");
    } catch (error) {
      setError("Failed to save courses. Please try again.");
      console.error("Error saving courses:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderSearchAndFilters = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Search SELU Course Catalog
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by course code or title (e.g., CS 161, Calculus)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {}} // Could open filter modal
            sx={{ height: "100%" }}
          >
            Advanced Filters
          </Button>
        </Grid>
      </Grid>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="body2">Filter Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label="Department"
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="CS">Computer Science</MenuItem>
                  <MenuItem value="MATH">Mathematics</MenuItem>
                  <MenuItem value="ENGL">English</MenuItem>
                  <MenuItem value="HIST">History</MenuItem>
                  <MenuItem value="PHYS">Physics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Course Level</InputLabel>
                <Select
                  value={filters.level}
                  label="Course Level"
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="100">100-level</MenuItem>
                  <MenuItem value="200">200-level</MenuItem>
                  <MenuItem value="300">300-level</MenuItem>
                  <MenuItem value="400">400-level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Credits</InputLabel>
                <Select
                  value={filters.credits}
                  label="Credits"
                  onChange={(e) =>
                    handleFilterChange("credits", e.target.value)
                  }
                >
                  <MenuItem value="">Any Credits</MenuItem>
                  <MenuItem value="1">1 Credit</MenuItem>
                  <MenuItem value="2">2 Credits</MenuItem>
                  <MenuItem value="3">3 Credits</MenuItem>
                  <MenuItem value="4">4 Credits</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );

  const renderCourseResults = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Available Courses
        {filteredCourses.length > 0 && (
          <Chip
            label={`${filteredCourses.length} courses found`}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading courses...
          </Typography>
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || Object.values(filters).some((f) => f)
              ? "No courses found matching your search criteria."
              : "Start typing to search for courses."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredCourses.slice(0, 20).map((course) => (
            <Grid item xs={12} md={6} key={course.id}>
              <Card
                sx={{
                  height: "100%",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {course.code}
                    </Typography>
                    <Chip
                      label={`${course.credits} cr`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body1" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {course.description || "No description available"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip label={course.department} size="small" />
                    <Chip label={`Level ${course.level}`} size="small" />
                    {course.prerequisites &&
                      course.prerequisites.length > 0 && (
                        <Chip
                          label="Has Prerequisites"
                          size="small"
                          color="warning"
                        />
                      )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addCourse(course)}
                    disabled={selectedCourses.some(
                      (sc) => sc.code === course.code
                    )}
                  >
                    {selectedCourses.some((sc) => sc.code === course.code)
                      ? "Added"
                      : "Add Course"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredCourses.length > 20 && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing first 20 results. Use filters to narrow your search.
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const renderSelectedCourses = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Selected Courses
          <Chip
            label={`${selectedCourses.length} courses`}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>
        {selectedCourses.length > 0 && (
          <Button
            size="small"
            color="error"
            onClick={() => setSelectedCourses([])}
          >
            Clear All
          </Button>
        )}
      </Box>

      {selectedCourses.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            bgcolor: "grey.50",
            borderRadius: 1,
          }}
        >
          <BookmarkAdd sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No courses selected yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search and add courses from the catalog above
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {course.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{course.title}</Typography>
                  </TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={course.grade}
                        onChange={(e) =>
                          updateCourse(course.id, "grade", e.target.value)
                        }
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Grade
                        </MenuItem>
                        {[
                          "A",
                          "B+",
                          "B",
                          "C+",
                          "C",
                          "D+",
                          "D",
                          "F",
                          "P",
                          "W",
                          "I",
                        ].map((grade) => (
                          <MenuItem key={grade} value={grade}>
                            {grade}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={course.semester}
                        onChange={(e) =>
                          updateCourse(course.id, "semester", e.target.value)
                        }
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Semester
                        </MenuItem>
                        <MenuItem value="Fall">Fall</MenuItem>
                        <MenuItem value="Spring">Spring</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={course.year}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          updateCourse(course.id, "year", "");
                        } else {
                          const year = parseInt(value);
                          if (!isNaN(year)) {
                            const clampedYear = Math.min(
                              Math.max(year, 2000),
                              2030
                            );
                            updateCourse(course.id, "year", clampedYear);
                          }
                        }
                      }}
                      sx={{ width: 80 }}
                      inputProps={{ min: 2000, max: 2030 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeCourse(course.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", boxShadow: 1, py: 2, px: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <School sx={{ color: "white" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            CS Advisor
          </Typography>
          <Chip
            label="BETA"
            size="small"
            sx={{
              ml: 1,
              bgcolor: "secondary.main",
              color: "primary.main",
              fontWeight: "bold",
            }}
          />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, py: 4 }}>
        <OnboardingStepper activeStep={1} />

        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Add Your Completed Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Search and select courses from the SELU catalog
          </Typography>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/onboarding/course-history")}
            sx={{ mt: 2 }}
          >
            Back to Method Selection
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        {renderSearchAndFilters()}
        {renderCourseResults()}
        {renderSelectedCourses()}
      </Box>

      {/* Bottom Action Bar */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {selectedCourses.length} courses selected
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/onboarding/course-history")}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button
              variant="text"
              onClick={() => {
                // Skip course entry
                navigate("/onboarding/preferences");
              }}
            >
              Skip for Now
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAndContinue}
              disabled={saving}
              endIcon={
                saving ? <CircularProgress size={16} /> : <ArrowForward />
              }
            >
              {saving ? "Saving..." : "Continue to Preferences"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ManualEntry;
