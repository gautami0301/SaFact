"""
SaFact Person Detection and Crowd Metrics Pipeline Test
Validates end-to-end detection, zone distribution, density formulas,
risk updates, and HTTP API handling of valid and invalid frames.
"""

import os
import sys
import base64
import cv2
import numpy as np
import requests

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.camera_service import camera_service
from app.config import settings

def test_blank_frame_processing():
    """Verify processing an empty / black image results in zero persons without errors."""
    blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    res = camera_service.process_browser_frame(blank_frame)
    
    assert res is not None, "Result must not be None"
    assert res["person_count"] == 0, f"Expected 0 persons on blank frame, got {res['person_count']}"
    assert len(res["detections"]) == 0
    assert res["has_processed_frame"] is True
    assert len(res["zones"]) == 4

    for z in res["zones"]:
        assert z["people_count"] == 0
        assert z["sqft_per_person"] is None
        assert z["density"] == 0.0

    print("✔ test_blank_frame_processing PASSED")

def test_real_person_detection_with_sample_image():
    """Verify YOLOv8 detects real persons in sample image, assigns zones and updates metrics."""
    import ultralytics
    sample_path = os.path.join(os.path.dirname(ultralytics.__file__), "assets", "bus.jpg")
    assert os.path.exists(sample_path), f"Sample image not found at {sample_path}"

    frame = cv2.imread(sample_path)
    assert frame is not None, "Failed to load sample image"

    res = camera_service.process_browser_frame(frame)

    assert res["person_count"] > 0, f"Expected real persons detected in bus.jpg, got {res['person_count']}"
    detections = res["detections"]
    assert len(detections) == res["person_count"]

    # Verify each detection structure
    for d in detections:
        assert d["class_id"] == 0, f"Class ID must be 0 (person), got {d['class_id']}"
        assert d["class_name"] == "person"
        assert d["confidence"] >= settings.CONFIDENCE_THRESHOLD
        assert d["x2"] > d["x1"]
        assert d["y2"] > d["y1"]
        assert "zone_id" in d
        assert d["zone_id"] in ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D"]

    # Verify zone assignment and density metrics
    zones = res["zones"]
    assert len(zones) == 4
    total_in_zones = sum(z["people_count"] for z in zones)
    assert total_in_zones == res["person_count"], f"Sum of zone counts ({total_in_zones}) must match total count ({res['person_count']})"

    occupied_zones = [z for z in zones if z["people_count"] > 0]
    assert len(occupied_zones) > 0, "At least one zone must have detected people"

    for oz in occupied_zones:
        assert oz["density"] > 0.0, f"Zone {oz['id']} density must be > 0"
        if not oz["is_count_only"]:
            assert oz["sqft_per_person"] is not None and oz["sqft_per_person"] > 0, "sqft_per_person must be computed"

    # Verify risk metrics
    risk = res["risk"]
    assert risk is not None
    assert risk["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert risk["risk_score"] >= 0.0
    assert risk["avg_density_ppm2"] >= 0.0

    print(f"✔ test_real_person_detection_with_sample_image PASSED ({res['person_count']} people detected)")

def test_api_process_frame_http():
    """Verify HTTP API endpoint /api/camera/process-frame with base64 payload."""
    import ultralytics
    sample_path = os.path.join(os.path.dirname(ultralytics.__file__), "assets", "bus.jpg")
    frame = cv2.imread(sample_path)
    _, buf = cv2.imencode(".jpg", frame)
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("utf-8")

    api_url = "http://127.0.0.1:8000/api/camera/process-frame"
    resp = requests.post(api_url, json={"image": b64_str}, timeout=10)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

    data = resp.json()
    assert data["has_processed_frame"] is True
    assert data["person_count"] > 0
    assert len(data["detections"]) == data["person_count"]

    # Verify response contains real detections
    assert data["has_processed_frame"] is True
    assert data["person_count"] > 0, f"Expected detected persons, got {data['person_count']}"
    assert len(data["detections"]) == data["person_count"]
    assert "risk" in data and data["risk"] is not None
    assert "zones" in data and len(data["zones"]) == 4

    # Verify dashboard endpoint returns active operational data
    dash_resp = requests.get("http://127.0.0.1:8000/api/detections/dashboard", timeout=5)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["has_processed_frame"] is True
    assert "person_count" in dash_data
    assert "risk" in dash_data and dash_data["risk"] is not None

    print(f"✔ test_api_process_frame_http PASSED (API returned {data['person_count']} detected persons)")

def test_api_invalid_payload_handling():
    """Verify invalid payloads return 400 Bad Request gracefully without crashing server."""
    api_url = "http://127.0.0.1:8000/api/camera/process-frame"
    
    # Missing image
    resp1 = requests.post(api_url, json={}, timeout=5)
    assert resp1.status_code == 400

    # Corrupt base64
    resp2 = requests.post(api_url, json={"image": "invalid_base64_garbage!"}, timeout=5)
    assert resp2.status_code == 400

    # Server remains alive
    health_resp = requests.get("http://127.0.0.1:8000/api/system/status", timeout=5)
    assert health_resp.status_code == 200
    assert health_resp.json()["system_online"] is True

    print("✔ test_api_invalid_payload_handling PASSED")

if __name__ == "__main__":
    print("\n--- Running SaFact Person Detection Pipeline Tests ---")
    test_blank_frame_processing()
    test_real_person_detection_with_sample_image()
    test_api_process_frame_http()
    test_api_invalid_payload_handling()
    print("\nALL PERSON DETECTION PIPELINE TESTS PASSED SUCCESSFULLY! 🎉\n")
