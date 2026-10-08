from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.case import CaseCreate, CaseRead, CaseReadDetail, CaseUpdate
from app.services import case_service

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("/", response_model=CaseRead, status_code=201)
def create_new_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    """Creates a new Lost or Found case, triggers profiling and persistent re-matching."""
    return case_service.create_case(db=db, case_in=case_in)

@router.get("/", response_model=List[CaseRead])
def list_cases(
    case_type: Optional[str] = Query(None, description="LOST or FOUND"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    terrain_type: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Search keyword in title, location, brand"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve active cases filtered by type, category, terrain, status, or search keywords."""
    return case_service.get_cases(
        db=db,
        case_type=case_type,
        category=category,
        status=status,
        terrain_type=terrain_type,
        query_str=q,
        skip=skip,
        limit=limit
    )

@router.get("/analytics/hotspots")
def get_hotspots(db: Session = Depends(get_db)):
    """Returns geospatial and environmental hotspot counts for authorities and park rangers."""
    return case_service.get_hotspot_analytics(db=db)

@router.get("/{case_id}", response_model=CaseReadDetail)
def get_case(case_id: int, db: Session = Depends(get_db)):
    """Fetch case profile and timeline by ID."""
    case = case_service.get_case_by_id(db=db, case_id=case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    # Indicate existence of private verification proof without revealing raw secrets
    detail = CaseReadDetail.model_validate(case)
    detail.has_serial_number = bool(case.private_serial_or_imei)
    detail.has_secret_marks = bool(case.private_secret_marks)
    detail.has_known_contents = bool(case.private_known_contents)
    detail.claims_count = len(case.claims)
    return detail

@router.patch("/{case_id}/status", response_model=CaseRead)
def update_status(
    case_id: int,
    status: str = Query(..., description="Target status"),
    notes: Optional[str] = Query(None, description="Reason for status change"),
    actor: str = Query("SYSTEM", description="Actor who authorized status transition"),
    db: Session = Depends(get_db)
):
    """Updates case status (e.g. RECOVERED, CLOSED, VERIFICATION_IN_PROGRESS)."""
    updated = case_service.update_case_status(
        db=db,
        case_id=case_id,
        new_status=status,
        notes=notes,
        actor=actor
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found.")
    return updated
