"""
SaFact Data Schemas
Pydantic definitions for API request and response serialization.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    width: float
    height: float
    confidence: float
    class_id: int
    class_name: str
    centroid_x: float
    centroid_y: float
    zone_id: Optional[str] = None

class DetectionResponse(BaseModel):
    timestamp: float
    person_count: int
    confidence_avg: float
    inference_time_ms: float
    detections: List[BoundingBox]

class ZoneStatus(BaseModel):
    id: str
    name: str
    code: str
    people_count: int
    capacity: int
    occupancy_pct: float
    area_sqm: float
    density_ppm2: float
    risk_level: str
    risk_score: float
    trend: str
    recommended_action: str
    color: str

class RiskBreakdown(BaseModel):
    density_score: float
    occupancy_score: float
    accumulation_rate_score: float
    constriction_factor: float

class RiskAssessment(BaseModel):
    risk_score: float
    risk_level: str
    level_color: str
    reason: str
    limitations: str
    breakdown: RiskBreakdown
    people_count: int
    avg_density_ppm2: float
    occupancy_pct: float

class RecommendationItem(BaseModel):
    id: str
    priority: str
    action_title: str
    directive: str
    rationale: str
    target_zone: Optional[str] = None
    relief_zone: Optional[str] = None

class SystemStatusResponse(BaseModel):
    system_online: bool
    camera_connected: bool
    camera_source: str
    model_loaded: bool
    model_name: str
    current_fps: float
    inference_fps: float
    uptime_seconds: float
    error_message: Optional[str] = None

class IncidentItem(BaseModel):
    id: str
    timestamp: float
    datetime_str: str
    severity: str
    title: str
    description: str
    zone_id: Optional[str] = None
    status: str
    acknowledged: int
    person_count: int
    risk_score: float

class CameraConfigRequest(BaseModel):
    source: str = "0"

class SettingsUpdateRequest(BaseModel):
    confidence_threshold: Optional[float] = None
    inference_interval: Optional[int] = None
    monitored_area_sqm: Optional[float] = None
    max_capacity: Optional[int] = None
