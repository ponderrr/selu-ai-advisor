import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Chat,
  PieChart,
  CalendarMonth,
  Book,
  Settings,
  School,
  Add,
  Notifications,
  MoreVert,
  AttachFile,
  Send,
  ArrowForward,
  CalendarViewMonth,
  GraduationCap,
  Search,
  Person,
} from "@mui/icons-material";

import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { dashboardService } from "../services/api/dashboard";

const drawerWidth = 256;

// Mock data fallback (move this outside component to prevent recreation)
const mockData = {
  degreeProgress: {
    totalCredits: 120,
    completedCredits: 67,
    percentage: 56,
    progress_percentage: 56,
    completed_hours: 67,
    total_required: 120,
    categories: [
      { name: "Core Requirements", completed: 25, total: 45, color: "#026937" },
      { name: "Major Courses", completed: 30, total: 45, color: "#FFC629" },
      { name: "Electives", completed: 12, total: 30, color: "#42a5f5" },
    ],
  },
  deadlines: [
    {
      title: "Spring Registration Opens",
      date: "November 1, 2024",
      daysLeft: 3,
      priority: "high",
    },
    {
      title: "Fall Semester Final Exams",
      date: "December 5-9, 2024",
      daysLeft: 37,
      priority: "medium",
    },
    {
      title: "Last Day to Drop Classes",
      date: "November 15, 2024",
      daysLeft: 17,
      priority: "low",
    },
  ],
  suggestedActions: [
    {
      title: "Register for CS350 - Spring registration opens in 3 days",
      actions: ["Ask AI", "Learn More"],
    },
    {
      title: "Complete your academic plan for Spring 2025",
      actions: ["Ask AI", "Start Plan"],
    },
    {
      title: "Apply for summer internships - deadlines approaching",
      actions: ["Ask AI", "View Options"],
    },
  ],
};

