"""
Zone Analysis API Router
Provides spatial partition metrics, capacity loads, and zone-specific safety directives.
"""

from fastapi import APIRouter, HTTPException
from services.camera_service import camera_service

router = APIRouter(prefix="/api/zones", tags=["Zones"])

@router.get("")
@router.get("/")
def get_zones():
    stats = camera_service.get_latest_stats()
    return stats["zones"]

@router.get("/{zone_id}")
def get_zone_by_id(zone_id: str):
    stats = camera_service.get_latest_stats()
    for z in stats["zones"]:
        if z["id"].upper() == zone_id.upper():
            return z
    raise HTTPException(status_code=404, detail="Zone not found")
