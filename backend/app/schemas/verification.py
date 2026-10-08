from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class OwnershipClaimBase(BaseModel):
    claimant_name: str
    claimant_contact: str
    claimant_evidence: str
    claimant_attachments: List[str] = []

class OwnershipClaimCreate(OwnershipClaimBase):
    found_case_id: int
    lost_case_id: Optional[int] = None

class OwnershipClaimReview(BaseModel):
    status: str # "APPROVED", "REJECTED", "ADDITIONAL_INFO_NEEDED"
    authority_notes: Optional[str] = None

class OwnershipClaimRead(OwnershipClaimBase):
    id: int
    found_case_id: int
    lost_case_id: Optional[int] = None
    status: str
    authority_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
