from pydantic import BaseModel, Field

class OTPVerifyRequest(BaseModel):
    user_id: int
    code: int = Field(..., ge=100_000, le=999_999, description="6-digit OTP")