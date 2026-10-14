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
    
    # Prototype Classification Thresholds (sq ft per person)
    SQFT_PER_PERSON_HIGH: float = 5.0        # Under 5 sq ft/person: High density
    SQFT_PER_PERSON_MODERATE: float = 10.0   # 5-10 sq ft/person: Moderate density
    # Over 10 sq ft/person: Lower density

    # Initial Spatial Monitoring Zones (normalized coordinates 0.0 to 1.0)
    DEFAULT_ZONES = [
        {
            "id": "ZONE_A",
            "name": "Zone A (Red)",
            "code": "ZONE-A",
            "x1": 0.0, "y1": 0.0, "x2": 0.5, "y2": 0.5,
            "area_sqm": 20.0,
            "area_sqft": 215.0,
            "max_capacity": 45,
            "color": "#ef4444",
            "is_count_only": False,
            "description": "High estimated density / hotspot observation partition"
        },
        {
            "id": "ZONE_B",
            "name": "Zone B (Yellow)",
            "code": "ZONE-B",
            "x1": 0.5, "y1": 0.0, "x2": 1.0, "y2": 0.5,
            "area_sqm": 18.0,
            "area_sqft": 194.0,
            "max_capacity": 40,
            "color": "#eab308",
            "is_count_only": False,
            "description": "Moderate estimated density transit concourse"
        },
        {
            "id": "ZONE_C",
            "name": "Zone C (Green)",
            "code": "ZONE-C",
            "x1": 0.0, "y1": 0.5, "x2": 0.5, "y2": 1.0,
            "area_sqm": 25.0,
            "area_sqft": 269.0,
            "max_capacity": 50,
            "color": "#22c55e",
            "is_count_only": False,
            "description": "Lower estimated density bypass passage"
        },
        {
            "id": "ZONE_D",
            "name": "Zone D (Slate Grey)",
            "code": "ZONE-D",
            "x1": 0.5, "y1": 0.5, "x2": 1.0, "y2": 1.0,
            "area_sqm": 15.0,
            "area_sqft": 161.0,
            "max_capacity": 35,
            "color": "#64748b",
            "is_count_only": True,
            "description": "Perimeter observation sector (people-count only by default)"
        }
    ]

settings = Settings()

