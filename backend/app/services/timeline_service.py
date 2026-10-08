from sqlalchemy.orm import Session
from app.models.timeline import TimelineEvent
from app.schemas.timeline import TimelineEventCreate

def log_timeline_event(
    db: Session,
    case_id: int,
    action: str,
    headline: str,
    details: str = None,
    actor: str = "SYSTEM"
) -> TimelineEvent:
    """Records an immutable audit event in the case's chronological timeline."""
    event = TimelineEvent(
        case_id=case_id,
        action=action,
        headline=headline,
        details=details,
        actor=actor
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
