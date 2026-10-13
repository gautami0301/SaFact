"""
Camera API Router & Live Video Streaming Endpoint
Serves real-time MJPEG streams, snapshot frames, and camera lifecycle control.
"""

from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
import time
from services.camera_service import camera_service
from models.schemas import CameraConfigRequest

router = APIRouter(tags=["Camera"])

def generate_mjpeg_stream():
    """Generates continuous multipart JPEG stream for HTML <img> embedding."""
    while True:
        frame_bytes = camera_service.get_annotated_frame_jpeg()
        if frame_bytes:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
        time.sleep(0.04)  # ~25 FPS

@router.get("/stream/video")
@router.get("/api/camera/stream")
def video_feed():
    """Live video stream with real-time YOLO bounding boxes and tactical HUD."""
    return StreamingResponse(
        generate_mjpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/api/camera/frame")
def get_snapshot():
    """Returns a single latest annotated JPEG frame."""
    frame_bytes = camera_service.get_annotated_frame_jpeg()
    return Response(content=frame_bytes, media_type="image/jpeg")

@router.get("/api/camera/status")
def get_camera_status():
    return {
        "connected": camera_service.camera_connected,
        "is_running": camera_service.is_running,
        "source": camera_service.camera_source,
        "fps": camera_service.fps,
        "error_message": camera_service.error_message
    }

@router.post("/api/camera/start")
def start_camera():
    camera_service.start()
    return {"status": "started", "connected": camera_service.camera_connected}

@router.post("/api/camera/stop")
def stop_camera():
    camera_service.stop()
    return {"status": "stopped", "connected": False}

@router.post("/api/camera/source")
def switch_source(req: CameraConfigRequest):
    camera_service.restart(req.source)
    return {
        "status": "reconfigured",
        "new_source": req.source,
        "connected": camera_service.camera_connected
    }
