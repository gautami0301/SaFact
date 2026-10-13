"""
Recommendations API Router
Returns contextual crowd diversion directives and safety guidance.
"""

from fastapi import APIRouter
from services.camera_service import camera_service

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("")
@router.get("/")
def get_recommendations():
    stats = camera_service.get_latest_stats()
    return {
        "risk_level": stats["risk"]["risk_level"],
        "recommendations": stats["recommendations"]
    }