// Custom Circular Progress Component (renamed to avoid conflict)
const CustomCircularProgress = ({ percentage, size = 128 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#026937"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="h4"
          component="div"
          color="text.primary"
          fontWeight="bold"
        >
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
};

// Chat Message Component
const ChatMessage = ({ message, isAI }) => {
  return (
    <Box
      display="flex"
      alignItems="flex-start"
      mb={3}
      justifyContent={isAI ? "flex-start" : "flex-end"}
    >
      {isAI && (
        <Avatar sx={{ bgcolor: "#026937", mr: 2, width: 32, height: 32 }}>
          <School fontSize="small" />
        </Avatar>
      )}
      <Box maxWidth="80%">
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isAI ? "#e6f7ef" : "#f0f0f0",
            borderRadius: isAI ? "12px 12px 12px 0" : "12px 12px 0 12px",
          }}
        >
          <Typography variant="body2" color="text.primary">
            {message.message}
          </Typography>
          {message.courseList && (
            <Box component="ul" sx={{ mt: 1, mb: 1, pl: 2 }}>
              {message.courseList.map((course, index) => (
                <Typography
                  component="li"
                  key={index}
                  variant="body2"
                  sx={{ mb: 0.5 }}
                >
                  {course}
                </Typography>
              ))}
            </Box>
          )}
          {message.followUp && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {message.followUp}
            </Typography>
          )}
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block", textAlign: isAI ? "left" : "right" }}
        >
          {message.timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

function MainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State variables
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [degreeProgress, setDegreeProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [aiHealth, setAiHealth] = useState({ status: "checking" });

  // User data (fixed the scoping issue)
  const userData = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || "Student",
    email: user?.email || "student@selu.edu",
    avatar: user?.avatar || "/api/placeholder/40/40",
  };

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
    checkAiHealth();
  }, []);

  const loadInitialData = async () => {
    try {
      setProgressLoading(true);
      const progress = await dashboardService.getDegreeProgress();
      setDegreeProgress(progress);

      const welcomeMessage = {
        id: 1,
        type: "ai",
        message: `Hello ${userData.name}! I'm your SELU Computer Science AI Advisor. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      // Fallback to mock data if API fails
      setDegreeProgress(mockData.degreeProgress);

      const errorMessage = {
        id: 1,
        type: "ai",
        message:
          "Hello! I'm your CS Advisor AI. I'm currently running in demo mode. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([errorMessage]);
    } finally {
      setProgressLoading(false);
    }
  };

  const checkAiHealth = async () => {
    try {
      const health = await dashboardService.checkChatHealth();
      setAiHealth(health);
    } catch (error) {
      setAiHealth({ status: "unhealthy", message: "AI service unavailable" });
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoadingChat) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      message: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setIsLoadingChat(true);
    setChatError(null);

    try {
      const response = await dashboardService.sendChatMessage(currentInput);

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          message: response.response,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatError(error.message);

      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        message:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      "Plan Next Semester":
        "I'd like help planning my course schedule for next semester. What courses should I consider based on my current progress?",
      "Check Graduation":
        "How many more credits do I need to graduate? What are my remaining requirements?",
      "Find Courses":
        "Can you help me find courses that fit my schedule and degree requirements?",
      "Contact Human Advisor":
        "How can I contact a human academic advisor if I need additional help?",
    };

    const message = quickMessages[action];
    if (message) {
      setChatInput(message);
      // Auto-send after a brief delay
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: "Chat",
      icon: <Chat />,
      path: "/",
      active: location.pathname === "/",
    },
    {
      text: "Degree Progress",
      icon: <PieChart />,
      path: "/profile",
      active: location.pathname === "/profile",
    },
    {
      text: "Schedule Planner",
      icon: <CalendarMonth />,
      path: "/schedule",
      active: location.pathname === "/schedule",
    },
    {
      text: "Course Catalog",
      icon: <Book />,
      path: "/catalog",
      active: location.pathname === "/catalog",
    },
    {
      text: "Settings",
      icon: <Settings />,
      path: "/settings",
      active: location.pathname === "/settings",
    },
  ];

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: "#026937", mr: 1, borderRadius: 1 }}>
            <School />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              SELU
            </Typography>
            <Typography variant="caption" color="text.secondary">
              CS Advisor AI
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box display="flex" alignItems="center">
          <Avatar src={userData.avatar} sx={{ mr: 2 }}>
            {userData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {userData.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userData.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={item.active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "#026937",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#026937",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.active ? "white" : "inherit",
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Semester:{" "}
          <Typography component="span" fontWeight="medium">
            Fall 2024
          </Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Est. Graduation:{" "}
          <Typography component="span" fontWeight="medium">
            Spring 2026
          </Typography>
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="caption" color="text.secondary">
            🛡️ FERPA Compliant
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {sidebar}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" color="text.primary">
                AI Advisor Chat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Computer Science Major
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#026937" }}
                startIcon={<Add />}
              >
                New Conversation
              </Button>
              <IconButton>
                <Badge badgeContent={2} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
          {/* Chat Area */}
          <Box
            sx={{
              width: "70%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "white",
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Current Conversation</Typography>
              <IconButton>
                <MoreVert />
              </IconButton>
            </Box>

            {/* Chat Messages */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isAI={message.type === "ai"}
                />
              ))}

              {isLoadingChat && (
                <Box display="flex" justifyContent="flex-start" mb={3}>
                  <Avatar
                    sx={{ bgcolor: "#026937", mr: 2, width: 32, height: 32 }}
                  >
                    <School fontSize="small" />
                  </Avatar>
                  <Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: "#e6f7ef",
                        borderRadius: "12px 12px 12px 0",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Thinking...
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Chat Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              {chatError && (
                <Box sx={{ mb: 1, p: 1, bgcolor: "#ffebee", borderRadius: 1 }}>
                  <Typography variant="caption" color="error">
                    {chatError}
                  </Typography>
                </Box>
              )}

              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ bgcolor: "#f5f5f5", borderRadius: 2, px: 2, py: 1 }}
              >
                <IconButton size="small" disabled>
                  <AttachFile />
                </IconButton>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Ask about your degree progress, course suggestions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoadingChat}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton
                  size="small"
                  onClick={handleSendMessage}
                  disabled={isLoadingChat || !chatInput.trim()}
                  sx={{
                    bgcolor: "#026937",
                    color: "white",
                    "&:hover": { bgcolor: "#026937" },
                    "&:disabled": { bgcolor: "#ccc" },
                  }}
                >
                  {isLoadingChat ? <CircularProgress size={16} /> : <Send />}
                </IconButton>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Powered by Mistral 7B
                </Typography>
                <Typography
                  variant="caption"
                  color={
                    aiHealth.status === "healthy"
                      ? "success.main"
                      : "error.main"
                  }
                >
                  AI:{" "}
                  {aiHealth.status === "healthy" ? "🟢 Online" : "🔴 Offline"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Widgets Area */}
          <Box
            sx={{ width: "30%", bgcolor: "#f5f7fa", p: 2, overflowY: "auto" }}
          >
            {/* Degree Progress Widget */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Degree Progress
                </Typography>

                {progressLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : degreeProgress ? (
                  <>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <CustomCircularProgress
                        percentage={Math.round(
                          degreeProgress.progress_percentage ||
                            degreeProgress.percentage
                        )}
                      />
                    </Box>
                    <Typography variant="body2" textAlign="center" mb={2}>
                      {degreeProgress.completed_hours ||
                        degreeProgress.completedCredits}{" "}
                      of{" "}
                      {degreeProgress.total_required ||
                        degreeProgress.totalCredits}{" "}
                      credits completed
                    </Typography>

                    {degreeProgress.categories ? (
                      <Box mb={2}>
                        {degreeProgress.categories.map((category, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            mb={1}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: category.color,
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {category.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {category.completed}/{category.total}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box mb={2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">
                            Credits Completed
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {degreeProgress.completed_hours ||
                              degreeProgress.completedCredits}
                            /
                            {degreeProgress.total_required ||
                              degreeProgress.totalCredits}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={
                              degreeProgress.progress_percentage ||
                              degreeProgress.percentage
                            }
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: "#026937",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    Unable to load degree progress
                  </Typography>
                )}

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ color: "#026937", cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                >
                  <Typography variant="body2" fontWeight="medium">
                    View Full Degree Audit
                  </Typography>
                  <ArrowForward fontSize="small" sx={{ ml: 0.5 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Deadlines
                </Typography>
                {mockData.deadlines.map((deadline, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Box
                      sx={{
                        bgcolor:
                          deadline.priority === "high"
                            ? "#ffebee"
                            : deadline.priority === "medium"
                              ? "#fff3e0"
                              : "#e3f2fd",
                        p: 1,
                        borderRadius: 1,
                        mr: 2,
                      }}
                    >
                      <CalendarMonth
                        sx={{
                          color:
                            deadline.priority === "high"
                              ? "#f44336"
                              : deadline.priority === "medium"
                                ? "#ff9800"
                                : "#2196f3",
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {deadline.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deadline.date} ({deadline.daysLeft} days)
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Actions */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Suggested Actions
                </Typography>
                {mockData.suggestedActions.map((action, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom:
                        index < mockData.suggestedActions.length - 1 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" mb={1}>
                      {action.title}
                    </Typography>
                    <Box display="flex" gap={1}>
                      {action.actions.map((btn, btnIndex) => (
                        <Button
                          key={btnIndex}
                          size="small"
                          variant={btnIndex === 1 ? "contained" : "outlined"}
                          sx={{
                            fontSize: "0.75rem",
                            bgcolor: btnIndex === 1 ? "#026937" : "transparent",
                            borderColor: btnIndex === 0 ? "#e0e0e0" : "#026937",
                          }}
                        >
                          {btn}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Grid container spacing={1}>
              {[
                {
                  icon: <CalendarViewMonth />,
                  text: "Plan Next Semester",
                  action: "Plan Next Semester",
                },
                {
                  icon: <GraduationCap />,
                  text: "Check Graduation",
                  action: "Check Graduation",
                },
                {
                  icon: <Search />,
                  text: "Find Courses",
                  action: "Find Courses",
                },
                {
                  icon: <Person />,
                  text: "Contact Human Advisor",
                  action: "Contact Human Advisor",
                },
              ].map((actionItem, index) => (
                <Grid item xs={6} key={index}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f5f5f5" },
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => handleQuickAction(actionItem.action)}
                  >
                    <Box sx={{ color: "#026937", mb: 1 }}>
                      {actionItem.icon}
                    </Box>
                    <Typography variant="caption" fontWeight="medium">
                      {actionItem.text}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MainDashboard;
