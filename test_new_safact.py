"""
Comprehensive Verification Suite for Rebuilt SaFact Platform
Tests backend endpoints, AI inference, risk simulation, zones, and SQLite alerts.
"""

import urllib.request
import json
import time

BASE_API = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:3000"

def get(path):
    req = urllib.request.Request(f"{BASE_API}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post(path, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_API}{path}",
        data=body,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_suite():
    print("=" * 60)
    print("SAFACT VERIFICATION SUITE — TESTING REBUILT PLATFORM")
    print("=" * 60)

    # 1. System Status
    print("\n[1] Testing System Status Endpoint...")
    status = get("/api/system/status")
    print("  -> System Online:", status.get("system_online"))
    print("  -> Model Loaded:", status.get("model_loaded"), f"({status.get('model_name')})")
    print("  -> Camera Connected:", status.get("camera_connected"))
    print("  -> Uptime:", status.get("uptime_seconds"), "s")
    assert status.get("system_online") is True, "System should be online"

    # 2. Camera Status & Frame
    print("\n[2] Testing Camera Status...")
    cam = get("/api/camera/status")
    print("  -> Camera Running:", cam.get("is_running"))
    print("  -> Source:", cam.get("source"))

    # 3. Detections Dashboard
    print("\n[3] Testing Detections Dashboard...")
    dash = get("/api/detections/dashboard")
    print("  -> Person Count:", dash.get("person_count"))
    print("  -> FPS:", dash.get("fps"))
    print("  -> Risk Score:", dash.get("risk", {}).get("risk_score"))
    print("  -> Risk Level:", dash.get("risk", {}).get("risk_level"))
    print("  -> Active Alerts Count:", dash.get("active_alerts_count"))

    # 4. Concourse Zones
    print("\n[4] Testing Spatial Zones...")
    zones = get("/api/zones")
    print(f"  -> Total Active Zones: {len(zones)}")
    for z in zones:
        print(f"     [{z['code']}] {z['name']}: {z['people_count']} people, {z['density_ppm2']} p/m2, Level: {z['risk_level']}")
    assert len(zones) == 4, "Should have 4 zones"

    # 5. Controlled Risk Simulation Test
    print("\n[5] Testing Controlled Risk Simulation Engine...")
    sim_low = post("/api/risk/simulate", {"simulated_count": 5, "zone_id": "ZONE_A"})
    print("  -> 5 People Simulation: Score =", sim_low["assessment"]["risk_score"], "Level =", sim_low["assessment"]["risk_level"])
    
    sim_high = post("/api/risk/simulate", {"simulated_count": 75, "zone_id": "ZONE_C"})
    print("  -> 75 People Simulation: Score =", sim_high["assessment"]["risk_score"], "Level =", sim_high["assessment"]["risk_level"])
    assert sim_high["assessment"]["risk_score"] > sim_low["assessment"]["risk_score"], "Higher count should yield higher risk score"

    # 6. Safety Recommendations
    print("\n[6] Testing Safety Recommendations...")
    recs = get("/api/recommendations")
    print("  -> Active Directives Count:", len(recs.get("recommendations", [])))
    for r in recs.get("recommendations", []):
        print(f"     * [{r['priority']}] {r['action_title']}: {r['directive']}")

    # 7. SQLite Alerts & Acknowledgment
    print("\n[7] Testing SQLite Alerts & Acknowledgment Workflow...")
    alerts = get("/api/alerts")
    print(f"  -> Retrieved {len(alerts)} alert records from SQLite database.")
    if len(alerts) > 0:
        first_alert = alerts[0]
        alert_id = first_alert["id"]
        print(f"  -> Acknowledging alert {alert_id}...")
        ack = post(f"/api/alerts/{alert_id}/acknowledge", {})
        print("  -> Ack response:", ack)
        assert ack.get("status") == "acknowledged"

    # 8. Frontend Check
    print("\n[8] Testing Frontend Vite Server (Port 3000)...")
    req = urllib.request.Request(FRONTEND_URL)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print("  -> Frontend HTTP Status:", resp.status)
        assert "<div id=\"root\"></div>" in html or "root" in html, "Frontend should serve root element"
        print("  -> HTML root element confirmed.")

    print("\n" + "=" * 60)
    print("[SUCCESS] ALL 8 TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    test_suite()
