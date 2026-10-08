from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    case_type = Column(String(20), index=True, nullable=False) # "LOST" or "FOUND"
    
    # Overview
    title = Column(String(200), nullable=False)
    category = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="REPORTED", index=True, nullable=False)
    urgency = Column(String(20), default="NORMAL", nullable=False) # "LOW", "NORMAL", "HIGH", "URGENT"

    # Suspicious / Theft handling (non-accusatory, authority triage)
    is_suspicious_or_theft = Column(Boolean, default=False)
    theft_authority_notes = Column(Text, nullable=True)

    # Item Physical Characteristics
    brand = Column(String(100), nullable=True)
    model_name = Column(String(100), nullable=True)
    primary_color = Column(String(50), nullable=True)
    secondary_color = Column(String(50), nullable=True)
    material = Column(String(100), nullable=True)
    
    # Permanent vs Changeable features
    permanent_features = Column(Text, nullable=True) # Scratches, damage, structural markers
    changeable_features = Column(Text, nullable=True) # Cases, stickers, keychains, ribbons
    
    # Flexible Custom attributes & Images
    dynamic_attributes = Column(JSON, default=dict)
    images = Column(JSON, default=list) # List of file paths/URLs

    # Nature & Real-world Environmental Location Context
    location_name = Column(String(255), nullable=False) # e.g. "Cascade Falls Trailhead, Sector 3"
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    radius_meters = Column(Float, default=200.0)
    terrain_type = Column(String(100), default="Trail / Route") # Forest, Mountain, River/Water, Beach, Park, etc.
    route_path_notes = Column(Text, nullable=True) # e.g. "Between 2nd scenic overlook and wooden bridge"
    movement_notes = Column(Text, nullable=True) # e.g. "Downstream drift or picked up by another hiker"

    # Time & Date Context
    event_date = Column(String(50), nullable=False) # YYYY-MM-DD
    event_time_approx = Column(String(100), nullable=True) # e.g. "Between 14:00 and 15:30"

    # Safe Handover, Safe Storage & Contact
    current_storage_place = Column(String(255), nullable=True) # e.g. "Ranger Station North locker #4"
    handover_preference = Column(String(100), default="AUTHORIZED_STATION") # "AUTHORIZED_STATION", "PUBLIC_MEETING_POINT", "VERIFIED_PICKUP", "SECURE_DELIVERY"
    contact_name = Column(String(100), nullable=True)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(100), nullable=True)
    contact_preference = Column(String(50), default="PLATFORM_MEDIATED") # "PLATFORM_MEDIATED", "EMAIL", "PHONE"

    # Private Ownership Verification Vault (Protected & Masked from public)
    private_serial_or_imei = Column(String(100), nullable=True)
    private_secret_marks = Column(Text, nullable=True)
    private_known_contents = Column(Text, nullable=True)
    private_proof_notes = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan", order_by="TimelineEvent.timestamp.desc()")
    claims = relationship("OwnershipClaim", foreign_keys="OwnershipClaim.found_case_id", back_populates="found_case", cascade="all, delete-orphan")
