from fastapi import APIRouter, Response, Request, HTTPException
from fastapi.responses import StreamingResponse
import time
import base64
import cv2
import numpy as np
from services.camera_service import camera_service
from models.schemas import CameraConfigRequest, ProcessFrameRequest

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

@router.post("/api/camera/process-frame")
async def process_frame(request: Request):
    """
    Receives an optical video frame from the user's laptop browser webcam,
    executes real-time YOLOv8n object detection, assigns spatial concourse zones,
    and returns tactical bounding coordinates, crowd headcount, and risk indices.
    """
    content_type = request.headers.get("content-type", "")
    frame = None

    try:
        if "application/json" in content_type:
            body = await request.json()
            image_str = body.get("image", "")
            if not image_str:
                raise HTTPException(status_code=400, detail="Missing 'image' base64 data in payload.")
            if "," in image_str:
                image_str = image_str.split(",", 1)[1]
            image_bytes = base64.b64decode(image_str)
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif "multipart/form-data" in content_type:
            form = await request.form()
            file = form.get("file")
            if file:
                content = await file.read()
                nparr = np.frombuffer(content, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            raw_bytes = await request.body()
            if raw_bytes:
                nparr = np.frombuffer(raw_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Frame decode failure: {str(e)}")

    if frame is None or frame.size == 0:
        raise HTTPException(status_code=400, detail="Unable to decode image frame.")

    result = camera_service.process_browser_frame(frame)
    return result

@router.get("/api/camera/status")
def get_camera_status():
    stats = camera_service.get_latest_stats()
    return {
        "connected": stats["camera_connected"],
        "is_running": camera_service.is_running,
        "source": camera_service.camera_source,
        "fps": stats["fps"],
        "has_processed_frame": stats["has_processed_frame"],
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

