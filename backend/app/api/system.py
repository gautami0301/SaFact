"""
System & Health API Router
Provides system telemetry, hardware metrics, and uptime monitoring.
"""

from fastapi import APIRouter
import time
import psutil
from app.config import settings
from services.camera_service import camera_service

router = APIRouter(prefix="/api/system", tags=["System"])
SYSTEM_START_TIME = time.time()

@router.get("/status")
def get_system_status():
    uptime = time.time() - SYSTEM_START_TIME
    cpu_usage = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory()

    return {
        "system_online": True,
        "service_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": round(uptime, 1),
        "camera_connected": camera_service.camera_connected,
        "camera_source": camera_service.camera_source,
        "model_loaded": camera_service.detector.model_loaded,
        "model_name": camera_service.detector.model_name,
        "fps": camera_service.fps,
        "inference_time_ms": camera_service.inference_time_ms,
        "cpu_usage_pct": cpu_usage,
        "ram_usage_pct": memory.percent,
        "ram_available_mb": round(memory.available / (1024 * 1024), 1),
        "error_message": camera_service.error_message
    }

@router.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": time.time(),
        "camera_online": camera_service.camera_connected
    }
