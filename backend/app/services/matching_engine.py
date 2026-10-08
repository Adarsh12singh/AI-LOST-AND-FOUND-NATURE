import math
from datetime import datetime
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.case import Case
from app.models.match import PotentialMatch
from app.services.timeline_service import log_timeline_event

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in meters."""
    R = 6371000.0 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def tokenize_text(text: Optional[str]) -> set[str]:
    """Tokenize text into lowercase alphanumeric words, filtering out short stopwords."""
    if not text:
        return set()
    stopwords = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "near", "my", "of", "is", "was", "it"}
    words = "".join([c if c.isalnum() else " " for c in text.lower()]).split()
    return {w for w in words if len(w) > 2 and w not in stopwords}

def calculate_match(lost: Case, found: Case) -> Tuple[float, str, Dict[str, Any], List[str]]:
    """
    Evaluates multi-signal compatibility between a Lost Case and a Found Case.
    Returns:
        overall_score (0.0 - 100.0)
        confidence ("VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH")
        score_breakdown (dict of sub-scores)
        evidence_explanation (list of human-readable evidence reasons)
    """
    explanations: List[str] = []
    sub_scores: Dict[str, float] = {}

    # 1. Category Compatibility (Weight: 25%)
    category_score = 0.0
    if lost.category.strip().lower() == found.category.strip().lower():
        category_score = 25.0
        explanations.append(f"Category Match: Both items classified as '{lost.category}'.")
    else:
        # Check if broad overlap exists
        lost_tokens = tokenize_text(lost.category)
        found_tokens = tokenize_text(found.category)
        overlap = lost_tokens.intersection(found_tokens)
        if overlap:
            category_score = 15.0
            explanations.append(f"Category Related: Overlap on '{', '.join(overlap)}'.")
        else:
            category_score = 0.0
            # If categories are completely disjoint, drastically penalize
            return (0.0, "VERY_LOW", {"category": 0.0}, ["Mismatched Category: Incompatible item types."])

    sub_scores["category"] = category_score

    # 2. Key Attributes Match (Brand, Model, Colors, Material) (Weight: 25%)
    attr_score = 0.0
    
    # Brand
    if lost.brand and found.brand:
        if lost.brand.strip().lower() == found.brand.strip().lower():
            attr_score += 8.0
            explanations.append(f"Brand Match: '{lost.brand}' identified on both reports.")
        elif lost.brand.lower() in found.brand.lower() or found.brand.lower() in lost.brand.lower():
            attr_score += 5.0
            explanations.append(f"Brand Related: '{lost.brand}' closely resembles '{found.brand}'.")

    # Primary & Secondary Colors
    if lost.primary_color and found.primary_color:
        if lost.primary_color.strip().lower() == found.primary_color.strip().lower():
            attr_score += 7.0
            explanations.append(f"Primary Color Match: '{lost.primary_color}'.")
        else:
            # Color cross check
            if lost.secondary_color and lost.secondary_color.strip().lower() == found.primary_color.strip().lower():
                attr_score += 4.0
                explanations.append(f"Color Overlap: Secondary '{lost.secondary_color}' matches found color.")
            elif found.secondary_color and lost.primary_color.strip().lower() == found.secondary_color.strip().lower():
                attr_score += 4.0
                explanations.append(f"Color Overlap: Primary '{lost.primary_color}' matches found secondary.")

    # Model Name
    if lost.model_name and found.model_name:
        if lost.model_name.strip().lower() == found.model_name.strip().lower():
            attr_score += 6.0
            explanations.append(f"Model Match: '{lost.model_name}'.")

    # Material
    if lost.material and found.material:
        if lost.material.strip().lower() == found.material.strip().lower():
            attr_score += 4.0
            explanations.append(f"Material Match: '{lost.material}'.")

    attr_score = min(25.0, attr_score)
    sub_scores["attributes"] = round(attr_score, 1)

    # 3. Textual & Description Similarity (Weight: 20%)
    lost_desc_tokens = tokenize_text(f"{lost.title} {lost.description} {lost.permanent_features or ''} {lost.changeable_features or ''}")
    found_desc_tokens = tokenize_text(f"{found.title} {found.description} {found.permanent_features or ''} {found.changeable_features or ''}")
    
    intersection = lost_desc_tokens.intersection(found_desc_tokens)
    union = lost_desc_tokens.union(found_desc_tokens)
    jaccard = (len(intersection) / len(union)) if union else 0.0
    text_score = min(20.0, jaccard * 40.0) # scaled
    sub_scores["text_similarity"] = round(text_score, 1)
    
    if len(intersection) >= 3:
        sample_terms = list(intersection)[:4]
        explanations.append(f"Description Semantics: Shared key descriptor terms: {', '.join(sample_terms)}.")

    # Permanent vs Changeable features evaluation
    if lost.permanent_features and found.permanent_features:
        perm_lost = tokenize_text(lost.permanent_features)
        perm_found = tokenize_text(found.permanent_features)
        perm_overlap = perm_lost.intersection(perm_found)
        if perm_overlap:
            explanations.append(f"Permanent Damage/Mark Match: Shared distinctive wear features: {', '.join(perm_overlap)}.")
            attr_score = min(25.0, attr_score + 5.0)
            sub_scores["attributes"] = round(attr_score, 1)

    # 4. Location & Nature Environment Compatibility (Weight: 15%)
    loc_score = 5.0 # Base for neutral outdoor geography
    
    # Check GPS coordinates if both have them
    if (lost.latitude is not None and lost.longitude is not None and 
        found.latitude is not None and found.longitude is not None):
        dist_m = haversine_distance_meters(lost.latitude, lost.longitude, found.latitude, found.longitude)
        max_search_radius = (lost.radius_meters or 300.0) + (found.radius_meters or 300.0)
        
        if dist_m <= max_search_radius:
            loc_score = 15.0
            explanations.append(f"Geographic Proximity: Coordinates are {int(dist_m)} meters apart (within environmental search radius).")
        elif dist_m <= max_search_radius * 2.5:
            loc_score = 10.0
            explanations.append(f"Geographic Compatibility: Coordinates are {int(dist_m)} meters apart, plausible environmental displacement.")
        else:
            loc_score = 2.0
            explanations.append(f"Geographic Distance: Items are {round(dist_m / 1000.0, 1)} km apart.")
    else:
        # Landmark / Terrain / Route matching
        lost_loc_tokens = tokenize_text(f"{lost.location_name} {lost.terrain_type} {lost.route_path_notes or ''}")
        found_loc_tokens = tokenize_text(f"{found.location_name} {found.terrain_type} {found.route_path_notes or ''}")
        loc_overlap = lost_loc_tokens.intersection(found_loc_tokens)
        
        if lost.terrain_type and found.terrain_type and lost.terrain_type.lower() == found.terrain_type.lower():
            loc_score += 4.0
            explanations.append(f"Terrain Consistency: Both reported in '{lost.terrain_type}'.")
        
        if loc_overlap:
            loc_score = min(15.0, loc_score + len(loc_overlap) * 3.0)
            explanations.append(f"Landmark / Route Alignment: Matching location references: {', '.join(loc_overlap)}.")

    loc_score = min(15.0, loc_score)
    sub_scores["location_compatibility"] = round(loc_score, 1)

    # 5. Time Compatibility (Weight: 15%)
    time_score = 8.0 # Base default
    try:
        lost_d = datetime.strptime(lost.event_date.strip()[:10], "%Y-%m-%d")
        found_d = datetime.strptime(found.event_date.strip()[:10], "%Y-%m-%d")
        delta_days = (found_d - lost_d).days
        
        if delta_days >= 0:
            if delta_days == 0:
                time_score = 15.0
                explanations.append("Temporal Compatibility: Reported lost and found on the exact same date.")
            elif delta_days <= 3:
                time_score = 13.0
                explanations.append(f"Temporal Alignment: Found within {delta_days} day(s) after being lost.")
            elif delta_days <= 14:
                time_score = 10.0
                explanations.append(f"Temporal Consistency: Found {delta_days} days after being lost.")
            else:
                time_score = 5.0
                explanations.append(f"Historical Case: Found {delta_days} days after lost date (persistent tracking).")
        else:
            # Found before reported lost - could be slight reporting date confusion
            if abs(delta_days) <= 1:
                time_score = 7.0
                explanations.append("Date Discrepancy: Found date recorded 1 day prior to reported lost date (within user timezone/reporting margin).")
            else:
                time_score = 1.0
                explanations.append(f"Date Inconsistency: Found date is {abs(delta_days)} days before reported lost date.")
    except Exception:
        time_score = 6.0

    sub_scores["time_compatibility"] = round(time_score, 1)

    # Total Score
    total_score = round(sum(sub_scores.values()), 1)

    # Determine Confidence Bracket
    if total_score >= 75.0:
        confidence = "VERY_HIGH"
    elif total_score >= 58.0:
        confidence = "HIGH"
    elif total_score >= 40.0:
        confidence = "MEDIUM"
    elif total_score >= 25.0:
        confidence = "LOW"
    else:
        confidence = "VERY_LOW"

    return total_score, confidence, sub_scores, explanations

def run_persistent_rematching_for_case(db: Session, target_case: Case) -> List[PotentialMatch]:
    """
    Evaluates target_case against all complementary active historical cases.
    If target is LOST, evaluates against active FOUND cases.
    If target is FOUND, evaluates against active LOST cases.
    Ensures 'Persistent Re-Matching' requirement (Section 6, Feature 7).
    """
    matches_found: List[PotentialMatch] = []
    
    if target_case.case_type == "LOST":
        counterparts = db.query(Case).filter(
            Case.case_type == "FOUND",
            Case.status.in_(["REPORTED", "STORED_WAITING_CLAIM", "POTENTIAL_MATCH", "SEARCHING"])
        ).all()
        lost_case = target_case
    else:
        counterparts = db.query(Case).filter(
            Case.case_type == "LOST",
            Case.status.in_(["REPORTED", "SEARCHING", "POTENTIAL_MATCH"])
        ).all()
        found_case = target_case

    for counterpart in counterparts:
        c_lost = lost_case if target_case.case_type == "LOST" else counterpart
        c_found = counterpart if target_case.case_type == "LOST" else found_case

        score, confidence, breakdown, explanations = calculate_match(c_lost, c_found)

        # We only record matches that meet minimum viable threshold (e.g. >= 28.0)
        # to respect Section 27: "No match is better than a dangerous false match."
        if score >= 28.0:
            # Check if match record already exists
            existing_match = db.query(PotentialMatch).filter(
                PotentialMatch.lost_case_id == c_lost.id,
                PotentialMatch.found_case_id == c_found.id
            ).first()

            if existing_match:
                existing_match.overall_score = score
                existing_match.confidence = confidence
                existing_match.score_breakdown = breakdown
                existing_match.evidence_explanation = explanations
                db.commit()
                db.refresh(existing_match)
                matches_found.append(existing_match)
            else:
                new_match = PotentialMatch(
                    lost_case_id=c_lost.id,
                    found_case_id=c_found.id,
                    overall_score=score,
                    confidence=confidence,
                    score_breakdown=breakdown,
                    evidence_explanation=explanations,
                    status="SUGGESTED"
                )
                db.add(new_match)
                db.commit()
                db.refresh(new_match)
                matches_found.append(new_match)

                # Update cases status if in initial REPORTED/SEARCHING
                if c_lost.status in ["REPORTED", "SEARCHING"]:
                    c_lost.status = "POTENTIAL_MATCH"
                if c_found.status in ["REPORTED", "STORED_WAITING_CLAIM"]:
                    c_found.status = "POTENTIAL_MATCH"
                db.commit()

                # Log to timeline for both cases
                log_timeline_event(
                    db=db,
                    case_id=c_lost.id,
                    action="POTENTIAL_MATCH_DETECTED",
                    headline=f"Potential Match Detected ({confidence} Confidence: {score}%)",
                    details=f"Evaluated against Found Case #{c_found.case_number}. Key signals: {'; '.join(explanations[:2])}",
                    actor="SYSTEM"
                )
                log_timeline_event(
                    db=db,
                    case_id=c_found.id,
                    action="POTENTIAL_MATCH_DETECTED",
                    headline=f"Potential Match Detected ({confidence} Confidence: {score}%)",
                    details=f"Evaluated against Lost Case #{c_lost.case_number}. Key signals: {'; '.join(explanations[:2])}",
                    actor="SYSTEM"
                )

    return matches_found
