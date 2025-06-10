const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const authService = {
  // Login with email and password (matches your backend)
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Login failed" }));
        throw new Error(error.detail || error.message || "Login failed");
      }

      const data = await response.json();

      // Store tokens (your backend returns access_token, refresh_token, token_type)
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please ensure the backend is running."
        );
      }
      throw error;
    }
  },

  // Register new user (matches your backend UserCreate schema)
  async register(userData) {
    try {
      // First create the user account
      const response = await fetch(`${API_BASE_URL}users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          w_number: userData.wNumber || `W${Date.now().toString().slice(-7)}`, // at most 7 digits
          email: userData.email,
          password: userData.password || "temporary_password", // Backend requires this
          first_name: userData.firstName,
          last_name: userData.lastName,
          degree_program: userData.degreeProgram,
          academic_year: userData.academicYear,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Registration failed" }));
        throw new Error(error.detail || error.message || "Registration failed");
      }

      const userData_response = await response.json();

      // After successful registration, automatically log them in
      const loginResponse = await this.login(
        userData.email,
        userData.password || "temporary_password"
      );

      return {
        user: userData_response,
        ...loginResponse,
      };
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please ensure the backend is running."
        );
      }
      throw error;
    }
  },

  // Get current user info (matches your backend endpoint)
  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}auth/users/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Token might be expired, try to refresh
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            return this.getCurrentUser();
          }
        }
        throw new Error("Failed to get user information");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Backend not available");
      }
      throw error;
    }
  },

  // Refresh access token (matches your backend endpoint)
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      // Update stored tokens
      localStorage.setItem("authToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      return true;
    } catch (error) {
      // Refresh failed, clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return false;
    }
  },

  // Verify if current token is valid
  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}auth/users/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Backend not available");
      }
      throw error;
    }
  },

  // Logout (clear local storage)
  async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    return { success: true };
  },
};
