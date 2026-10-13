"""
SaFact Thread-Safe Camera & Vision Pipeline Service
Captures live frames from laptop webcam/RTSP, executes AI detection, and serves MJPEG streaming.
"""

import cv2
import threading
import time
import numpy as np
from typing import Optional, Dict, Any, List
from app.config import settings
from models.yolo_detector import YOLOPersonDetector
from services.zone_service import zone_service
from services.risk_engine import risk_engine
from services.recommendation_service import recommendation_service

class CameraService:
    def __init__(self):
        self.camera_source = "INTERNAL WEBCAM"
        self.cap = None
        self.is_running = False
        self.camera_connected = False
        self.has_processed_frame = False
        self.thread = None
        self.lock = threading.Lock()
        
        # Detector instance
        self.detector = YOLOPersonDetector()
        
        # Frame buffers
        self.current_raw_frame = None
        self.current_annotated_frame = None
        self.last_frame_time = time.time()
        self._last_browser_frame_time = 0.0
        
        # Telemetry metrics
        self.frame_count = 0
        self.fps = 0.0
        self.inference_fps = 0.0
        self.inference_time_ms = 0.0
        self.error_message = None
        
        # Latest AI analytics cache
        self.latest_detections = []
        self.latest_person_count = 0
        self.latest_zone_metrics = zone_service.evaluate_zones([])
        self.latest_risk_assessment = risk_engine.evaluate(0, self.latest_zone_metrics)
        self.latest_recommendations = recommendation_service.generate_recommendations(
            self.latest_risk_assessment, self.latest_zone_metrics
        )

        # Do NOT start cv2.VideoCapture(0) automatically.
        # Browser client streams frames directly to the backend.

    def start(self, source: Optional[str] = None):
        with self.lock:
            if source is not None:
                self.camera_source = source

            self.is_running = True
            self.error_message = None

            # If source is internal browser webcam, do not start server cv2.VideoCapture thread
            if str(self.camera_source).strip() in ["0", "1", "INTERNAL WEBCAM", "BROWSER WEBCAM"]:
                self.camera_source = "INTERNAL WEBCAM"
                return

            # External RTSP stream or custom video file
            if not self.thread or not self.thread.is_alive():
                self.thread = threading.Thread(target=self._capture_loop, daemon=True)
                self.thread.start()

    def stop(self):
        with self.lock:
            self.is_running = False
            self.camera_connected = False
            self.has_processed_frame = False
            self._last_browser_frame_time = 0.0
            if self.cap is not None:
                try:
                    self.cap.release()
                except Exception:
                    pass
                self.cap = None

    def restart(self, new_source: str):
        self.stop()
        time.sleep(0.3)
        self.start(new_source)


    def _init_capture(self) -> bool:
        try:
            # Parse source as int if digit, else string (RTSP / video)
            src = int(self.camera_source) if self.camera_source.isdigit() else self.camera_source
            print(f"[SaFact Camera] Connecting to camera source: {src}...")
            
            # Use CAP_DSHOW on Windows for fast webcam init
            if isinstance(src, int):
                self.cap = cv2.VideoCapture(src, cv2.CAP_DSHOW)
            else:
                self.cap = cv2.VideoCapture(src)

            if self.cap.isOpened():
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, settings.CAMERA_WIDTH)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, settings.CAMERA_HEIGHT)
                self.camera_connected = True
                self.error_message = None
                print(f"[SaFact Camera] Camera {src} opened successfully.")
                return True
            else:
                self.camera_connected = False
                self.error_message = f"Unable to open camera index {src}."
                print(f"[SaFact Camera Warning] {self.error_message}")
                return False
        except Exception as e:
            self.camera_connected = False
            self.error_message = f"Camera initialization exception: {str(e)}"
            print(f"[SaFact Camera Error] {self.error_message}")
            return False

    def _create_standby_frame(self, message: str = "CAMERA OFFLINE / DISCONNECTED") -> np.ndarray:
        """Generates a professional dark-themed standby canvas when webcam is not accessible."""
        canvas = np.zeros((settings.CAMERA_HEIGHT, settings.CAMERA_WIDTH, 3), dtype=np.uint8)
        # Gradient background
        canvas[:] = (20, 15, 10)  # Dark navy/slate BGR

        # Grid lines
        for y in range(0, settings.CAMERA_HEIGHT, 40):
            cv2.line(canvas, (0, y), (settings.CAMERA_WIDTH, y), (30, 25, 20), 1)
        for x in range(0, settings.CAMERA_WIDTH, 40):
            cv2.line(canvas, (x, 0), (x, settings.CAMERA_HEIGHT), (30, 25, 20), 1)

        # Standby text HUD
        cv2.putText(canvas, "SAFACT DEFENSE SUITE", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (240, 180, 50), 2)
        cv2.putText(canvas, f"STATUS: {message}", (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 240), 2)
        cv2.putText(canvas, "STANDBY MODE: RECONNECT CAMERA VIA SETTINGS", (30, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (160, 160, 160), 1)
        
        # Timestamp
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(canvas, ts, (30, settings.CAMERA_HEIGHT - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (120, 120, 120), 1)
        return canvas

    def _draw_hud(self, frame: np.ndarray, detections: List[Dict[str, Any]], inference_time_ms: float) -> np.ndarray:
        """Draws bounding boxes, zones, and tactical HUD on the processed video stream."""
        annotated = frame.copy()
        h, w = annotated.shape[:2]

        # 1. Draw subtle sector boundary outlines
        for z in settings.DEFAULT_ZONES:
            zx1, zy1 = int(z["x1"] * w), int(z["y1"] * h)
            zx2, zy2 = int(z["x2"] * w), int(z["y2"] * h)
            cv2.rectangle(annotated, (zx1, zy1), (zx2, zy2), (60, 50, 40), 1)
            cv2.putText(annotated, f"[{z['code']}] {z['name']}", (zx1 + 10, zy1 + 22), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 160, 120), 1)

        # 2. Draw detections
        person_count = len(detections)
        for det in detections:
            x1, y1 = int(det["x1"]), int(det["y1"])
            x2, y2 = int(det["x2"]), int(det["y2"])
            conf = det["confidence"]
            zid = det.get("zone_id", "ZONE_A")

            # High-visibility neon cyan / blue bounding box
            color = (255, 200, 0) if conf > 0.6 else (220, 140, 50)  # BGR
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

            # Corner brackets for tactical look
            corner_len = min(15, int((x2 - x1) * 0.2))
            cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), (0, 255, 255), 2)
            cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), (0, 255, 255), 2)
            cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), (0, 255, 255), 2)
            cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), (0, 255, 255), 2)

            # Label badge
            label = f"PERSON {int(conf * 100)}% [{zid}]"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(annotated, (x1, max(0, y1 - 20)), (x1 + tw + 6, max(0, y1)), color, -1)
            cv2.putText(annotated, label, (x1 + 3, max(14, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (10, 10, 10), 1)

            # Centroid point
            cx, cy = int(det["centroid_x"]), int(det["centroid_y"])
            cv2.circle(annotated, (cx, cy), 3, (0, 255, 255), -1)

        # 3. Top-Right Telemetry Badge
        badge_text = f"TRACKED: {person_count} | INFER: {inference_time_ms:.0f}ms | FPS: {self.fps:.1f}"
        (bw, bh), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(annotated, (w - bw - 20, 10), (w - 10, 36), (15, 15, 15), -1)
        cv2.rectangle(annotated, (w - bw - 20, 10), (w - 10, 36), (100, 80, 40), 1)
        cv2.putText(annotated, badge_text, (w - bw - 15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1)

        # Live REC indicator
        cv2.circle(annotated, (20, 24), 6, (0, 0, 255), -1)
        cv2.putText(annotated, "LIVE SENSOR FEED", (32, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (230, 230, 230), 1)

        return annotated

    def _capture_loop(self):
        fps_counter = 0
        fps_timer = time.time()

        while self.is_running:
            if not self.camera_connected:
                # Try opening camera
                if not self._init_capture():
                    # Camera failed: render standby frame
                    standby = self._create_standby_frame(self.error_message or "CAMERA OFFLINE")
                    with self.lock:
                        self.current_raw_frame = standby
                        self.current_annotated_frame = standby
                    time.sleep(1.0)
                    continue

            # Read frame from camera
            success, frame = self.cap.read()
            if not success or frame is None:
                self.camera_connected = False
                self.error_message = "Camera stream disconnected or frame dropped."
                time.sleep(0.5)
                continue

            fps_counter += 1
            now = time.time()
            if now - fps_timer >= 1.0:
                self.fps = round(fps_counter / (now - fps_timer), 1)
                fps_counter = 0
                fps_timer = now

            self.frame_count += 1
            
            # Decide whether to execute AI inference on this frame
            do_inference = (self.frame_count % settings.INFERENCE_INTERVAL == 0)
            
            if do_inference:
                detections, inf_time = self.detector.detect(frame)
                detections = zone_service.assign_zones(detections)
                zone_metrics = zone_service.evaluate_zones(detections)
                risk_eval = risk_engine.evaluate(len(detections), zone_metrics)
                recs = recommendation_service.generate_recommendations(risk_eval, zone_metrics)

                with self.lock:
                    self.latest_detections = detections
                    self.latest_person_count = len(detections)
                    self.latest_zone_metrics = zone_metrics
                    self.latest_risk_assessment = risk_eval
                    self.latest_recommendations = recs
                    self.inference_time_ms = inf_time

            with self.lock:
                detections = list(self.latest_detections)
                inf_time = self.inference_time_ms

            # Render tactical HUD
            annotated = self._draw_hud(frame, detections, inf_time)

            with self.lock:
                self.current_raw_frame = frame
                self.current_annotated_frame = annotated

            # Yield slightly to avoid burning 100% CPU thread
            time.sleep(0.01)

        # Cleanup
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

    def process_browser_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes a single video frame sent from the user's browser webcam.
        Executes YOLOv8n detection, evaluates spatial zones, updates crowd risk,
        and refreshes the real-time telemetry cache.
        """
        now = time.time()
        with self.lock:
            # Measure actual processing/upload FPS
            if self._last_browser_frame_time > 0:
                dt = now - self._last_browser_frame_time
                if dt > 0:
                    current_fps = round(1.0 / dt, 1)
                    self.fps = round(0.7 * self.fps + 0.3 * current_fps, 1) if self.fps > 0 else current_fps
            self._last_browser_frame_time = now
            self.last_frame_time = now
            self.camera_connected = True
            self.is_running = True
            self.camera_source = "INTERNAL WEBCAM"
            self.frame_count += 1

        # Run YOLOv8 person detection pipeline
        detections, inf_time = self.detector.detect(frame)
        detections = zone_service.assign_zones(detections)
        zone_metrics = zone_service.evaluate_zones(detections)
        risk_eval = risk_engine.evaluate(len(detections), zone_metrics)
        recs = recommendation_service.generate_recommendations(risk_eval, zone_metrics)

        # Draw defense HUD on frame
        annotated = self._draw_hud(frame, detections, inf_time)

        with self.lock:
            self.has_processed_frame = True
            self.latest_detections = detections
            self.latest_person_count = len(detections)
            self.latest_zone_metrics = zone_metrics
            self.latest_risk_assessment = risk_eval
            self.latest_recommendations = recs
            self.inference_time_ms = inf_time
            self.current_raw_frame = frame
            self.current_annotated_frame = annotated

        avg_conf = 0.0
        if detections:
            avg_conf = round(sum(d["confidence"] for d in detections) / len(detections), 3)

        return {
            "timestamp": now,
            "has_processed_frame": True,
            "camera_connected": True,
            "person_count": len(detections),
            "confidence_avg": avg_conf,
            "inference_time_ms": inf_time,
            "fps": self.fps,
            "detections": detections,
            "zones": zone_metrics,
            "risk": risk_eval,
            "recommendations": recs
        }

    def get_annotated_frame_jpeg(self) -> bytes:
        with self.lock:
            frame = self.current_annotated_frame
        
        if frame is None:
            frame = self._create_standby_frame("OPTICAL SENSOR STANDBY - INITIALIZE FROM BROWSER")

        ret, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return buffer.tobytes() if ret else b""

    def get_latest_stats(self) -> Dict[str, Any]:
        with self.lock:
            # If internal webcam stream stopped receiving frames for > 8s, mark disconnected
            if self.camera_connected and (time.time() - self.last_frame_time > 8.0):
                self.camera_connected = False

            return {
                "has_processed_frame": self.has_processed_frame,
                "camera_connected": self.camera_connected,
                "camera_source": self.camera_source,
                "fps": self.fps if self.camera_connected else 0.0,
                "person_count": self.latest_person_count if self.has_processed_frame else None,
                "inference_time_ms": self.inference_time_ms if self.has_processed_frame else 0.0,
                "detections": self.latest_detections if self.has_processed_frame else [],
                "zones": self.latest_zone_metrics if self.has_processed_frame else [],
                "risk": self.latest_risk_assessment if self.has_processed_frame else None,
                "recommendations": self.latest_recommendations if self.has_processed_frame else [],
                "error_message": self.error_message
            }

camera_service = CameraService()

