from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class OwnershipClaim(Base):
    __tablename__ = "ownership_claims"

    id = Column(Integer, primary_key=True, index=True)
    found_case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    lost_case_id = Column(Integer, ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)

    claimant_name = Column(String(100), nullable=False)
    claimant_contact = Column(String(100), nullable=False)
    
    # Private proof supplied by claimant (hidden scratch, serial number, unlock passcode pattern, internal contents)
    claimant_evidence = Column(Text, nullable=False)
    claimant_attachments = Column(JSON, default=list) # receipts, old photos of item
    
    # Claim Status
    status = Column(String(50), default="PENDING_REVIEW", nullable=False) # "PENDING_REVIEW", "APPROVED", "REJECTED", "ADDITIONAL_INFO_NEEDED"
    authority_notes = Column(Text, nullable=True) # Authorized official's evaluation notes

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship
    found_case = relationship("Case", back_populates="claims", foreign_keys=[found_case_id])
    lost_case = relationship("Case", foreign_keys=[lost_case_id])
