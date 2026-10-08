from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class PotentialMatchBase(BaseModel):
    lost_case_id: int
    found_case_id: int
    overall_score: float
    confidence: str # "VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"
    status: str = "SUGGESTED"
    score_breakdown: Dict[str, Any] = {}
    evidence_explanation: List[str] = []

class PotentialMatchRead(PotentialMatchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MatchSearchRequest(BaseModel):
    case_id: int
    min_confidence: Optional[str] = "LOW"
