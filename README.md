# 🛡️ SaFact — Smart AI for Crowd Flow and Threat Detection

> *Real-time crowd intelligence, optical YOLO person detection, bottleneck mitigation, and autonomous pedestrian flow guidance.*


---

## 📌 Project Overview

**SaFact** (*Smart AI for Crowd Flow and Threat Detection*) is a production-grade defense and facility safety intelligence platform designed for public transit hubs, stadiums, and high-footfall concourses. 

Unlike traditional head-counting software, **SaFact** synthesizes localized spatial density, architectural constriction, accumulation surge velocity, and directional movement into an operational hazard index, automatically computing diversion routes before stampede or crush conditions emerge.

---

## 🏗️ System Architecture

```
Laptop Webcam / RTSP Network Video Feed
                   │
                   ▼
       Frame Ingestion & OpenCV Buffer
                   │
                   ▼
     Ultralytics YOLOv8 Person Detector
          (COCO Class 0: Person)
                   │
                   ▼
       Spatial Multi-Sector Partitioning
          (Zones A through D Centroids)
                   │
                   ▼
     Multi-Factor Hazard Assessment Engine
     ├── Density Saturation Index (35%)
     ├── Concourse Capacity Load (25%)
     ├── Directional Accumulation Flux (20%)
     └── Bottleneck Constriction Factor (20%)
                   │
                   ▼
       Autonomous Flow Guidance Directives
    (Bottleneck Sector ➔ Safe Relief Corridor)
                   │
                   ▼
  React + Vite Security Command Dashboard (Port 3000)
```

---

## 🚀 Key Modules & Capabilities

- **Command Center Dashboard**: Dark navy and charcoal tactical monitoring console with high-contrast stats, KPI metrics, live optical sensor feed, and active directives.
- **Optical Sensor Feed**: Direct integration with laptop webcam via OpenCV with MJPEG low-latency streaming and tactical HUD overlays.
- **Real AI Person Detection**: Deep learning inference powered by Ultralytics YOLOv8n, generating real-time bounding boxes, confidences, and centroids.
- **Spatial Sector Partitioning**: Real-time concourse partitioning into Zones A–D, tracking localized densities (p/m²), capacity loads, and movement trends.
- **Multi-Factor Risk Assessment Engine**: Normalized 0–100 hazard index with transparent component breakdowns, rationale generation, and scenario simulation.
- **Autonomous Safety Directives**: Context-aware diversion guidance that calculates optimal relief corridors based on active bottleneck states.
- **Persistent Incident History**: SQLite-backed incident logging with acknowledgement workflows, severity filtering, and timeline charts.
- **System Settings & CCTV Configuration**: Seamlessly switch from local laptop webcam to remote RTSP/IP CCTV camera streams.

---

## 🛠️ Quick Start & Launch

### Prerequisites
- Python 3.10+
- Node.js 18+ (tested with v24)
- Windows 10/11 with webcam

### 1-Click Launch (Recommended)
Double-click `start_safact.bat` or run:
```powershell
.\start_safact.bat
```
*(PowerShell alternative: `.\start_safact.ps1`)*

The platform will automatically launch:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Directory Structure

```
SaFact/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint & CORS config
│   │   ├── config.py                   # System thresholds, zones & camera configs
│   │   └── api/
│   │       ├── system.py               # Health & hardware telemetry
│   │       ├── camera.py               # Camera controls & MJPEG stream
│   │       ├── detections.py           # Real-time detection coordinates
│   │       ├── risk.py                 # Crowd risk analysis & simulation
│   │       ├── zones.py                # Sector analysis endpoints
│   │       ├── alerts.py               # SQLite incident management
│   │       └── recommendations.py      # Flow guidance directives
│   ├── models/
│   │   ├── yolo_detector.py            # Ultralytics YOLOv8 + OpenCV HOG backup
│   │   └── schemas.py                  # Pydantic serialization models
│   ├── services/
│   │   ├── camera_service.py           # Thread-safe OpenCV VideoCapture manager
│   │   ├── risk_engine.py              # Multi-factor hazard formulation
│   │   ├── recommendation_service.py   # Contextual directive generator
│   │   └── zone_service.py             # Spatial centroid assignment
│   └── database/
│       ├── db.py                       # SQLite schema & initialization
│       └── repository.py               # Incidents and risk time-series queries
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Tactical UI widgets & charts
│   │   ├── views/                      # 7 Full-screen operation views
│   │   ├── services/api.js             # Asynchronous API client
│   │   ├── App.jsx                     # Core application orchestrator
│   │   └── index.css                   # Dark tactical command center styling
│   ├── vite.config.js                  # Vite configuration & backend proxy
│   └── package.json
│
├── yolov8n.pt                          # Pretrained YOLOv8 nano model weights
├── start_safact.bat                    # One-command Windows startup script
├── start_safact.ps1                    # One-command PowerShell startup script
├── requirements.txt                    # Python dependencies
└── README.md                           # System documentation
```

---

## 🔬 Benchmark Calibration & Standards

- **Density Standards**: Benchmarked against John Fruin's *Pedestrian Planning and Design* Level of Service (LOS):
  - **LOS A–B (< 1.0 p/m²)**: Free flow, nominal safety.
  - **LOS C–D (1.0 – 1.8 p/m²)**: Restricted flow, advisory monitoring.
  - **LOS E (1.8 – 2.5 p/m²)**: Severe bottleneck, crowd balancing required.
  - **LOS F (> 2.5 p/m²)**: Compression and stampede hazard, urgent intervention.
- **Privacy Assurance**: Processed locally on-device. Identifiable facial data is never retained or stored to disk.

---

## 📹 Live Camera Architecture & Ingestion Pipeline

To support deployment on headless cloud infrastructure (Render) without attempting server-side hardware access (`cv2.VideoCapture(0)`):

1. **Client-Side Video Stream**: The user's browser requests webcam access on-demand using `navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })` when clicking **Initialize Camera Stream**.
2. **Lightweight Frame Transmission**: An offscreen canvas captures frames scaled to max 640×480 with JPEG quality 0.65 (~30 KB payload) and transmits them at ~1.5 FPS to `POST /api/camera/process-frame`.
3. **YOLOv8n Inference & Telemetry**: FastAPI ingests the frame, executes the Ultralytics YOLOv8 detector, assigns spatial sectors (Zones A–D), computes Fruin LOS density, and generates real-time autonomous safety guidance.
4. **Zero-Lag Tactical HUD**: The browser overlays an HTML5 canvas directly over the live `<video>` preview, drawing bounding boxes, confidence badges, centroids, and sector lines in real-time.
5. **Safe Hardware Lifecycle**: When clicking **Stop Feed** or exiting the page, all `MediaStreamTrack` hardware locks are released.

