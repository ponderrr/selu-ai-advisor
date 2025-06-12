from pydantic import BaseModel
from typing import List
from datetime import datetime

class OnboardingProgressResponse(BaseModel):
    isOnboardingComplete: bool
    currentStep: int
    completedSteps: List[str]
    missingFields: List[str]
    lastUpdated: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "isOnboardingComplete": False,
                "currentStep": 1,
                "completedSteps": ["academic_profile"],
                "missingFields": ["course_history"],
                "lastUpdated": "2025-06-11T10:30:00Z"
            }
        }
    } 