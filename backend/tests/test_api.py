import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# Test database in memory / isolated test db
TEST_DATABASE_URL = "sqlite:///./test_cases.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "AI LOST AND FOUND NATURE"
    assert data["status"] == "operational"

def test_create_lost_and_found_case_matching():
    # 1. Create Lost Case
    lost_payload = {
        "case_type": "LOST",
        "title": "Red Patagonia Sling Bag",
        "category": "Bags & Backpacks",
        "description": "Dropped near the riverside pine tree while fishing. Has black zipper and compass.",
        "urgency": "NORMAL",
        "brand": "Patagonia",
        "primary_color": "Red",
        "secondary_color": "Black",
        "location_name": "Pine River Bend, Sector 4",
        "terrain_type": "Waterfall / River",
        "event_date": "2026-10-06",
        "private_secret_marks": "Silver fish pin hidden inside the interior lining pocket"
    }
    res_lost = client.post("/api/v1/cases/", json=lost_payload)
    assert res_lost.status_code == 201
    lost_data = res_lost.json()
    assert lost_data["case_number"].startswith("LST-")
    assert lost_data["status"] == "SEARCHING"
    assert "private_secret_marks" not in lost_data # Verify privacy protection!

    # 2. Create Found Case matching it
    found_payload = {
        "case_type": "FOUND",
        "title": "Red Outdoor Sling Bag by River",
        "category": "Bags & Backpacks",
        "description": "Found near river bend rocks. Red fabric with black zipper.",
        "urgency": "NORMAL",
        "brand": "Patagonia",
        "primary_color": "Red",
        "location_name": "Pine River Bend Lower Rocks",
        "terrain_type": "Waterfall / River",
        "event_date": "2026-10-06",
        "current_storage_place": "Pine River Ranger Station"
    }
    res_found = client.post("/api/v1/cases/", json=found_payload)
    assert res_found.status_code == 201
    found_data = res_found.json()
    assert found_data["case_number"].startswith("FND-")

    # 3. Verify Persistent Re-Matching detected a high confidence match
    matches_res = client.get(f"/api/v1/matches/case/{lost_data['id']}")
    assert matches_res.status_code == 200
    matches = matches_res.json()
    assert len(matches) >= 1
    match = matches[0]
    assert match["overall_score"] > 60.0
    assert any("Patagonia" in exp for exp in match["evidence_explanation"])

    # 4. Verify Case Timeline contains audit events
    case_detail_res = client.get(f"/api/v1/cases/{lost_data['id']}")
    assert case_detail_res.status_code == 200
    detail = case_detail_res.json()
    assert len(detail["timeline_events"]) >= 3
    assert detail["has_secret_marks"] is True # Private flag without leaking content

def test_smart_questions():
    payload = {
        "raw_description": "I lost my black backpack with my keys inside near the river",
        "case_type": "LOST"
    }
    response = client.post("/api/v1/questions/suggest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["detected_category"] == "Bags & Backpacks"
    assert len(data["suggested_questions"]) >= 2

def test_ownership_verification_claim():
    # Setup found case
    found_payload = {
        "case_type": "FOUND",
        "title": "Silver Seiko Dive Watch",
        "category": "Watches",
        "description": "Found on the granite boulder along trail",
        "location_name": "Granite Ridge Trail",
        "event_date": "2026-10-05"
    }
    found_res = client.post("/api/v1/cases/", json=found_payload)
    found_id = found_res.json()["id"]

    # Submit claim
    claim_payload = {
        "found_case_id": found_id,
        "claimant_name": "Sarah Connor",
        "claimant_contact": "sarah@example.com",
        "claimant_evidence": "The case back has an engraved date: 'JUNE 2021 - EVER ONWARD'."
    }
    claim_res = client.post("/api/v1/verification/claims", json=claim_payload)
    assert claim_res.status_code == 201
    claim_id = claim_res.json()["id"]

    # Authority approves claim
    review_res = client.patch(f"/api/v1/verification/claims/{claim_id}", json={
        "status": "APPROVED",
        "authority_notes": "Engraving matches physical item verification on site."
    })
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"

    # Verify found case status updated to MATCH_CONFIRMED
    updated_found = client.get(f"/api/v1/cases/{found_id}").json()
    assert updated_found["status"] == "MATCH_CONFIRMED"
