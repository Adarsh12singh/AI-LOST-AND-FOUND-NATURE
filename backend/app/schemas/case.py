from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from app.schemas.timeline import TimelineEventRead

class CaseBase(BaseModel):
    case_type: str # "LOST" or "FOUND"
    title: str
    category: str
    description: str
    urgency: str = "NORMAL" # "LOW", "NORMAL", "HIGH", "URGENT"

    # Physical / Attribute info
    brand: Optional[str] = None
    model_name: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    material: Optional[str] = None
    permanent_features: Optional[str] = None # Scratches, structural marks, physical wear
    changeable_features: Optional[str] = None # Case, stickers, keychains, ribbons
    dynamic_attributes: Dict[str, Any] = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)

    # Nature & Real-world Environmental Location Context
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meters: Optional[float] = 200.0
    terrain_type: str = "Trail / Route" # Forest, Mountain, River/Water, Beach, Park, etc.
    route_path_notes: Optional[str] = None
    movement_notes: Optional[str] = None

    # Time & Date
    event_date: str # YYYY-MM-DD
    event_time_approx: Optional[str] = None

    # Safe Handover & Storage
    current_storage_place: Optional[str] = None
    handover_preference: str = "AUTHORIZED_STATION" # "AUTHORIZED_STATION", "PUBLIC_MEETING_POINT", "VERIFIED_PICKUP", "SECURE_DELIVERY"
    contact_preference: str = "PLATFORM_MEDIATED"

    # Suspicious / Theft (Discreet triage)
    is_suspicious_or_theft: bool = False
    theft_authority_notes: Optional[str] = None

class CaseCreate(CaseBase):
    # Private vault fields (only stored, never exposed in public listing)
    private_serial_or_imei: Optional[str] = None
    private_secret_marks: Optional[str] = None
    private_known_contents: Optional[str] = None
    private_proof_notes: Optional[str] = None
    
    # Private contact info
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    urgency: Optional[str] = None
    
    brand: Optional[str] = None
    model_name: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    material: Optional[str] = None
    permanent_features: Optional[str] = None
    changeable_features: Optional[str] = None
    dynamic_attributes: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = None

    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meters: Optional[float] = None
    terrain_type: Optional[str] = None
    route_path_notes: Optional[str] = None
    movement_notes: Optional[str] = None

    current_storage_place: Optional[str] = None
    handover_preference: Optional[str] = None

class CaseRead(CaseBase):
    id: int
    case_number: str
    status: str
    created_at: datetime
    updated_at: datetime
    timeline_events: List[TimelineEventRead] = []

    # Privacy masking: private fields are NOT included in public CaseRead
    has_private_verification_keys: bool = False
    model_config = ConfigDict(from_attributes=True)

class CaseReadDetail(CaseRead):
    """Detailed view for case owner or authorized personnel with private verification indicators."""
    has_serial_number: bool = False
    has_secret_marks: bool = False
    has_known_contents: bool = False
    claims_count: int = 0
