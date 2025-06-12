import { useState, useEffect } from "react";
import { onboardingService } from "../services/api/onboarding";

export const useOnboardingStatus = () => {
  const [onboardingStatus, setOnboardingStatus] = useState({
    isOnboardingComplete: false,
    missingFields: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setOnboardingStatus((prev) => ({ ...prev, loading: true, error: null }));

      const status = await onboardingService.getOnboardingStatus();

      setOnboardingStatus({
        isOnboardingComplete: status.isOnboardingComplete || false,
        missingFields: status.missingFields || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to check onboarding status:", error);

      // Fallback: check if user has basic academic info
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const hasBasicInfo =
          user.academic?.degree_program && user.academic?.academic_year;

        setOnboardingStatus({
          isOnboardingComplete: hasBasicInfo,
          missingFields: hasBasicInfo ? [] : ["academic_profile"],
          loading: false,
          error: error.message,
        });
      } catch {
        // If everything fails, assume onboarding is needed
        setOnboardingStatus({
          isOnboardingComplete: false,
          missingFields: ["academic_profile"],
          loading: false,
          error: error.message,
        });
      }
    }
  };

  const markOnboardingComplete = () => {
    setOnboardingStatus((prev) => ({
      ...prev,
      isOnboardingComplete: true,
      missingFields: [],
    }));
  };

  return {
    ...onboardingStatus,
    checkOnboardingStatus,
    markOnboardingComplete,
  };
};
