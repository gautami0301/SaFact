"""
Alerts & Incident History API Router
Supports incident dispatch queries, severity filtering, acknowledgement, and resolution.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from database.repository import IncidentRepository

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

class ManualAlertRequest(BaseModel):
    severity: str
    title: str
    description: str
    zone_id: Optional[str] = "ZONE_A"

@router.get("")
@router.get("/")
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MODERATE, HIGH, CRITICAL"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, RESOLVED")
):
    return IncidentRepository.get_all(severity=severity, status=status)

@router.post("")
@router.post("/")
def create_manual_alert(req: ManualAlertRequest):
    new_inc = IncidentRepository.create_incident(
        severity=req.severity,
        title=req.title,
        description=req.description,
        zone_id=req.zone_id,
        person_count=0,
        risk_score=50.0
    )
    return new_inc

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    success = IncidentRepository.acknowledge_incident(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert ID not found")
    return {"status": "acknowledged", "id": alert_id}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    success = IncidentRepository.resolve_incident(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert ID not found")
    return {"status": "resolved", "id": alert_id}
