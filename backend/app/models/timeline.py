from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    actor = Column(String(50), default="SYSTEM", nullable=False) # "SYSTEM", "OWNER", "FINDER", "AUTHORITY"
    action = Column(String(100), nullable=False) # "CASE_CREATED", "PROFILE_ANALYZED", "POTENTIAL_MATCH_DETECTED", etc.
    headline = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)

    # Relationship
    case = relationship("Case", back_populates="timeline_events")
