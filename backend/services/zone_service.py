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
        import time
        now = time.time()
        for z in self.zones:
            zid = z["id"]
            count = zone_counts.get(zid, 0)
            area_sqm = z.get("area_sqm", 20.0)
            area_sqft = z.get("area_sqft", round(area_sqm * 10.7639, 1))
            capacity = z.get("max_capacity", 40)
            is_count_only = z.get("is_count_only", False)

            # Density (persons per m^2) and occupancy
            density = round(count / max(area_sqm, 1.0), 2)
            occupancy_pct = round((count / max(capacity, 1)) * 100.0, 1)

            # Square footage calculations
            if count > 0:
                sqft_per_person = round(area_sqft / count, 1)
                people_per_sqft = round(count / area_sqft, 4)
            else:
                sqft_per_person = None
                people_per_sqft = 0.0

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

            # Density category and prototype risk classification
            if is_count_only:
                density_category = "Count Only"
                risk_level = "COUNT_ONLY"
                risk_score = 0.0
                rec_action = "Perimeter counting partition: observation active without risk classification."
                explanation = "Zone D is configured for occupant count tracking only by default."
            else:
                high_sqft = getattr(settings, "SQFT_PER_PERSON_HIGH", 5.0)
                mod_sqft = getattr(settings, "SQFT_PER_PERSON_MODERATE", 10.0)
                los_high = getattr(settings, "DENSITY_LOS_HIGH", 2.5)
                los_critical = getattr(settings, "DENSITY_LOS_CRITICAL", 3.5)
                los_moderate = getattr(settings, "DENSITY_LOS_MODERATE", 1.8)

                if count == 0:
                    density_category = "Zero Occupants (Free Flow)"
                    risk_level = "LOW"
                    risk_score = 5.0
                    rec_action = "Clear corridor. Ample capacity available."
                    explanation = f"No individuals detected in this {area_sqft} sq ft sector."
                elif (sqft_per_person is not None and sqft_per_person < high_sqft) or density >= los_high:
                    density_category = "High Density"
                    risk_level = "HIGH" if density < los_critical else "CRITICAL"
                    risk_score = 82.0 if risk_level == "HIGH" else 94.0
                    rec_action = "High localized crowding. Encourage flow toward adjacent lower-density corridors."
                    explanation = f"Space per person ({sqft_per_person} sq ft/p) is below safe threshold (< 5 sq ft)."
                elif (sqft_per_person is not None and sqft_per_person <= mod_sqft) or density >= los_moderate:
                    density_category = "Moderate Density"
                    risk_level = "MODERATE"
                    risk_score = 52.0
                    rec_action = "Steady pedestrian transit. Maintain continuous visual monitoring."
                    explanation = f"Moderate crowding ({sqft_per_person} sq ft/person). Space allows nominal movement."
                else:
                    density_category = "Lower Density"
                    risk_level = "LOW"
                    risk_score = 18.0
                    rec_action = "Free flow conditions. Ample reserve space available."
                    explanation = f"Open conditions ({sqft_per_person} sq ft/person). Space exceeds 10 sq ft per person."

            results.append({
                "id": zid,
                "name": z["name"],
                "code": z["code"],
                "people_count": count,
                "capacity": capacity,
                "occupancy_pct": occupancy_pct,
                "area_sqm": area_sqm,
                "area_sqft": area_sqft,
                "sqft_per_person": sqft_per_person,
                "people_per_sqft": people_per_sqft,
                "density_category": density_category,
                "density": density,
                "density_ppm2": density,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "trend": trend,
                "recommended_action": rec_action,
                "explanation": explanation,
                "is_count_only": is_count_only,
                "color": z["color"],
                "last_analysis_timestamp": now,
                "bounds": {
                    "x1": z["x1"], "y1": z["y1"],
                    "x2": z["x2"], "y2": z["y2"]
                }
            })

        return results

zone_service = ZoneService()

