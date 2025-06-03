const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const dashboardService = {
  // Get degree progress data
  async getDegreeProgress() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/progress/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch degree progress: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching degree progress:", error);
      throw error;
    }
  },

  // Send chat message to AI
  async sendChatMessage(message, context = null) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  // Check AI service health
  async checkChatHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Get user courses (for course recommendations)
  async getUserCourses() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
