import {
  validateWNumber,
  validateSeluEmail,
} from "../validation/authValidation";
import { validateRegistrationForm } from "../validation/authValidation";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

  async register(userData) {
    try {
      const errors = validateRegistrationForm(userData);
      if (Object.keys(errors).length > 0) {
        // Take the first error message and throw it
        const firstErrorKey = Object.keys(errors)[0];
        throw new Error(errors[firstErrorKey]);
      }

      // Use proper registration endpoint with OTP
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          wNumber: userData.wNumber || null,
          academic: {
            status: userData.status,
            expectedGraduation: userData.expectedGraduation,
            classStanding: userData.classStanding,
            major: userData.major || "Computer Science",
          },
          preferredName: userData.preferredName,
          agreements: {
            termsOfService: userData.agreeTerms,
            codeOfConduct: userData.agreeCode,
            ferpaConsent: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Registration failed" }));
        throw new Error(error.detail || error.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please ensure the backend is running."
        );
      }
      throw error;
    }
  },

  // OTP verification method
  async verifyRegistration(email, otpCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otpCode,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Verification failed" }));
        throw new Error(error.detail || error.message || "Verification failed");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Backend not available");
      }
      throw error;
    }
  },

  // Resend OTP method
  async resendRegistrationOTP(email) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/resend-registration-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Failed to resend OTP" }));
        throw new Error(
          error.detail || error.message || "Failed to resend OTP"
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Backend not available");
      }
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/auth/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
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

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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

      localStorage.setItem("authToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      return true;
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return false;
    }
  },

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/me`, {
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

  async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    return { success: true };
  },
};
