import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["File Uploads"])

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Safely stores an uploaded item photograph with extension and size checks.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Read contents and verify file size limit
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Generate collision-free filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = settings.UPLOAD_DIR / unique_filename

    with open(target_path, "wb") as f:
        f.write(contents)

    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "size_bytes": len(contents)
    }
