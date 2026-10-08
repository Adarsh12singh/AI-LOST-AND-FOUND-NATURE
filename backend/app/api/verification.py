from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.verification import OwnershipClaim
from app.models.case import Case
from app.schemas.verification import OwnershipClaimCreate, OwnershipClaimRead, OwnershipClaimReview
from app.services.timeline_service import log_timeline_event
from app.services.case_service import get_case_by_id

router = APIRouter(prefix="/verification", tags=["Ownership Verification"])

@router.post("/claims", response_model=OwnershipClaimRead, status_code=201)
def submit_claim(claim_in: OwnershipClaimCreate, db: Session = Depends(get_db)):
    """
    Submits a private claim of ownership for a found item.
    Collects hidden marks, unique proof, receipts, or secret contents.
    Transitions found case status to VERIFICATION_IN_PROGRESS.
    """
    found_case = get_case_by_id(db, claim_in.found_case_id)
    if not found_case:
        raise HTTPException(status_code=404, detail="Found case does not exist.")

    claim = OwnershipClaim(
        found_case_id=claim_in.found_case_id,
        lost_case_id=claim_in.lost_case_id,
        claimant_name=claim_in.claimant_name,
        claimant_contact=claim_in.claimant_contact,
        claimant_evidence=claim_in.claimant_evidence,
        claimant_attachments=claim_in.claimant_attachments,
        status="PENDING_REVIEW"
    )
    db.add(claim)
    found_case.status = "VERIFICATION_IN_PROGRESS"
    db.commit()
    db.refresh(claim)

    log_timeline_event(
        db=db,
        case_id=found_case.id,
        action="VERIFICATION_SUBMITTED",
        headline=f"Ownership claim submitted by {claim.claimant_name}",
        details=f"Private verification proof provided. Status changed to VERIFICATION_IN_PROGRESS.",
        actor="OWNER"
    )

    if claim_in.lost_case_id:
        lost_case = get_case_by_id(db, claim_in.lost_case_id)
        if lost_case:
            lost_case.status = "VERIFICATION_IN_PROGRESS"
            db.commit()
            log_timeline_event(
                db=db,
                case_id=lost_case.id,
                action="VERIFICATION_SUBMITTED",
                headline=f"Ownership claim filed for Found Case #{found_case.case_number}",
                details="Awaiting verification review by authorized personnel.",
                actor="OWNER"
            )

    return claim

@router.get("/claims/case/{case_id}", response_model=List[OwnershipClaimRead])
def get_claims_for_case(case_id: int, db: Session = Depends(get_db)):
    """Retrieves all submitted ownership claims for an item."""
    return db.query(OwnershipClaim).filter(OwnershipClaim.found_case_id == case_id).all()

@router.patch("/claims/{claim_id}", response_model=OwnershipClaimRead)
def review_claim(
    claim_id: int,
    review: OwnershipClaimReview,
    db: Session = Depends(get_db)
):
    """
    Authorized authority or station manager reviews claimant evidence against hidden characteristics.
    """
    claim = db.query(OwnershipClaim).filter(OwnershipClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    claim.status = review.status
    claim.authority_notes = review.authority_notes
    db.commit()
    db.refresh(claim)

    found_case = get_case_by_id(db, claim.found_case_id)
    if review.status == "APPROVED":
        found_case.status = "MATCH_CONFIRMED"
        if claim.lost_case_id:
            lost_case = get_case_by_id(db, claim.lost_case_id)
            if lost_case:
                lost_case.status = "MATCH_CONFIRMED"
                log_timeline_event(
                    db=db,
                    case_id=lost_case.id,
                    action="VERIFICATION_APPROVED",
                    headline="Ownership Verified by Authority",
                    details=f"Claim approved. Next step: Arrange safe handover.",
                    actor="AUTHORITY"
                )
        log_timeline_event(
            db=db,
            case_id=found_case.id,
            action="VERIFICATION_APPROVED",
            headline="Ownership Verified by Authority",
            details=f"Claim by {claim.claimant_name} verified against private evidence records.",
            actor="AUTHORITY"
        )
    elif review.status == "REJECTED":
        log_timeline_event(
            db=db,
            case_id=found_case.id,
            action="VERIFICATION_REJECTED",
            headline="Claim Rejected by Authority",
            details=review.authority_notes or "Evidence provided was insufficient or inconsistent.",
            actor="AUTHORITY"
        )

    db.commit()
    return claim
