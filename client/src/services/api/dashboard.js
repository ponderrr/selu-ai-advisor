const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleApiError = (error, functionName) => {
  console.error(`Error in ${functionName}:`, error);
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    throw new Error(
      "Backend not available. Please ensure the server is running."
    );
  }
  throw error;
};

export const dashboardService = {
  // Get basic degree progress data
  async getDegreeProgress() {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch degree progress: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getDegreeProgress");
    }
  },

  // Get detailed progress data
  async getDetailedProgress() {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/detailed`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch detailed progress: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getDetailedProgress");
    }
  },

  // Get semester timeline data
  async getSemesterTimeline() {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/semesters`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch semester timeline: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching semester timeline:", error);
      throw error;
    }
  },

  // Get graduation requirements
  async getGraduationRequirements() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/graduation-requirements`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch graduation requirements: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching graduation requirements:", error);
      throw error;
    }
  },

  // Get enhanced user profile
  async getEnhancedProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/me/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch enhanced profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getEnhancedProfile");
    }
  },

  // Get course recommendations
  async getCourseRecommendations() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/recommendations`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch course recommendations: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getCourseRecommendations");
    }
  },

  // Get academic analytics
  async getAcademicAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/analytics`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch academic analytics: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching academic analytics:", error);
      throw error;
    }
  },

  // Download progress report
  async downloadProgressReport(format = "pdf") {
    const allowedFormats = ["pdf", "csv", "xlsx"];
    if (!allowedFormats.includes(format)) {
      throw new Error(
        `Invalid format: ${format}. Allowed formats: ${allowedFormats.join(
          ", "
        )}`
      );
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/report/download?format=${format}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download report: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading report:", error);
      throw error;
    }
  },

  // Send message to AI
  async sendChatMessage(message, context = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  },

  // Check AI chat health
  async checkChatHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking chat health:", error);
      return { status: "unhealthy", message: "Service unavailable" };
    }
  },

  // Get user courses
  async getUserCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user courses: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user courses:", error);
      throw error;
    }
  },

  // Search courses
  async searchCourses(query) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Course search failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  },
};
