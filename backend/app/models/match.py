from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class PotentialMatch(Base):
    __tablename__ = "potential_matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    found_case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)

    overall_score = Column(Float, nullable=False) # 0.0 - 100.0
    confidence = Column(String(50), nullable=False) # "VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"
    status = Column(String(50), default="SUGGESTED", nullable=False) # "SUGGESTED", "REVIEWING", "VERIFIED", "DISMISSED"

    # Multi-signal breakdown
    score_breakdown = Column(JSON, default=dict) # category, text_similarity, visual_similarity, location_compatibility, time_compatibility, attributes
    
    # Explainable AI matching evidence (Human-readable evidence points)
    evidence_explanation = Column(JSON, default=list) # ["Category match: Both are Backpacks", "Color match: Navy/Dark Blue", etc.]

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    lost_case = relationship("Case", foreign_keys=[lost_case_id])
    found_case = relationship("Case", foreign_keys=[found_case_id])
