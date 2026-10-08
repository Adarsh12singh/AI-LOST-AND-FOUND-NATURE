from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.case import Case
from app.models.timeline import TimelineEvent
from app.models.match import PotentialMatch
from app.schemas.case import CaseCreate, CaseUpdate
from app.services.timeline_service import log_timeline_event
from app.services.matching_engine import run_persistent_rematching_for_case

def generate_case_number(db: Session, case_type: str) -> str:
    """Generates an official, human-readable case number: e.g. LST-2026-0001 or FND-2026-0002."""
    prefix = "LST" if case_type == "LOST" else "FND"
    year = datetime.now(timezone.utc).year
    count = db.query(func.count(Case.id)).scalar() or 0
    return f"{prefix}-{year}-{(count + 1):04d}"

def create_case(db: Session, case_in: CaseCreate) -> Case:
    """Creates a new Lost or Found case, records initial timeline, and runs persistent re-matching."""
    case_number = generate_case_number(db, case_in.case_type)
    
    # Initial status based on whether it is lost or found
    initial_status = "SEARCHING" if case_in.case_type == "LOST" else "STORED_WAITING_CLAIM"

    db_case = Case(
        case_number=case_number,
        case_type=case_in.case_type,
        title=case_in.title,
        category=case_in.category,
        description=case_in.description,
        status=initial_status,
        urgency=case_in.urgency,

        # Suspicious flag
        is_suspicious_or_theft=case_in.is_suspicious_or_theft,
        theft_authority_notes=case_in.theft_authority_notes,

        # Physical Attributes
        brand=case_in.brand,
        model_name=case_in.model_name,
        primary_color=case_in.primary_color,
        secondary_color=case_in.secondary_color,
        material=case_in.material,
        permanent_features=case_in.permanent_features,
        changeable_features=case_in.changeable_features,
        dynamic_attributes=case_in.dynamic_attributes,
        images=case_in.images,

        # Environmental Location
        location_name=case_in.location_name,
        latitude=case_in.latitude,
        longitude=case_in.longitude,
        radius_meters=case_in.radius_meters or 200.0,
        terrain_type=case_in.terrain_type,
        route_path_notes=case_in.route_path_notes,
        movement_notes=case_in.movement_notes,

        # Time & Date
        event_date=case_in.event_date,
        event_time_approx=case_in.event_time_approx,

        # Safe Storage & Handover
        current_storage_place=case_in.current_storage_place,
        handover_preference=case_in.handover_preference,
        contact_preference=case_in.contact_preference,
        contact_name=case_in.contact_name,
        contact_email=case_in.contact_email,
        contact_phone=case_in.contact_phone,

        # Private Vault (masked from public view)
        private_serial_or_imei=case_in.private_serial_or_imei,
        private_secret_marks=case_in.private_secret_marks,
        private_known_contents=case_in.private_known_contents,
        private_proof_notes=case_in.private_proof_notes,
    )

    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    # 1. Log Initial Case Creation Event
    actor = "OWNER" if case_in.case_type == "LOST" else "FINDER"
    role_desc = "Lost Item Report" if case_in.case_type == "LOST" else "Found Item Report"
    log_timeline_event(
        db=db,
        case_id=db_case.id,
        action="CASE_CREATED",
        headline=f"{role_desc} registered: #{case_number}",
        details=f"Item: '{db_case.title}' ({db_case.category}) at '{db_case.location_name}'. Initial status: {initial_status}.",
        actor=actor
    )

    # 2. Log Profile Generation
    log_timeline_event(
        db=db,
        case_id=db_case.id,
        action="PROFILE_ANALYZED",
        headline="Intelligent Item Profile Initialized",
        details=f"Attributes indexed: Category={db_case.category}, Brand={db_case.brand or 'N/A'}, Color={db_case.primary_color or 'N/A'}, Terrain={db_case.terrain_type}.",
        actor="SYSTEM"
    )

    # 3. Persistent Re-Matching: Evaluate against historical active cases
    run_persistent_rematching_for_case(db, db_case)

    return db_case

def get_cases(
    db: Session,
    case_type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    terrain_type: Optional[str] = None,
    query_str: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Case]:
    """Retrieve filtered list of cases for the public explorer or authority dashboard."""
    q = db.query(Case)
    if case_type:
        q = q.filter(Case.case_type == case_type.upper())
    if category:
        q = q.filter(Case.category == category)
    if status:
        q = q.filter(Case.status == status)
    if terrain_type:
        q = q.filter(Case.terrain_type == terrain_type)
    if query_str:
        search_pattern = f"%{query_str}%"
        q = q.filter(
            (Case.title.ilike(search_pattern)) |
            (Case.description.ilike(search_pattern)) |
            (Case.location_name.ilike(search_pattern)) |
            (Case.brand.ilike(search_pattern)) |
            (Case.case_number.ilike(search_pattern))
        )
    return q.order_by(desc(Case.created_at)).offset(skip).limit(limit).all()

def get_case_by_id(db: Session, case_id: int) -> Optional[Case]:
    return db.query(Case).filter(Case.id == case_id).first()

def update_case_status(
    db: Session,
    case_id: int,
    new_status: str,
    notes: Optional[str] = None,
    actor: str = "SYSTEM"
) -> Optional[Case]:
    case = get_case_by_id(db, case_id)
    if not case:
        return None
    old_status = case.status
    case.status = new_status
    db.commit()
    db.refresh(case)

    log_timeline_event(
        db=db,
        case_id=case.id,
        action="STATUS_CHANGED",
        headline=f"Status transitioned from {old_status} to {new_status}",
        details=notes or f"Case #{case.case_number} status updated to {new_status}.",
        actor=actor
    )
    return case

def get_hotspot_analytics(db: Session) -> Dict[str, Any]:
    """Aggregates anonymized geospatial & terrain hotspots to assist park/authority management."""
    # Group by location_name
    location_counts = (
        db.query(Case.location_name, func.count(Case.id).label("total_count"))
        .group_by(Case.location_name)
        .order_by(desc("total_count"))
        .limit(10)
        .all()
    )

    # Group by terrain_type
    terrain_counts = (
        db.query(Case.terrain_type, func.count(Case.id).label("total_count"))
        .group_by(Case.terrain_type)
        .order_by(desc("total_count"))
        .all()
    )

    # Total counts
    total_lost = db.query(func.count(Case.id)).filter(Case.case_type == "LOST").scalar() or 0
    total_found = db.query(func.count(Case.id)).filter(Case.case_type == "FOUND").scalar() or 0
    total_recovered = db.query(func.count(Case.id)).filter(Case.status == "RECOVERED").scalar() or 0
    active_matches = db.query(func.count(PotentialMatch.id)).scalar() or 0

    return {
        "summary": {
            "total_lost": total_lost,
            "total_found": total_found,
            "total_recovered": total_recovered,
            "active_potential_matches": active_matches
        },
        "top_locations": [{"location": loc, "cases": count} for loc, count in location_counts],
        "terrain_breakdown": [{"terrain": t, "cases": count} for t, count in terrain_counts]
    }
