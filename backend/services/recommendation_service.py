"""
SaFact Safety Recommendation Service
Generates targeted tactical security guidance and flow directives tied to the active risk level.
"""

from typing import List, Dict, Any

class RecommendationService:
    @staticmethod
    def generate_recommendations(risk_assessment: Dict[str, Any], zone_metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        risk_level = risk_assessment.get("risk_level", "LOW")
        recs = []

        # Find most congested zone and safest reserve zone
        bottleneck_zone = None
        relief_zone = None

        if zone_metrics:
            sorted_by_pressure = sorted(zone_metrics, key=lambda z: z.get("occupancy_pct", 0), reverse=True)
            if sorted_by_pressure[0].get("occupancy_pct", 0) > 40:
                bottleneck_zone = sorted_by_pressure[0]

            sorted_by_free_space = sorted(zone_metrics, key=lambda z: z.get("occupancy_pct", 0))
            if sorted_by_free_space[0].get("occupancy_pct", 0) < 50:
                relief_zone = sorted_by_free_space[0]

        b_name = bottleneck_zone["name"] if bottleneck_zone else "Primary Concourse"
        r_name = relief_zone["name"] if relief_zone else "Secondary Corridor"

        if risk_level == "CRITICAL":
            recs.append({
                "id": "REC-01",
                "priority": "P1 - IMMEDIATE",
                "action_title": "Emergency Flow Intervention & Marshal Dispatch",
                "directive": f"Halt further pedestrian ingress into {b_name}. Deploy tactical ground marshals to execute controlled release.",
                "rationale": "Sustained critical density threatens pedestrian crush. Immediate physical dispersion required before stampede conditions escalate.",
                "target_zone": b_name,
                "relief_zone": r_name
            })
            recs.append({
                "id": "REC-02",
                "priority": "P1 - IMMEDIATE",
                "action_title": "Activate Alternate Relief Bypass",
                "directive": f"Direct non-urgent pedestrian stream toward {r_name}. Verify that auxiliary exit corridors remain unblocked prior to routing.",
                "rationale": f"{r_name} maintains sufficient capacity reserve to dissipate bottleneck pressure safely.",
                "target_zone": b_name,
                "relief_zone": r_name
            })
            recs.append({
                "id": "REC-03",
                "priority": "P2 - URGENT",
                "action_title": "Broadcast Audible Concourse Guidance",
                "directive": "Transmit calm automated public address directives advising pedestrians to avoid stopping in transition zones.",
                "rationale": "Prevents counter-directional friction at junction points.",
                "target_zone": b_name,
                "relief_zone": None
            })

        elif risk_level == "HIGH":
            recs.append({
                "id": "REC-01",
                "priority": "P2 - ELEVATED",
                "action_title": "Notify Security Personnel & Inspect Pinch Points",
                "directive": f"Alert security duty desk to inspect {b_name} transfer gates. Prepare digital signage for dynamic flow balancing.",
                "rationale": f"Capacity load in {b_name} has crossed safe threshold with rising accumulation rates.",
                "target_zone": b_name,
                "relief_zone": r_name
            })
            recs.append({
                "id": "REC-02",
                "priority": "P2 - ELEVATED",
                "action_title": "Throttle Inflow at Perimeter Gateways",
                "directive": f"Slow down ticketing and turnstile throughput leading toward {b_name} to stabilize concourse equilibrium.",
                "rationale": "Net arrival volume exceeds discharge speed.",
                "target_zone": b_name,
                "relief_zone": None
            })

        elif risk_level == "MODERATE":
            recs.append({
                "id": "REC-01",
                "priority": "P3 - ADVISORY",
                "action_title": "Increase Sensor Sampling & Monitor Junctions",
                "directive": f"Maintain close optical tracking on {b_name}. Verify that transit arrival discharges clear within standard 5-minute cycle.",
                "rationale": "Localized congregation observed; flow remains fluid without sustained obstruction.",
                "target_zone": b_name,
                "relief_zone": None
            })
            recs.append({
                "id": "REC-02",
                "priority": "P4 - ROUTINE",
                "action_title": "Verify Relief Corridor Readiness",
                "directive": f"Ensure {r_name} remains unobstructed by luggage carts or maintenance barriers.",
                "rationale": "Maintains standby reserve egress availability.",
                "target_zone": r_name,
                "relief_zone": None
            })

        else: # LOW
            recs.append({
                "id": "REC-01",
                "priority": "P4 - NOMINAL",
                "action_title": "Maintain Continuous Baseline Surveillance",
                "directive": "Concourse operating under nominal crowd safety conditions. Continue automated optical telemetry logging.",
                "rationale": "All monitored sectors within Fruin Level of Service A-B (Free Flow).",
                "target_zone": "All Monitored Sectors",
                "relief_zone": None
            })

        return recs

recommendation_service = RecommendationService()
