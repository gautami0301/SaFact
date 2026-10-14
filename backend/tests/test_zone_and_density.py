"""
Unit and integration tests for SaFact Four-Zone Spatial Intelligence,
Density and Space-Per-Person Calculations, and Grounded AI Assistant.
"""

import math
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.zone_service import zone_service
from services.assistant_service import assistant_service
from app.config import settings

def test_zone_configuration_has_four_quadrants():
    zones = zone_service.get_all_zones()
    assert len(zones) == 4, "Must have exactly 4 configured spatial zones"
    
    codes = [z["code"] for z in zones]
    assert "ZONE-A" in codes or "ZONE A" in codes
    assert "ZONE-B" in codes or "ZONE B" in codes
    assert "ZONE-C" in codes or "ZONE C" in codes
    assert "ZONE-D" in codes or "ZONE D" in codes

    # Zone D must be count-only
    zone_d = next(z for z in zones if z["id"] == "ZONE_D")
    assert zone_d.get("is_count_only") is True, "Zone D must default to count-only"
    assert zone_d.get("color") == "#64748b", "Zone D must be slate grey"

def test_zero_occupants_calculation_no_zerodivision():
    """Verify handling when 0 individuals are detected."""
    results = zone_service.evaluate_zones([])
    assert len(results) == 4

    for r in results:
        assert r["people_count"] == 0
        assert r["sqft_per_person"] is None, "Must be None when count is 0 to avoid division by zero"
        assert r["people_per_sqft"] == 0.0
        if r["is_count_only"]:
            assert r["density_category"] == "Count Only"
            assert r["risk_level"] == "COUNT_ONLY"
        else:
            assert "Zero Occupants" in r["density_category"]

def test_density_calculations_and_thresholds():
    """
    Test prototype thresholds:
    - Under 5.0 sq ft/person: High density
    - 5.0 to 10.0 sq ft/person: Moderate density
    - Over 10.0 sq ft/person: Lower density
    """
    # Zone A has area 215 sq ft (x: 0..0.5, y: 0..0.5)
    # 50 people in Zone A -> 215 / 50 = 4.3 sq ft/p (< 5 sq ft -> High Density)
    high_density_detections = [
        {"normalized_cx": 0.2, "normalized_cy": 0.2, "confidence": 0.9}
        for _ in range(50)
    ]
    # Assign zones
    zone_service.assign_zones(high_density_detections)
    results = zone_service.evaluate_zones(high_density_detections)
    zone_a = next(r for r in results if r["id"] == "ZONE_A")

    assert zone_a["people_count"] == 50
    assert zone_a["sqft_per_person"] == round(215.0 / 50, 1) # 4.3 sq ft
    assert zone_a["people_per_sqft"] == round(50 / 215.0, 4)
    assert zone_a["density_category"] == "High Density"
    assert zone_a["risk_level"] in ["HIGH", "CRITICAL"]

    # Zone C has area 269 sq ft (x: 0..0.5, y: 0.5..1.0)
    # 10 people in Zone C -> 269 / 10 = 26.9 sq ft/p (> 10 sq ft -> Lower Density)
    low_density_detections = [
        {"normalized_cx": 0.2, "normalized_cy": 0.7, "confidence": 0.9}
        for _ in range(10)
    ]
    zone_service.assign_zones(low_density_detections)
    results_c = zone_service.evaluate_zones(low_density_detections)
    zone_c = next(r for r in results_c if r["id"] == "ZONE_C")

    assert zone_c["people_count"] == 10
    assert zone_c["sqft_per_person"] == 26.9
    assert zone_c["density_category"] == "Lower Density"
    assert zone_c["risk_level"] == "LOW"

def test_zone_d_count_only_preservation():
    """Verify that Zone D never assigns automated risk score even with high count."""
    # Place 30 people in Zone D (x: 0.5..1.0, y: 0.5..1.0)
    zone_d_detections = [
        {"normalized_cx": 0.7, "normalized_cy": 0.7, "confidence": 0.9}
        for _ in range(30)
    ]
    zone_service.assign_zones(zone_d_detections)
    results = zone_service.evaluate_zones(zone_d_detections)
    zone_d = next(r for r in results if r["id"] == "ZONE_D")

    assert zone_d["people_count"] == 30
    assert zone_d["is_count_only"] is True
    assert zone_d["density_category"] == "Count Only"
    assert zone_d["risk_level"] == "COUNT_ONLY"
    assert zone_d["risk_score"] == 0.0

def test_assistant_grounded_fallback():
    """Verify assistant accurately queries latest stats without hallucinating."""
    res = assistant_service.generate_response("Where is the crowd most concentrated?")
    assert isinstance(res, dict)
    assert "reply" in res
    assert isinstance(res["reply"], str)
    assert len(res["reply"]) > 10
    assert res["grounded"] is True

if __name__ == "__main__":
    test_zone_configuration_has_four_quadrants()
    test_zero_occupants_calculation_no_zerodivision()
    test_density_calculations_and_thresholds()
    test_zone_d_count_only_preservation()
    test_assistant_grounded_fallback()
    print("ALL TESTS PASSED SUCCESSFULLY!")
