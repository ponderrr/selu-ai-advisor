import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import theme from "./styles/theme";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MainDashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";

import {
  AcademicProfile,
  CourseHistoryMethod,
  TranscriptUpload,
  ManualEntry,
  Preferences,
} from "./pages/onboarding";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ONBOARDING ROUTES */}
            <Route
              path="/onboarding/academic-profile"
              element={
                <ProtectedRoute>
                  <AcademicProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/course-history"
              element={
                <ProtectedRoute>
                  <CourseHistoryMethod />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/transcript-upload"
              element={
                <ProtectedRoute>
                  <TranscriptUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/manual-entry"
              element={
                <ProtectedRoute>
                  <ManualEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/preferences"
              element={
                <ProtectedRoute>
                  <Preferences />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Chat />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Schedule />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
