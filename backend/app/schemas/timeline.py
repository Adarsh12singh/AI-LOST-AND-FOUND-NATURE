from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TimelineEventBase(BaseModel):
    actor: str = "SYSTEM"
    action: str
    headline: str
    details: Optional[str] = None

class TimelineEventCreate(TimelineEventBase):
    case_id: int

class TimelineEventRead(TimelineEventBase):
    id: int
    case_id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
