"""
SaFact — Smart AI for Crowd Flow and Threat Detection
FastAPI Backend Application Entrypoint
"""

import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse

# Ensure backend root is in Python module search path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.config import settings
from database.db import init_db
from services.camera_service import camera_service

# Routers
from app.api.system import router as system_router
from app.api.camera import router as camera_router
from app.api.detections import router as detections_router
from app.api.risk import router as risk_router
from app.api.zones import router as zones_router
from app.api.alerts import router as alerts_router
from app.api.recommendations import router as recommendations_router
from app.api.assistant import router as assistant_router
from app.api.contact import router as contact_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite database
    print("[SaFact Backend] Booting SaFact Core Engine...")
    init_db()
    print("[SaFact Backend] Database initialized.")
    yield
    # Shutdown: Stop camera capture gracefully
    print("[SaFact Backend] Shutting down optical sensor threads...")
    camera_service.stop()
    print("[SaFact Backend] Shutdown complete.")

app = FastAPI(
    title=f"{settings.PROJECT_NAME} Core API",
    version=settings.VERSION,
    description="Real-Time Concourse Crowd Intelligence & Autonomous Safety Guidance Platform",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Routers
app.include_router(system_router)
app.include_router(camera_router)
app.include_router(detections_router)
app.include_router(risk_router)
app.include_router(zones_router)
app.include_router(alerts_router)
app.include_router(recommendations_router)
app.include_router(assistant_router)
app.include_router(contact_router)


@app.get("/", response_class=HTMLResponse)
def root():
    """Root landing page with direct dashboard link and API status."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaFact AI Defense Engine</title>
    <style>
        body {
            margin: 0;
            background: #0a0f1d;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            background: #111827;
            border: 1px solid #1e293b;
            padding: 40px;
            border-radius: 16px;
            max-width: 520px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .badge {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.4);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 16px;
        }
        h1 { margin: 0 0 10px; font-size: 2rem; color: #f8fafc; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #06b6d4);
            color: white;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
        }
        .api-links {
            margin-top: 24px;
            font-size: 0.85rem;
            color: #64748b;
        }
        .api-links a { color: #38bdf8; text-decoration: none; margin: 0 8px; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">● SAFACT BACKEND LIVE & OPERATIONAL</span>
        <h1>🛡️ SaFact Core Engine</h1>
        <p>AI-Powered Crowd-Safety & Flow-Intelligence Platform running on FastAPI & Ultralytics YOLOv8.</p>
        <a href="http://localhost:3000" class="btn">Launch Command Dashboard (Port 3000)</a>
        <div class="api-links">
            <a href="/docs">Swagger API Docs</a> • 
            <a href="/api/system/status">System Status</a> • 
            <a href="/stream/video">Live Camera Stream</a>
        </div>
    </div>
</body>
</html>"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
