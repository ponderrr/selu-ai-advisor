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

export const onboardingService = {
  // Get onboarding progress/status
  async getOnboardingStatus() {
    try {
      const response = await fetch(`/onboarding/progress`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        // Fallback if new endpoint doesn't exist
        const fallbackResponse = await fetch(`/onboarding/status`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!fallbackResponse.ok) {
          throw new Error("Failed to fetch onboarding status");
        }

        return await fallbackResponse.json();
      }

      if (!response.ok) {
        throw new Error("Failed to fetch onboarding progress");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "getOnboardingStatus");
    }
  },

  // Get departments
  async getDepartments() {
    try {
      const response = await fetch(`/onboarding/departments`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      return await response.json();
    } catch (error) {
      // Fallback data if API not available
      console.warn("Using fallback department data");
      return [
        { id: "cst", name: "College of Science and Technology" },
        { id: "business", name: "College of Business" },
        { id: "arts", name: "College of Arts and Humanities" },
        { id: "education", name: "College of Education" },
      ];
    }
  },

  // Get majors for a department
  async getMajors(departmentId) {
    try {
      const response = await fetch(
        `/onboarding/majors?department_id=${departmentId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch majors");
      }

      return await response.json();
    } catch (error) {
      // Fallback data
      if (departmentId === "cst") {
        return [
          { id: "cs-bs", name: "Computer Science (BS)" },
          { id: "it-bs", name: "Information Technology (BS)" },
          { id: "cybersec-cert", name: "Cybersecurity (Certificate)" },
        ];
      }
      return [];
    }
  },

  // Get concentrations for a major
  async getConcentrations(majorId) {
    try {
      const response = await fetch(
        `/onboarding/concentrations?major_id=${majorId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch concentrations");
      }

      return await response.json();
    } catch (error) {
      // Fallback data
      if (majorId === "cs-bs") {
        return [
          { id: "general", name: "General Computer Science" },
          { id: "software", name: "Software Engineering" },
          { id: "cybersec", name: "Cybersecurity" },
          { id: "data", name: "Data Science & Analytics" },
        ];
      }
      return [];
    }
  },

  // Save academic profile
  async saveAcademicProfile(profileData) {
    try {
      const response = await fetch(`/onboarding/academic-profile`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to save academic profile");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "saveAcademicProfile");
    }
  },

  // Save course history method selection
  async saveCourseHistoryMethod(method, skipReason = null) {
    try {
      const response = await fetch(`/onboarding/course-history-method`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          method,
          skip_reason: skipReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save course history method");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "saveCourseHistoryMethod");
    }
  },

  // Upload transcript for AI processing
  async uploadTranscript(file) {
    try {
      const formData = new FormData();
      formData.append("transcript", file);

      const response = await fetch(`/onboarding/transcript-upload`, {
        method: "POST",
        headers: getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload transcript");
      }

      const result = await response.json();

      // If processing is async, poll for results
      if (result.processing_id) {
        return await this.pollTranscriptProcessing(result.processing_id);
      }

      return result;
    } catch (error) {
      handleApiError(error, "uploadTranscript");
    }
  },

  // Poll transcript processing status
  async pollTranscriptProcessing(processingId) {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `/onboarding/transcript-processing/${processingId}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check processing status");
        }

        const result = await response.json();

        if (result.status === "completed") {
          return result;
        } else if (result.status === "failed") {
          throw new Error(result.error || "Transcript processing failed");
        }

        // Wait 1 second before next attempt
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    throw new Error("Transcript processing timed out");
  },

  // Search courses for manual entry
  async searchCourses(query = "", filters = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (filters.department) params.append("department", filters.department);
      if (filters.level) params.append("level", filters.level);
      if (filters.credits) params.append("credits", filters.credits);

      const response = await fetch(
        `/onboarding/courses/search?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search courses");
      }

      return await response.json();
    } catch (error) {
      // Return fallback course data for development
      console.warn("Using fallback course data");
      return [
        {
          id: 1,
          code: "CS 161",
          title: "Algorithm Design and Implementation I",
          description: "Introduction to programming and problem solving.",
          credits: 3,
          department: "CS",
          level: "100",
          prerequisites: [],
        },
        {
          id: 2,
          code: "CS 162",
          title: "Algorithm Design and Implementation II",
          description: "Advanced programming concepts and data structures.",
          credits: 3,
          department: "CS",
          level: "100",
          prerequisites: ["CS 161"],
        },
        {
          id: 3,
          code: "MATH 165",
          title: "Calculus I",
          description: "Differential calculus of functions of one variable.",
          credits: 4,
          department: "MATH",
          level: "100",
          prerequisites: [],
        },
        {
          id: 4,
          code: "ENGL 101",
          title: "English Composition I",
          description: "Fundamentals of written communication.",
          credits: 3,
          department: "ENGL",
          level: "100",
          prerequisites: [],
        },
        {
          id: 5,
          code: "HIST 201",
          title: "United States History I",
          description: "American history from colonial times to 1877.",
          credits: 3,
          department: "HIST",
          level: "200",
          prerequisites: [],
        },
      ];
    }
  },

  // Save course history (from AI or manual)
  async saveCourseHistory(courses) {
    try {
      const response = await fetch(`/onboarding/course-history`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ courses }),
      });

      if (!response.ok) {
        throw new Error("Failed to save course history");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "saveCourseHistory");
    }
  },

  // Save user preferences
  async savePreferences(preferences) {
    try {
      const response = await fetch(`/onboarding/preferences`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "savePreferences");
    }
  },

  // Complete onboarding
  async completeOnboarding() {
    try {
      const response = await fetch(`/onboarding/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, "completeOnboarding");
    }
  },

  // Get academic status options
  async getAcademicStatuses() {
    try {
      const response = await fetch(`/onboarding/academic-statuses`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Return fallback data
        return [
          { value: "freshman", label: "New freshman" },
          {
            value: "transfer",
            label: "Transfer student (with transfer credits)",
          },
          { value: "continuing", label: "Continuing student" },
          { value: "returning", label: "Returning student" },
          { value: "graduate", label: "Graduate student" },
        ];
      }

      return await response.json();
    } catch (error) {
      // Return fallback data on error
      return [
        { value: "freshman", label: "New freshman" },
        {
          value: "transfer",
          label: "Transfer student (with transfer credits)",
        },
        { value: "continuing", label: "Continuing student" },
        { value: "returning", label: "Returning student" },
        { value: "graduate", label: "Graduate student" },
      ];
    }
  },

  // Get graduation year options
  async getGraduationYears() {
    try {
      const response = await fetch(`/onboarding/graduation-years`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Generate fallback data
        const currentYear = new Date().getFullYear();
        return {
          semesters: ["Fall", "Spring", "Summer"],
          years: Array.from({ length: 7 }, (_, i) => currentYear + i),
        };
      }

      return await response.json();
    } catch (error) {
      // Return fallback data
      const currentYear = new Date().getFullYear();
      return {
        semesters: ["Fall", "Spring", "Summer"],
        years: Array.from({ length: 7 }, (_, i) => currentYear + i),
      };
    }
  },
};
