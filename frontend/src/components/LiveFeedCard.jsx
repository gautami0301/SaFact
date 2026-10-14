import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Play, Square, RefreshCw, AlertCircle, Upload, Image as ImageIcon, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function LiveFeedCard({ cameraStatus, onCameraStatusChange }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'PERMISSION_DENIED' | 'NOT_FOUND' | 'NOT_SUPPORTED' | 'GENERIC'
  const [errorMessage, setErrorMessage] = useState('');
  const [telemetry, setTelemetry] = useState(null);
  const [scanMode, setScanMode] = useState('webcam'); // 'webcam' | 'image'
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [scanTimestamp, setScanTimestamp] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopIntervalRef = useRef(null);
  const isUploadingRef = useRef(false);
  const offscreenCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream & release hardware tracks
  const stopFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            // Silently ignore track stop error
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      setIsStreaming(false);
      setTelemetry(null);
      await api.stopCamera().catch(() => {});
      if (onCameraStatusChange) onCameraStatusChange();
    } finally {
      setIsLoading(false);
    }
  }, [onCameraStatusChange]);

  // Draw YOLO bounding boxes, centroids, and tactical HUD on canvas overlay
  const drawDetections = useCallback((detections, targetEl) => {
    const canvas = canvasRef.current;
    if (!canvas || !targetEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = targetEl.videoWidth || targetEl.naturalWidth || 640;
    const vh = targetEl.videoHeight || targetEl.naturalHeight || 480;

    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detections || detections.length === 0) return;

    detections.forEach((det) => {
      const { x1, y1, x2, y2, confidence, centroid_x, centroid_y, zone_id } = det;
      const width = x2 - x1;
      const height = y2 - y1;

      // Color scheme based on confidence
      const strokeColor = confidence > 0.6 ? '#06b6d4' : '#f59e0b';
      const cornerLen = Math.min(18, Math.max(8, width * 0.2));

      // Bounding box border
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);

      // Tactical corner accents
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x1, y1 + cornerLen);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + cornerLen, y1);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x2 - cornerLen, y1);
      ctx.lineTo(x2, y1);
      ctx.lineTo(x2, y1 + cornerLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x1, y2 - cornerLen);
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1 + cornerLen, y2);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x2 - cornerLen, y2);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y2 - cornerLen);
      ctx.stroke();

      // Centroid point
      if (centroid_x !== undefined && centroid_y !== undefined) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(centroid_x, centroid_y, 3.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Detection badge label
      const confPct = Math.round((confidence || 0) * 100);
      const labelText = `PERSON ${confPct}% [${zone_id || 'SECTOR'}]`;
      ctx.font = 'bold 11px monospace';
      const textMetrics = ctx.measureText(labelText);
      const bgWidth = textMetrics.width + 10;
      const bgHeight = 18;
      const labelY = Math.max(y1 - bgHeight, 0);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(x1, labelY, bgWidth, bgHeight);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, labelY, bgWidth, bgHeight);

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(labelText, x1 + 5, labelY + 13);
    });
  }, []);

  // Frame capture and backend YOLOv8n ingestion loop
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !streamRef.current || isUploadingRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      isUploadingRef.current = true;

      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }
      const offscreen = offscreenCanvasRef.current;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const maxDim = 640;
      const scale = Math.min(1, maxDim / Math.max(vw, vh));
      const targetW = Math.round(vw * scale);
      const targetH = Math.round(vh * scale);

      offscreen.width = targetW;
      offscreen.height = targetH;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(video, 0, 0, targetW, targetH);

      const base64Image = offscreen.toDataURL('image/jpeg', 0.65);

      const res = await api.processFrame(base64Image);

      if (res) {
        const scaleFactorX = vw / targetW;
        const scaleFactorY = vh / targetH;
        const scaledDetections = (res.detections || []).map((d) => ({
          ...d,
          x1: d.x1 * scaleFactorX,
          y1: d.y1 * scaleFactorY,
          x2: d.x2 * scaleFactorX,
          y2: d.x2 * scaleFactorY,
          centroid_x: d.centroid_x * scaleFactorX,
          centroid_y: d.centroid_y * scaleFactorY,
        }));

        const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        setScanTimestamp(`${nowStr} (Live Feed)`);

        setTelemetry({
          person_count: res.person_count,
          inference_time_ms: res.inference_time_ms,
          fps: res.fps || 1.5,
          confidence_avg: res.confidence_avg,
          detections: scaledDetections,
        });

        drawDetections(scaledDetections, video);

        if (onCameraStatusChange) {
          onCameraStatusChange();
        }
      }
    } catch (err) {
      console.warn('[SaFact Camera Feed] Frame processing latency or timeout:', err.message);
    } finally {
      isUploadingRef.current = false;
    }
  }, [drawDetections, onCameraStatusChange]);

  // Request user camera permission and start streaming
  const startFeed = async () => {
    setIsLoading(true);
    setErrorType(null);
    setErrorMessage('');
    setScanMode('webcam');
    setUploadedImageSrc(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorType('NOT_SUPPORTED');
      setErrorMessage(
        'Browser camera access (getUserMedia) is unsupported or restricted in insecure HTTP contexts. Please access via HTTPS or localhost.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.warn('[SaFact Camera] Video play promise rejected:', err);
          });
        };
      }

      setIsStreaming(true);
      await api.startCamera().catch(() => {});

      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = setInterval(processFrame, 650);

      if (onCameraStatusChange) onCameraStatusChange();
    } catch (err) {
      console.error('[SaFact Camera Permission Error]', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('PERMISSION_DENIED');
        setErrorMessage(
          'Webcam permission was denied. Please allow camera permissions in your browser URL bar or settings, then click Initialize Camera Stream.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('NOT_FOUND');
        setErrorMessage('No camera device found on this system. Please connect a webcam or use the "Upload Image" option.');
      } else {
        setErrorType('GENERIC');
        setErrorMessage(err.message || 'Unable to open camera stream. Ensure no other application is using it.');
      }
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload handler for crowd photos
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isStreaming) {
      stopFeed();
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      if (!base64Data) return;

      setUploadedImageSrc(base64Data);
      setScanMode('image');
      setIsLoading(true);

      const img = new window.Image();
      img.onload = async () => {
        try {
          const res = await api.processFrame(base64Data);
          if (res) {
            const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
            setScanTimestamp(`${timeStr} (Image File)`);

            setTelemetry({
              person_count: res.person_count,
              inference_time_ms: res.inference_time_ms,
              fps: 1.0,
              confidence_avg: res.confidence_avg,
              detections: res.detections || [],
            });

            const canvas = canvasRef.current;
            if (canvas) {
              canvas.width = img.naturalWidth || 640;
              canvas.height = img.naturalHeight || 480;
              drawDetections(res.detections || [], { videoWidth: canvas.width, videoHeight: canvas.height });
            }

            if (onCameraStatusChange) onCameraStatusChange();
          }
        } catch (err) {
          console.warn('[SaFact Image Upload]', err);
        } finally {
          setIsLoading(false);
        }
      };
      img.src = base64Data;
    };
    reader.readAsDataURL(file);
  };

  // Clean up media tracks and loop on unmount or tab close
  useEffect(() => {
    const handleUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Video Header Controls */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-cyan-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              Optical Sensor Stream
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                {scanMode === 'image' ? 'SRC: STATIC IMAGE FILE' : 'SRC: INTERNAL WEBCAM'}
              </span>
            </h3>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          {scanMode === 'webcam' && isStreaming ? (
            <button
              onClick={stopFeed}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-rose-300" />
              Stop Feed
            </button>
          ) : (
            <button
              onClick={startFeed}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              Start Camera
            </button>
          )}

          {/* Upload Image Option */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Upload still image or crowd photo"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Upload Image
          </button>

          <button
            onClick={scanMode === 'webcam' && isStreaming ? processFrame : startFeed}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Ingestion Frame"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden">
        {/* Local Webcam Video Player */}
        {scanMode === 'webcam' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${isStreaming ? 'block' : 'hidden'}`}
          />
        )}

        {/* Static Uploaded Image Viewport */}
        {scanMode === 'image' && uploadedImageSrc && (
          <img
            src={uploadedImageSrc}
            alt="Uploaded Crowd Frame"
            className="w-full h-full object-contain"
          />
        )}

        {/* Overlaid Detection Canvas for YOLO Bounding Boxes */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${
            (isStreaming && scanMode === 'webcam') || (scanMode === 'image' && uploadedImageSrc) ? 'block' : 'hidden'
          }`}
        />

        {/* Offline / Standby / Error Card */}
        {!isStreaming && scanMode === 'webcam' && (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 max-w-md">
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                errorType
                  ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {errorType ? <AlertCircle className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-200 m-0">
                {errorType === 'PERMISSION_DENIED'
                  ? 'Camera Permission Denied'
                  : errorType === 'NOT_FOUND'
                  ? 'No Camera Device Detected'
                  : errorType === 'NOT_SUPPORTED'
                  ? 'Camera API Not Supported'
                  : errorType
                  ? 'Webcam Connection Error'
                  : 'CAM OFFLINE / STANDBY'}
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {errorMessage ||
                  'Your laptop webcam is accessed directly inside this browser. Click "Start Camera" below to grant permission, or click "Upload Image" to test with a saved photo.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={startFeed}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Requesting Camera...' : 'Initialize Camera Stream'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload Photo
              </button>
            </div>
          </div>
        )}

        {/* Tactical HUD Corner Elements */}
        {((isStreaming && scanMode === 'webcam') || (scanMode === 'image' && uploadedImageSrc)) && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300">
              <span className={`w-2 h-2 rounded-full ${scanMode === 'image' ? 'bg-cyan-400' : 'bg-red-500 animate-ping'}`} />
              <span>{scanMode === 'image' ? 'IMAGE SCAN ACTIVE' : 'LIVE SENSOR'}</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-400">
              <span>
                YOLOv8n:{' '}
                {telemetry?.person_count !== undefined
                  ? `${telemetry.person_count} DETECTED`
                  : 'SCANNING...'}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-400">
              <span>CHANNEL: CAM-01 • RES: 640×480</span>
              {scanTimestamp && (
                <span className="text-slate-400 border-l border-slate-700 pl-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {scanTimestamp}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Video Footer Telemetry */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4 font-mono">
          <span>
            FPS:{' '}
            <strong className="text-slate-200">
              {isStreaming ? telemetry?.fps || cameraStatus?.fps || 1.5 : scanMode === 'image' ? 1.0 : 0}
            </strong>
          </span>
          <span>
            LATENCY:{' '}
            <strong className="text-cyan-400">
              {telemetry?.inference_time_ms
                ? `${Math.round(telemetry.inference_time_ms)}ms`
                : isStreaming
                ? 'LOW (<80ms)'
                : 'OFFLINE'}
            </strong>
          </span>
          {scanTimestamp && (
            <span className="hidden sm:inline">
              LAST SCAN: <strong className="text-emerald-400">{scanTimestamp}</strong>
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          Target Mode: Monocular Person Centroid Tracking (COCO Class 0)
        </div>
      </div>
    </div>
  );
}
