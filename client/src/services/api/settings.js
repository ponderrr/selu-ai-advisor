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

const getMultipartHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    // Don't set Content-Type for multipart, let browser set it
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

export const settingsService = {
  // ===== USER PROFILE MANAGEMENT =====

  async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getUserProfile");
    }
  },

  async updateUserProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "updateUserProfile");
    }
  },

  async uploadProfilePhoto(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload profile photo: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "uploadProfilePhoto");
    }
  },

  async deleteProfilePhoto() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete profile photo: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "deleteProfilePhoto");
    }
  },

  // ===== ACADEMIC INFORMATION =====

  async getAcademicInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/academic`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch academic info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getAcademicInfo");
    }
  },

  async updateAcademicInfo(academicData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/academic`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(academicData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update academic info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "updateAcademicInfo");
    }
  },

  async getAvailableMajors() {
    try {
      const response = await fetch(`${API_BASE_URL}/academic/majors`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch majors: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getAvailableMajors");
    }
  },

  async getAvailableConcentrations(major) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/academic/concentrations?major=${encodeURIComponent(major)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch concentrations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getAvailableConcentrations");
    }
  },

  // ===== SECURITY & AUTHENTICATION =====

  async getActiveSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch active sessions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getActiveSessions");
    }
  },

  async signOutSession(sessionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to sign out session: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "signOutSession");
    }
  },

  async signOutAllSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sessions/all`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to sign out all sessions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "signOutAllSessions");
    }
  },

  async enable2FA() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to enable 2FA: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "enable2FA");
    }
  },

  async disable2FA() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to disable 2FA: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "disable2FA");
    }
  },

  async getLoginHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-history`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch login history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getLoginHistory");
    }
  },

  // ===== PRIVACY & DATA CONTROLS =====

  async getPrivacySettings() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/privacy-settings`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch privacy settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getPrivacySettings");
    }
  },

  async updatePrivacySettings(privacyData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/privacy-settings`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(privacyData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update privacy settings: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "updatePrivacySettings");
    }
  },

  async requestDataExport() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/data-export`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to request data export: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      handleApiError(error, "requestDataExport");
    }
  },

  async requestAccountDeletion() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/data-deletion`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to request account deletion: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "requestAccountDeletion");
    }
  },

  async deleteConversationHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/conversations`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete conversation history: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "deleteConversationHistory");
    }
  },

  // ===== AI PREFERENCES =====

  async getAIPreferences() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/ai-preferences`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI preferences: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getAIPreferences");
    }
  },

  async updateAIPreferences(aiData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/ai-preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(aiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update AI preferences: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "updateAIPreferences");
    }
  },

  async resetAILearning() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/ai-preferences/reset`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reset AI learning: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "resetAILearning");
    }
  },

  // ===== NOTIFICATION SETTINGS =====

  async getNotificationSettings() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/notification-settings`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch notification settings: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getNotificationSettings");
    }
  },

  async updateNotificationSettings(notificationData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/notification-settings`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(notificationData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update notification settings: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "updateNotificationSettings");
    }
  },
};
