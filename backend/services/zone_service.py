"""
SaFact Zone Analysis Service
Maps detected pedestrian centroids to concourse spatial sectors and computes zone-level risks.
"""

from typing import List, Dict, Any
from app.config import settings

class ZoneService:
    def __init__(self):
        self.zones = [dict(z) for z in settings.DEFAULT_ZONES]
        self.previous_counts = {z["id"]: 0 for z in self.zones}

    def get_all_zones(self) -> List[Dict[str, Any]]:
        return self.zones

    def assign_zones(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Assigns zone_id to each detection based on normalized centroid coordinates.
        """
        for d in detections:
            norm_cx = d.get("normalized_cx", 0.5)
            norm_cy = d.get("normalized_cy", 0.5)
            assigned_zone = None

            for z in self.zones:
                if z["x1"] <= norm_cx <= z["x2"] and z["y1"] <= norm_cy <= z["y2"]:
                    assigned_zone = z["id"]
                    break
            
            d["zone_id"] = assigned_zone or "ZONE_A"

        return detections

    def evaluate_zones(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Computes granular zone telemetry, density, capacity ratio, and risk state.
        """
        # Count per zone
        zone_counts = {z["id"]: 0 for z in self.zones}
        for d in detections:
            zid = d.get("zone_id")
            if zid in zone_counts:
                zone_counts[zid] += 1
            else:
                zone_counts[self.zones[0]["id"]] += 1

        results = []
        for z in self.zones:
            zid = z["id"]
            count = zone_counts.get(zid, 0)
            area = z.get("area_sqm", 20.0)
            capacity = z.get("max_capacity", 40)

            # Density (persons per m^2)
            density = round(count / max(area, 1.0), 2)
            occupancy_pct = round((count / max(capacity, 1)) * 100.0, 1)

            # Trend calculation
            prev_count = self.previous_counts.get(zid, count)
            if count > prev_count + 1:
                trend = "Surging (+)"
            elif count > prev_count:
                trend = "Rising"
            elif count < prev_count - 1:
                trend = "Declining (-)"
            elif count < prev_count:
                trend = "Easing"
            else:
                trend = "Stable"
            self.previous_counts[zid] = count

            # Risk classification per zone
            if occupancy_pct >= 90 or density >= settings.DENSITY_LOS_CRITICAL:
                risk_level = "CRITICAL"
                risk_score = 92.0
                rec_action = "Restrict entry gates immediately & dispatch floor marshals."
            elif occupancy_pct >= 75 or density >= settings.DENSITY_LOS_HIGH:
                risk_level = "HIGH"
                risk_score = 78.0
                rec_action = "Initiate diversion directives toward reserve corridors."
            elif occupancy_pct >= 50 or density >= settings.DENSITY_LOS_MODERATE:
                risk_level = "MODERATE"
                risk_score = 52.0
                rec_action = "Increase camera monitoring & verify passage fluidity."
            else:
                risk_level = "LOW"
                risk_score = 15.0
                rec_action = "Nominal pedestrian flow. Routine surveillance."

            results.append({
                "id": zid,
                "name": z["name"],
                "code": z["code"],
                "people_count": count,
                "capacity": capacity,
                "occupancy_pct": occupancy_pct,
                "area_sqm": area,
                "density_ppm2": density,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "trend": trend,
                "recommended_action": rec_action,
                "color": z["color"],
                "bounds": {
                    "x1": z["x1"], "y1": z["y1"],
                    "x2": z["x2"], "y2": z["y2"]
                }
            })

        return results

zone_service = ZoneService()
