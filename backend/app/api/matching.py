from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models.match import PotentialMatch
from app.models.case import Case
from app.schemas.match import PotentialMatchRead
from app.services.matching_engine import run_persistent_rematching_for_case
from app.services.case_service import get_case_by_id

router = APIRouter(prefix="/matches", tags=["Matching Engine"])

@router.get("/case/{case_id}")
def get_matches_for_case(case_id: int, db: Session = Depends(get_db)):
    """
    Returns ranked potential matches for a given case, including counterpart case
    previews and explainable evidence breakdowns.
    """
    case = get_case_by_id(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    if case.case_type == "LOST":
        matches = db.query(PotentialMatch).filter(
            PotentialMatch.lost_case_id == case.id
        ).order_by(PotentialMatch.overall_score.desc()).all()
    else:
        matches = db.query(PotentialMatch).filter(
            PotentialMatch.found_case_id == case.id
        ).order_by(PotentialMatch.overall_score.desc()).all()

    results = []
    for m in matches:
        counterpart_id = m.found_case_id if case.case_type == "LOST" else m.lost_case_id
        counterpart = db.query(Case).filter(Case.id == counterpart_id).first()
        
        results.append({
            "match_id": m.id,
            "overall_score": m.overall_score,
            "confidence": m.confidence,
            "status": m.status,
            "score_breakdown": m.score_breakdown,
            "evidence_explanation": m.evidence_explanation,
            "created_at": m.created_at,
            "counterpart": {
                "id": counterpart.id if counterpart else None,
                "case_number": counterpart.case_number if counterpart else "N/A",
                "case_type": counterpart.case_type if counterpart else "N/A",
                "title": counterpart.title if counterpart else "N/A",
                "category": counterpart.category if counterpart else "N/A",
                "location_name": counterpart.location_name if counterpart else "N/A",
                "event_date": counterpart.event_date if counterpart else "N/A",
                "images": counterpart.images if counterpart else [],
                "current_storage_place": counterpart.current_storage_place if counterpart else None
            }
        })

    return results

@router.post("/rematch/{case_id}")
def trigger_rematch(case_id: int, db: Session = Depends(get_db)):
    """
    Manually triggers persistent re-matching of this case against all historical
    unresolved complementary cases.
    """
    case = get_case_by_id(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    matches = run_persistent_rematching_for_case(db, case)
    return {
        "message": f"Persistent re-matching executed for case #{case.case_number}.",
        "evaluated_matches_count": len(matches)
    }

@router.patch("/{match_id}/status")
def update_match_status(
    match_id: int,
    status: str = Query(..., description="SUGGESTED, REVIEWING, VERIFIED, or DISMISSED"),
    db: Session = Depends(get_db)
):
    match = db.query(PotentialMatch).filter(PotentialMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")
    
    match.status = status.upper()
    db.commit()
    db.refresh(match)
    return {"message": "Match status updated", "match_id": match.id, "status": match.status}
