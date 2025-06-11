from pydantic import BaseModel
from datetime import datetime
from typing import List

class SessionInfo(BaseModel):
    id: int
    device_info: str
    ip_address: str | None
    created_at: datetime
    last_activity: datetime

class SessionList(BaseModel):
    sessions: List[SessionInfo] 