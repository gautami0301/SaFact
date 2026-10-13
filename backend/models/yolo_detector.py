"""
SaFact YOLO Person Detector
Uses Ultralytics YOLOv8 for deep-learning person detection with OpenCV HOG backup.
"""

import time
import os
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from app.config import settings

class YOLOPersonDetector:
    def __init__(self, model_path: str = None, confidence_threshold: float = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.conf_threshold = confidence_threshold or settings.CONFIDENCE_THRESHOLD
        self.model = None
        self.model_loaded = False
        self.model_name = "None"
        self.last_error = None
        self.hog_fallback = None

        self._load_model()

    def _load_model(self):
        # Attempt YOLOv8 deep learning model loading
        try:
            from ultralytics import YOLO
            if os.path.exists(self.model_path) or "yolov8n.pt" in self.model_path:
                print(f"[SaFact AI] Loading YOLOv8 model from: {self.model_path}")
                self.model = YOLO(self.model_path)
                self.model_loaded = True
                self.model_name = "YOLOv8n (Deep Learning)"
                print("[SaFact AI] YOLOv8n initialized successfully.")
                return
        except Exception as e:
            self.last_error = f"YOLOv8 init error: {str(e)}"
            print(f"[SaFact AI Warning] {self.last_error}")

        # Fallback: OpenCV HOG People Detector
        try:
            print("[SaFact AI] Initializing OpenCV HOG descriptor fallback...")
            self.hog_fallback = cv2.HOGDescriptor()
            self.hog_fallback.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            self.model_loaded = True
            self.model_name = "OpenCV HOG (CPU Fallback)"
            print("[SaFact AI] OpenCV HOG fallback ready.")
        except Exception as e:
            self.last_error = f"All detectors failed: {str(e)}"
            self.model_loaded = False
            self.model_name = "Unloaded"

    def detect(self, frame: np.ndarray) -> Tuple[List[Dict[str, Any]], float]:
        """
        Executes person detection on a single frame.
        Returns:
            detections: List of dicts with bounding boxes, confidences, centroids.
            inference_time_ms: Duration of inference in milliseconds.
        """
        if frame is None or not self.model_loaded:
            return [], 0.0

        h, w = frame.shape[:2]
        detections = []
        start_time = time.time()

        # Primary: YOLOv8
        if self.model is not None:
            try:
                # Run inference with person filter (classes=[0])
                results = self.model.predict(
                    source=frame,
                    classes=[settings.PERSON_CLASS_ID],
                    conf=self.conf_threshold,
                    verbose=False,
                    imgsz=640
                )
                
                if results and len(results) > 0:
                    boxes = results[0].boxes
                    for box in boxes:
                        coords = box.xyxy[0].cpu().numpy()
                        conf = float(box.conf[0].cpu().numpy())
                        cls_id = int(box.cls[0].cpu().numpy())

                        x1, y1, x2, y2 = float(coords[0]), float(coords[1]), float(coords[2]), float(coords[3])
                        bw = x2 - x1
                        bh = y2 - y1
                        cx = x1 + bw / 2.0
                        cy = y1 + bh / 2.0

                        detections.append({
                            "x1": round(x1, 1),
                            "y1": round(y1, 1),
                            "x2": round(x2, 1),
                            "y2": round(y2, 1),
                            "width": round(bw, 1),
                            "height": round(bh, 1),
                            "confidence": round(conf, 3),
                            "class_id": cls_id,
                            "class_name": "person",
                            "centroid_x": round(cx, 1),
                            "centroid_y": round(cy, 1),
                            "normalized_cx": round(cx / w, 4),
                            "normalized_cy": round(cy / h, 4)
                        })

                inference_time_ms = (time.time() - start_time) * 1000.0
                return detections, round(inference_time_ms, 1)
            except Exception as e:
                print(f"[SaFact AI] Inference error in YOLO: {e}")

        # Secondary: OpenCV HOG fallback
        if self.hog_fallback is not None:
            try:
                rects, weights = self.hog_fallback.detectMultiScale(
                    frame, winStride=(8, 8), padding=(4, 4), scale=1.05
                )
                for i, (rx, ry, rw, rh) in enumerate(rects):
                    conf = float(weights[i]) if i < len(weights) else 0.5
                    cx = rx + rw / 2.0
                    cy = ry + rh / 2.0
                    detections.append({
                        "x1": float(rx),
                        "y1": float(ry),
                        "x2": float(rx + rw),
                        "y2": float(ry + rh),
                        "width": float(rw),
                        "height": float(rh),
                        "confidence": round(min(max(conf, 0.4), 0.95), 3),
                        "class_id": 0,
                        "class_name": "person",
                        "centroid_x": round(cx, 1),
                        "centroid_y": round(cy, 1),
                        "normalized_cx": round(cx / w, 4),
                        "normalized_cy": round(cy / h, 4)
                    })
                inference_time_ms = (time.time() - start_time) * 1000.0
                return detections, round(inference_time_ms, 1)
            except Exception as e:
                print(f"[SaFact AI] Fallback detector error: {e}")

        return [], 0.0
