from fastapi import APIRouter
from app.api.cases import router as cases_router
from app.api.matching import router as matching_router
from app.api.verification import router as verification_router
from app.api.uploads import router as uploads_router
from app.api.smart_questions import router as questions_router

api_router = APIRouter()
api_router.include_router(cases_router)
api_router.include_router(matching_router)
api_router.include_router(verification_router)
api_router.include_router(uploads_router)
api_router.include_router(questions_router)

__all__ = ["api_router"]
