"""
SaFact Configuration
System constants, detection settings, spatial zone definitions, and risk thresholds.
"""

import os

class Settings:
    PROJECT_NAME: str = "SaFact"
    VERSION: str = "2.0.0"
    
    # Camera Settings
    DEFAULT_CAMERA_INDEX: int = 0
    CAMERA_WIDTH: int = 640
    CAMERA_HEIGHT: int = 480
    TARGET_FPS: int = 24
    
    # AI Inference Settings
    MODEL_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "yolov8n.pt")
    PERSON_CLASS_ID: int = 0  # COCO class 0 is person
    CONFIDENCE_THRESHOLD: float = 0.35
    INFERENCE_INTERVAL: int = 2  # Run YOLO every 2 frames for smooth CPU load
    
    # Concourse Spatial & Capacity Calibration
    MONITORED_AREA_SQM: float = 55.0  # Measured concourse floor area
    MAX_CAPACITY: int = 120           # Total safe maximum capacity
    
    # Risk Assessment Thresholds (Score out of 100)
    RISK_THRESHOLD_MODERATE: float = 40.0
    RISK_THRESHOLD_HIGH: float = 70.0
    RISK_THRESHOLD_CRITICAL: float = 85.0
    
    # Density Benchmarks (persons per m^2)
    # Based on Fruin Level of Service (LOS) for pedestrian flow
    DENSITY_LOS_SAFE: float = 1.0     # LOS A-B: Free pedestrian flow
    DENSITY_LOS_MODERATE: float = 1.8 # LOS C-D: Flow restricted
    DENSITY_LOS_HIGH: float = 2.5     # LOS E: Severe bottleneck
    DENSITY_LOS_CRITICAL: float = 3.5 # LOS F: Stampede / crush hazard
    
    # Initial Spatial Monitoring Zones (normalized coordinates 0.0 to 1.0)
    DEFAULT_ZONES = [
        {
            "id": "ZONE_A",
            "name": "North Concourse",
            "code": "SEC-A",
            "x1": 0.0, "y1": 0.0, "x2": 0.5, "y2": 0.5,
            "area_sqm": 20.0,
            "max_capacity": 45,
            "color": "#38bdf8"
        },
        {
            "id": "ZONE_B",
            "name": "Central Platform",
            "code": "SEC-B",
            "x1": 0.5, "y1": 0.0, "x2": 1.0, "y2": 0.5,
            "area_sqm": 18.0,
            "max_capacity": 40,
            "color": "#818cf8"
        },
        {
            "id": "ZONE_C",
            "name": "West Turnstiles",
            "code": "SEC-C",
            "x1": 0.0, "y1": 0.5, "x2": 0.5, "y2": 1.0,
            "area_sqm": 10.0,
            "max_capacity": 25,
            "color": "#f87171"
        },
        {
            "id": "ZONE_D",
            "name": "East Egress Corridor",
            "code": "SEC-D",
            "x1": 0.5, "y1": 0.5, "x2": 1.0, "y2": 1.0,
            "area_sqm": 15.0,
            "max_capacity": 35,
            "color": "#34d399"
        }
    ]

settings = Settings()
