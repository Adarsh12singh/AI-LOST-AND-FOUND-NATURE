from app.database import Base, engine, SessionLocal
from app.models.case import Case
from app.schemas.case import CaseCreate
from app.services.case_service import create_case

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    existing_count = db.query(Case).count()
    if existing_count > 0:
        print(f"Database already contains {existing_count} cases. Skipping seed.")
        db.close()
        return

    print("Seeding sample natural environment lost & found cases...")

    # Case 1: Lost Backpack
    c1 = CaseCreate(
        case_type="LOST",
        title="Navy Blue Osprey Talon 22 Hiking Backpack",
        category="Bags & Backpacks",
        description="Lost during a Saturday hike. It has an aluminum thermos in the left mesh pocket and a green climbing carabiner on the top haul loop.",
        urgency="HIGH",
        brand="Osprey",
        model_name="Talon 22",
        primary_color="Navy",
        secondary_color="Black",
        material="Ripstop Nylon",
        permanent_features="Noticeable 2-inch tear repaired with grey tenacious tape near the bottom base",
        changeable_features="Green Black Diamond carabiner on top loop, small yellow reflective ribbon",
        location_name="Cascade Falls Scenic Overlook, Blue Mountain Trail",
        latitude=35.5951,
        longitude=-82.5515,
        radius_meters=350.0,
        terrain_type="Trail / Route",
        route_path_notes="Between the second waterfall scenic overlook and the wooden river footbridge",
        movement_notes="Could have slid down the embankment towards the creek or picked up by another hiker",
        event_date="2026-10-04",
        event_time_approx="Around 14:30",
        handover_preference="AUTHORIZED_STATION",
        contact_preference="PLATFORM_MEDIATED",
        contact_name="Alex Turner",
        contact_email="alex.turner@example.com",
        contact_phone="+1-555-0192",
        private_secret_marks="Initial 'AT' handwritten in black marker inside the hydration reservoir sleeve",
        private_known_contents="Rite in the Rain field notebook and small compass in front zippered pocket"
    )

    # Case 2: Found Backpack (Counterpart with natural displacement)
    c2 = CaseCreate(
        case_type="FOUND",
        title="Dark Navy Osprey Pack found near footbridge",
        category="Bags & Backpacks",
        description="Discovered rested against a boulder near the lower river crossing. Appears slightly damp but in good shape with taped patch on the bottom.",
        urgency="NORMAL",
        brand="Osprey",
        model_name="Talon",
        primary_color="Navy",
        secondary_color="Black",
        material="Nylon",
        permanent_features="Tape repair patch on bottom fabric",
        changeable_features="Green carabiner attached to loop",
        location_name="Cascade Falls Footbridge, Blue Mountain Trail",
        latitude=35.5960,
        longitude=-82.5502,
        radius_meters=150.0,
        terrain_type="Waterfall / River",
        route_path_notes="Lower river crossing footbridge, downstream from scenic overlook",
        current_storage_place="Blue Mountain Ranger Station - Secure Locker #10",
        handover_preference="AUTHORIZED_STATION",
        contact_preference="PLATFORM_MEDIATED",
        contact_name="Ranger David Miller",
        contact_email="ranger.miller@bluemountain.org",
        event_date="2026-10-04",
        event_time_approx="16:15",
    )

    # Case 3: Lost Phone
    c3 = CaseCreate(
        case_type="LOST",
        title="Black iPhone 15 Pro with Matte Carbon Case",
        category="Mobile phones",
        description="Fell out of jacket pocket while setting up camp before sunset. Phone screen has a matte screen protector.",
        urgency="URGENT",
        brand="Apple",
        model_name="iPhone 15 Pro",
        primary_color="Black",
        secondary_color="Titanium",
        permanent_features="Minor pin-sized nick on the upper-right titanium camera bezel",
        changeable_features="Matte black carbon fiber magnetic case with orange accent ring",
        location_name="Pine Ridge Campsite #6, North Ridge Forest",
        latitude=35.6120,
        longitude=-82.5710,
        radius_meters=100.0,
        terrain_type="Campsite",
        route_path_notes="Near tent pad #6 and the central campfire stone ring",
        event_date="2026-10-05",
        event_time_approx="18:45",
        handover_preference="VERIFIED_PICKUP",
        contact_preference="PLATFORM_MEDIATED",
        contact_name="Elena Rostova",
        contact_email="elena.r@example.com",
        private_serial_or_imei="354892019382109",
        private_secret_marks="Lock screen displays photo of a golden retriever on snowy mountain summit",
        private_known_contents="Driver license and transit card tucked inside phone case"
    )

    # Case 4: Found Phone
    c4 = CaseCreate(
        case_type="FOUND",
        title="Black Smartphone in dark case found by camp washroom",
        category="Mobile phones",
        description="Turned in to camp manager by another camper who saw it near the trail lighting post.",
        urgency="HIGH",
        brand="Apple",
        model_name="iPhone",
        primary_color="Black",
        changeable_features="Black case with circular ring on back",
        location_name="Pine Ridge Campground Commons",
        latitude=35.6115,
        longitude=-82.5705,
        radius_meters=80.0,
        terrain_type="Campsite",
        current_storage_place="Pine Ridge Welcome Center Office Safe",
        handover_preference="AUTHORIZED_STATION",
        contact_preference="PLATFORM_MEDIATED",
        contact_name="Pine Ridge Office Staff",
        event_date="2026-10-05",
        event_time_approx="20:00"
    )

    # Case 5: Lost Set of Brass Keys
    c5 = CaseCreate(
        case_type="LOST",
        title="Brass House Keys with Subaru Remote & Trail Pass Tag",
        category="Keys",
        description="Ring with 4 brass keys, black Subaru car remote, and blue plastic state park trail pass tag #441.",
        urgency="NORMAL",
        primary_color="Brass / Gold",
        secondary_color="Black",
        changeable_features="Small blue trail pass barcode fob #441",
        location_name="Eagle Peak Summit Trail, Switchback 7",
        latitude=35.6401,
        longitude=-82.5920,
        radius_meters=500.0,
        terrain_type="Mountain / Peak",
        route_path_notes="Between Switchback 7 and the rock scramble section before summit",
        event_date="2026-10-03",
        event_time_approx="11:15",
        handover_preference="PUBLIC_MEETING_POINT",
        contact_preference="PLATFORM_MEDIATED",
        contact_name="Marcus Vance",
        contact_email="marcus.v@example.com",
        private_secret_marks="Back of the Subaru fob has a tiny red dot sticker"
    )

    create_case(db, c1)
    create_case(db, c2)
    create_case(db, c3)
    create_case(db, c4)
    create_case(db, c5)

    print("Successfully seeded 5 cases with automatic persistent re-matching and audit timelines!")
    db.close()

if __name__ == "__main__":
    seed_database()
