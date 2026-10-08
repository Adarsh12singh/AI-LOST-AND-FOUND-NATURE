from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/questions", tags=["Smart Questions"])

class SmartQuestionPrompt(BaseModel):
    category: Optional[str] = "Other"
    raw_description: str
    case_type: str = "LOST"

class SmartQuestionResponse(BaseModel):
    detected_category: str
    detected_attributes: dict
    suggested_questions: List[str]

CATEGORY_QUESTIONS = {
    "Mobile phones": [
        "Do you recall if the phone had a protective case (color, brand, wallet flap)?",
        "Were there any visible scratches, screen cracks, or distinctive stickers on the back?",
        "Do you remember the approximate lock screen wallpaper or language setting?"
    ],
    "Bags & Backpacks": [
        "Did the bag have any keychains, patches, pins, or ribbons attached?",
        "Were there noticeable scuffs, tears, or worn zippers on a particular side?",
        "Can you mention 1 or 2 general non-sensitive items stored in the side or front pocket?"
    ],
    "Wallets": [
        "What material and stitching color is the wallet (e.g. brown leather, black canvas, metal clip)?",
        "Did the exterior have any unique creases, initials, or wear marks?",
        "Can you recall the general brand logo or closure type (zipper, button snap, bifold)?"
    ],
    "Keys": [
        "How many keys are on the ring and what does the key fob or keychain look like?",
        "Is there a car remote or gym membership barcode tag attached?",
        "Are any of the keys distinctively colored or shaped?"
    ],
    "Watches": [
        "What type of strap or band is attached (metal link, silicone sports band, leather)?",
        "Is it an analog watch or a digital/smart watch?",
        "Are there any bezel scratches or engraved text on the back case?"
    ],
    "Electronics": [
        "What color and approximate dimensions is the electronic device?",
        "Does it have any protective skin, decals, or identifying serial label?",
        "Did it include any charging cables or accessories in a pouch?"
    ],
    "Cameras": [
        "What lens or lens cap was attached to the camera body?",
        "Was the camera in a specialized strap, neck harness, or bag?",
        "Do you know the approximate brand or focal length written on the lens rim?"
    ]
}

@router.post("/suggest", response_model=SmartQuestionResponse)
def suggest_smart_questions(prompt: SmartQuestionPrompt):
    """
    Analyzes user's initial description and returns targeted follow-up questions
    to extract high-value permanent vs changeable characteristics (AI Feature 4).
    """
    desc_lower = prompt.raw_description.lower()
    cat = prompt.category or "Other"

    # Quick heuristic detection if category is generic
    if cat == "Other":
        if any(w in desc_lower for w in ["phone", "iphone", "samsung", "pixel", "android", "mobile"]):
            cat = "Mobile phones"
        elif any(w in desc_lower for w in ["bag", "backpack", "rucksack", "pouch", "tote"]):
            cat = "Bags & Backpacks"
        elif any(w in desc_lower for w in ["wallet", "purse", "billfold"]):
            cat = "Wallets"
        elif any(w in desc_lower for w in ["key", "keys", "keychain", "fob"]):
            cat = "Keys"
        elif any(w in desc_lower for w in ["watch", "smartwatch", "garmin", "apple watch"]):
            cat = "Watches"
        elif any(w in desc_lower for w in ["camera", "dslr", "gopro", "lens"]):
            cat = "Cameras"

    # Extract any obvious colors from raw text
    colors = ["black", "blue", "navy", "red", "green", "white", "grey", "gray", "brown", "yellow", "orange", "purple", "pink"]
    found_colors = [c for c in colors if c in desc_lower]

    questions = CATEGORY_QUESTIONS.get(cat, [
        "Are there any permanent marks, distinctive scratches, or structural wear on the item?",
        "Were there any removable accessories, stickers, or attached objects?",
        "Can you specify a recognizable landmark or terrain feature near where it was lost/found?"
    ])

    return SmartQuestionResponse(
        detected_category=cat,
        detected_attributes={"mentioned_colors": found_colors},
        suggested_questions=questions
    )
