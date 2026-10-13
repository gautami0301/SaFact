"""
Detections API Router
Returns real-time person count, coordinates, confidences, and detection telemetry.
"""

from fastapi import APIRouter
import time
from services.camera_service import camera_service

router = APIRouter(prefix="/api/detections", tags=["Detections"])

@router.get("/live")
def get_live_detections():
    stats = camera_service.get_latest_stats()
    detections = stats["detections"]
    
    avg_conf = 0.0
    if detections:
        avg_conf = round(sum(d["confidence"] for d in detections) / len(detections), 3)

    return {
        "timestamp": time.time(),
        "has_processed_frame": stats["has_processed_frame"],
        "camera_connected": stats["camera_connected"],
        "person_count": stats["person_count"],
        "confidence_avg": avg_conf,
        "inference_time_ms": stats["inference_time_ms"],
        "fps": stats["fps"],
        "detections": detections
    }

@router.get("/dashboard")
def get_dashboard_summary():
    """Aggregated single-call endpoint for fast frontend dashboard initialization."""
    stats = camera_service.get_latest_stats()
    from database.repository import IncidentRepository
    
    active_incidents = IncidentRepository.get_all(status="ACTIVE")
    risk_history = IncidentRepository.get_risk_history(limit=20)
    
    return {
        "timestamp": time.time(),
        "has_processed_frame": stats["has_processed_frame"],
        "camera_connected": stats["camera_connected"],
        "camera_source": stats["camera_source"],
        "person_count": stats["person_count"],
        "fps": stats["fps"],
        "inference_time_ms": stats["inference_time_ms"],
        "risk": stats["risk"],
        "zones": stats["zones"],
        "recommendations": stats["recommendations"],
        "active_alerts_count": len(active_incidents),
        "recent_incidents": active_incidents[:5],
        "risk_history": risk_history
    }

