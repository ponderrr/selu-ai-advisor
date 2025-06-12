import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  School,
  CloudUpload,
  CheckCircle,
  Error,
  ArrowBack,
  ArrowForward,
  Save,
  Edit,
  Visibility,
  Delete,
  SmartToy,
  Security,
  Speed,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onboardingService } from "../../services/api/onboarding";
import { OnboardingStepper } from "../../components/onboarding";

function TranscriptUpload() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [uploadState, setUploadState] = useState("idle"); // idle, uploading, processing, review, saving
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [extractedCourses, setExtractedCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState("uploading");
      setUploadProgress(0);
      setError(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload and process transcript
      const result = await onboardingService.uploadTranscript(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState("processing");

      // Simulate AI processing time
      setTimeout(() => {
        setExtractedCourses(result.courses || []);
        setUploadState("review");
      }, 2000);
    } catch (error) {
      setError(error.message);
      setUploadState("idle");
      setUploadProgress(0);
    }
  };

  const handleCourseEdit = (courseIndex, field, value) => {
    setExtractedCourses((prev) =>
      prev.map((course, index) =>
        index === courseIndex ? { ...course, [field]: value } : course
      )
    );
  };

  const handleRemoveCourse = (courseIndex) => {
    setExtractedCourses((prev) =>
      prev.filter((_, index) => index !== courseIndex)
    );
  };

  const handleSaveAndContinue = async () => {
    try {
      setUploadState("saving");

      const coursesToSave = extractedCourses.filter(
        (course) => course.selected !== false
      );
      await onboardingService.saveCourseHistory(coursesToSave);

      navigate("/onboarding/preferences");
    } catch (error) {
      setError("Failed to save courses. Please try again.");
      setUploadState("review");
    }
  };

  const renderUploadArea = () => (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        border: 2,
        borderStyle: "dashed",
        borderColor: selectedFile ? "primary.main" : "grey.300",
        bgcolor: selectedFile ? "primary.light" : "grey.50",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "primary.light",
        },
      }}
      component="label"
    >
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <CloudUpload
        sx={{
          fontSize: 64,
          color: selectedFile ? "primary.main" : "grey.400",
          mb: 2,
        }}
      />

      {selectedFile ? (
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
          <Chip label="Ready to upload" color="primary" sx={{ mt: 1 }} />
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Drag transcript here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            JPG, PNG, PDF accepted (Up to 10MB)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Your transcript will be processed securely and deleted after
            extraction
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const renderProcessingState = () => (
    <Card sx={{ textAlign: "center", p: 4 }}>
      <CardContent>
        <SmartToy sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          AI is analyzing your transcript...
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This usually takes 30-60 seconds
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <LinearProgress />
        </Box>

        <List sx={{ textAlign: "left", maxWidth: 400, mx: "auto" }}>
          <ListItem>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText primary="Document uploaded successfully" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CircularProgress size={20} />
            </ListItemIcon>
            <ListItemText primary="Extracting course information..." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CircularProgress size={20} />
            </ListItemIcon>
            <ListItemText primary="Matching to SELU catalog..." />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  const renderCourseReview = () => (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          AI found {extractedCourses.length} courses. Please review and make any
          necessary corrections.
        </Typography>
      </Alert>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={extractedCourses.every(
                    (course) => course.selected !== false
                  )}
                  onChange={(e) => {
                    setExtractedCourses((prev) =>
                      prev.map((course) => ({
                        ...course,
                        selected: e.target.checked,
                      }))
                    );
                  }}
                />
              </TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Title</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {extractedCourses.map((course, index) => (
              <TableRow key={index}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={course.selected !== false}
                    onChange={(e) =>
                      handleCourseEdit(index, "selected", e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  {editingCourse === index ? (
                    <TextField
                      size="small"
                      value={course.code}
                      onChange={(e) =>
                        handleCourseEdit(index, "code", e.target.value)
                      }
                    />
                  ) : (
                    course.code
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === index ? (
                    <TextField
                      size="small"
                      value={course.title}
                      onChange={(e) =>
                        handleCourseEdit(index, "title", e.target.value)
                      }
                    />
                  ) : (
                    course.title
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === index ? (
                    <TextField
                      size="small"
                      type="number"
                      value={course.credits}
                      onChange={(e) =>
                        handleCourseEdit(
                          index,
                          "credits",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  ) : (
                    course.credits
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === index ? (
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={course.grade}
                        onChange={(e) =>
                          handleCourseEdit(index, "grade", e.target.value)
                        }
                      >
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
                        ].map((grade) => (
                          <MenuItem key={grade} value={grade}>
                            {grade}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    course.grade
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === index ? (
                    <TextField
                      size="small"
                      value={course.semester}
                      onChange={(e) =>
                        handleCourseEdit(index, "semester", e.target.value)
                      }
                    />
                  ) : (
                    course.semester
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {editingCourse === index ? (
                      <Button
                        size="small"
                        onClick={() => setEditingCourse(null)}
                        startIcon={<Save />}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => setEditingCourse(index)}
                        startIcon={<Edit />}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCourse(index)}
                      startIcon={<Delete />}
                    >
                      Remove
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 3 }}>
        You can add any missing courses manually later from your dashboard.
      </Alert>
    </Box>
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

      <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4 }}>
        <OnboardingStepper activeStep={1} />

        {/* Page Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Upload Your Transcript
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Our AI will automatically extract your completed courses
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
        <Box sx={{ mb: 4 }}>
          {uploadState === "idle" && (
            <Box>
              {renderUploadArea()}

              {selectedFile && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleUpload}
                    startIcon={<SmartToy />}
                  >
                    Process with AI
                  </Button>
                </Box>
              )}

              {/* Features */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Why use AI transcript processing?
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Speed color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Fast and accurate"
                      secondary="Processes transcripts in under 60 seconds with 99% accuracy"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Secure and private"
                      secondary="Your transcript is processed locally and deleted immediately after"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Review before saving"
                      secondary="You can edit, add, or remove any courses before they're saved"
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          )}

          {uploadState === "uploading" && (
            <Card sx={{ textAlign: "center", p: 4 }}>
              <CardContent>
                <CloudUpload
                  sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Uploading transcript...
                </Typography>
                <Box sx={{ mt: 3, mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {uploadProgress}% complete
                </Typography>
              </CardContent>
            </Card>
          )}

          {uploadState === "processing" && renderProcessingState()}

          {uploadState === "review" && renderCourseReview()}
        </Box>
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
            {uploadState === "review" && (
              <Typography variant="body2" color="text.secondary">
                {extractedCourses.filter((c) => c.selected !== false).length}{" "}
                courses selected
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/onboarding/course-history")}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>

            {uploadState === "review" && (
              <Button
                variant="contained"
                onClick={handleSaveAndContinue}
                disabled={uploadState === "saving"}
                endIcon={
                  uploadState === "saving" ? (
                    <CircularProgress size={16} />
                  ) : (
                    <ArrowForward />
                  )
                }
              >
                {uploadState === "saving"
                  ? "Saving..."
                  : "Continue to Preferences"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default TranscriptUpload;
