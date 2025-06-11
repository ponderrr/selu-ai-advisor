# app/schemas/progress.py
from pydantic import BaseModel
from datetime import date
from typing import Optional, List, Dict

class ProgressBase(BaseModel):
    course_id: int
    grade: Optional[str] = None
    completed: bool = False
    completion_date: Optional[date] = None

class ProgressResponse(BaseModel):
    w_number: str
    completed_hours: int
    total_required: int
    progress_percentage: float

    class Config:
        orm_mode = True


class ProgressCreate(BaseModel):
    course_id: int
    completed: bool = False
    grade: Optional[str] = None

class ProgressUpdate(BaseModel):
    completed: Optional[bool] = None
    grade: Optional[str] = None

class ProgressOut(ProgressBase):
    id: int
    student_id: int

    class Config:
        orm_mode = True

class CourseInfo(BaseModel):
    id: int
    name: str
    credits: float
    grade: Optional[str]
    completed: bool

class CategoryBreakdown(BaseModel):
    name: str
    required_credits: float
    completed_credits: float
    courses: List[CourseInfo]
    gpa: Optional[float]

class StudentInfo(BaseModel):
    name: str
    program: str
    expectedGraduation: str
    studentId: str
    status: str
    advisorName: Optional[str] = None

class ProgressOverview(BaseModel):
    totalCredits: float
    completedCredits: float
    percentage: float
    gpa: Dict[str, float]

class CategoryProgress(BaseModel):
    name: str
    completed: float
    total: float
    percentage: float
    color: str
    courses: Optional[List[CourseInfo]] = None
    subcategories: Optional[Dict[str, List[CourseInfo]]] = None

class ProgressDetailedResponse(BaseModel):
    student: StudentInfo
    overview: ProgressOverview
    categories: List[CategoryProgress]

class GPATrend(BaseModel):
    semester: str
    year: int
    semester_gpa: float
    cumulative_gpa: float
    credits_earned: float

class GradeDistribution(BaseModel):
    grade: str
    count: int
    percentage: float

class PerformanceMetrics(BaseModel):
    average_gpa: float
    highest_gpa: float
    lowest_gpa: float
    total_credits_earned: float
    grade_distribution: List[GradeDistribution]
    gpa_trend: List[GPATrend]
    improvement_rate: Optional[float] = None
    semester_comparison: Optional[dict] = None

class AnalyticsResponse(BaseModel):
    overall_metrics: PerformanceMetrics
    major_metrics: Optional[PerformanceMetrics] = None
    general_education_metrics: Optional[PerformanceMetrics] = None
    last_updated: str
