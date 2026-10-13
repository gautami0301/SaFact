"""
Risk Assessment API Router
Provides real-time crowd risk evaluation, component scores, and historical time-series.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.camera_service import camera_service
from services.risk_engine import risk_engine
from database.repository import IncidentRepository

router = APIRouter(prefix="/api/risk", tags=["Risk"])

class SimulationRequest(BaseModel):
    simulated_count: int
    zone_id: Optional[str] = "ZONE_A"

@router.get("/current")
def get_current_risk():
    stats = camera_service.get_latest_stats()
    return stats["risk"]

@router.get("/history")
def get_risk_history(limit: int = 40):
    return IncidentRepository.get_risk_history(limit=limit)

@router.post("/simulate")
def simulate_risk(req: SimulationRequest):
    """Allows verification of risk transitions using controlled inputs (for testing)."""
    stats = camera_service.get_latest_stats()
    zones = list(stats["zones"])
    # Modify target zone for simulation test
    for z in zones:
        if z["id"] == req.zone_id:
            z["people_count"] = req.simulated_count
            z["occupancy_pct"] = round((req.simulated_count / max(z["capacity"], 1)) * 100.0, 1)

    eval_result = risk_engine.evaluate(req.simulated_count, zones)
    return {
        "simulation_mode": True,
        "input_count": req.simulated_count,
        "target_zone": req.zone_id,
        "assessment": eval_result
    }
