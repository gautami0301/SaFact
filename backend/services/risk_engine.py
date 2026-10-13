"""
SaFact Crowd Risk Analysis Engine
Synthesizes headcount, spatial density, net accumulation velocity, and bottleneck persistence.
"""

import time
from typing import List, Dict, Any, Tuple
from app.config import settings
from database.repository import IncidentRepository

class CrowdRiskEngine:
    def __init__(self):
        self.history_window = []  # List of (timestamp, count, density)
        self.max_window_size = 30
        self.last_incident_time = 0.0
        self.incident_cooldown = 30.0  # seconds between auto-generated alerts for same risk

    def evaluate(self, person_count: int, zone_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        now = time.time()
        
        # Concourse level density
        area = settings.MONITORED_AREA_SQM
        capacity = settings.MAX_CAPACITY
        density = round(person_count / max(area, 1.0), 2)
        occupancy_pct = round((person_count / max(capacity, 1)) * 100.0, 1)

        # Update historical window
        self.history_window.append((now, person_count, density))
        if len(self.history_window) > self.max_window_size:
            self.history_window.pop(0)

        # 1. Density Score (0 - 100) benchmarked against Fruin LOS
        # 0 p/m2 = 0 pts; 1.0 p/m2 = 30 pts; 2.5 p/m2 = 75 pts; >= 3.5 p/m2 = 100 pts
        if density <= settings.DENSITY_LOS_SAFE:
            density_score = (density / settings.DENSITY_LOS_SAFE) * 35.0
        elif density <= settings.DENSITY_LOS_MODERATE:
            density_score = 35.0 + ((density - settings.DENSITY_LOS_SAFE) / (settings.DENSITY_LOS_MODERATE - settings.DENSITY_LOS_SAFE)) * 25.0
        elif density <= settings.DENSITY_LOS_HIGH:
            density_score = 60.0 + ((density - settings.DENSITY_LOS_MODERATE) / (settings.DENSITY_LOS_HIGH - settings.DENSITY_LOS_MODERATE)) * 25.0
        else:
            density_score = min(85.0 + ((density - settings.DENSITY_LOS_HIGH) / 1.0) * 15.0, 100.0)

        # 2. Occupancy Score (0 - 100)
        occupancy_score = min(occupancy_pct, 100.0)

        # 3. Accumulation Rate (Surge Velocity)
        growth_rate_score = 0.0
        if len(self.history_window) >= 5:
            delta_count = self.history_window[-1][1] - self.history_window[0][1]
            delta_time = max(self.history_window[-1][0] - self.history_window[0][0], 1.0)
            velocity_per_min = (delta_count / delta_time) * 60.0
            
            if velocity_per_min > 15:
                growth_rate_score = 90.0
            elif velocity_per_min > 8:
                growth_rate_score = 65.0
            elif velocity_per_min > 3:
                growth_rate_score = 40.0
            elif velocity_per_min > 0:
                growth_rate_score = 20.0

        # 4. Bottleneck Constriction Factor (Max Zone Pressure)
        max_zone_occupancy = max([zm.get("occupancy_pct", 0.0) for zm in zone_metrics], default=occupancy_pct)
        constriction_factor = min(max_zone_occupancy, 100.0)

        # Composite Multi-Factor Formulation
        # 35% Density + 25% Occupancy + 20% Constriction + 20% Growth Rate
        composite_score = round(
            (0.35 * density_score) +
            (0.25 * occupancy_score) +
            (0.20 * constriction_factor) +
            (0.20 * growth_rate_score),
            1
        )
        composite_score = min(max(composite_score, 0.0), 100.0)

        # Classification
        if composite_score >= settings.RISK_THRESHOLD_CRITICAL or density >= settings.DENSITY_LOS_CRITICAL:
            risk_level = "CRITICAL"
            level_color = "#ef4444"
            reason = (
                f"Severe crowd density pressure detected ({density} p/m²). "
                f"Localized sector capacity exceeded threshold ({max_zone_occupancy}%). "
                f"Impending stampede / crush compression risk."
            )
        elif composite_score >= settings.RISK_THRESHOLD_HIGH or density >= settings.DENSITY_LOS_HIGH:
            risk_level = "HIGH"
            level_color = "#f97316"
            reason = (
                f"Elevated bottleneck accumulation observed ({density} p/m²). "
                f"Pedestrian velocity is constricting with active ingress building up."
            )
        elif composite_score >= settings.RISK_THRESHOLD_MODERATE or density >= settings.DENSITY_LOS_MODERATE:
            risk_level = "MODERATE"
            level_color = "#f59e0b"
            reason = (
                f"Moderate localized congregation ({density} p/m²). "
                f"Flow speeds remain stable but require continuous surveillance."
            )
        else:
            risk_level = "LOW"
            level_color = "#10b981"
            reason = (
                f"Concourse operating under nominal free-flow conditions ({density} p/m²). "
                f"Ample reserve capacity available across all primary corridors."
            )

        limitations = (
            "Assessment is based on 2D monocular optical projection calibrated to a 55m² floor area. "
            "Does not account for non-visible occlusions behind structural pillars."
        )

        # Log risk snapshot to database
        dominant_zone = "ZONE_A"
        if zone_metrics:
            sorted_zones = sorted(zone_metrics, key=lambda z: z.get("risk_score", 0), reverse=True)
            dominant_zone = sorted_zones[0].get("id", "ZONE_A")
        
        IncidentRepository.record_risk_snapshot(composite_score, risk_level, person_count, density, dominant_zone)

        # Auto-create incident alert if HIGH or CRITICAL and cooldown passed
        if risk_level in ["HIGH", "CRITICAL"] and (now - self.last_incident_time > self.incident_cooldown):
            self.last_incident_time = now
            IncidentRepository.create_incident(
                severity=risk_level,
                title=f"{risk_level} Crowd Hazard Triggered",
                description=reason,
                zone_id=dominant_zone,
                person_count=person_count,
                risk_score=composite_score
            )

        return {
            "risk_score": composite_score,
            "risk_level": risk_level,
            "level_color": level_color,
            "reason": reason,
            "limitations": limitations,
            "breakdown": {
                "density_score": round(density_score, 1),
                "occupancy_score": round(occupancy_score, 1),
                "accumulation_rate_score": round(growth_rate_score, 1),
                "constriction_factor": round(constriction_factor, 1)
            },
            "people_count": person_count,
            "avg_density_ppm2": density,
            "occupancy_pct": occupancy_pct
        }

risk_engine = CrowdRiskEngine()
