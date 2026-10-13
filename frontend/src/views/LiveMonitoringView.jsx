import React, { useState, useEffect } from 'react';
import { Video, Camera, Play, Square, RefreshCw, Crosshair, Download, Cpu, Layers } from 'lucide-react';
import { api, BASE_URL } from '../services/api';

export default function LiveMonitoringView({ systemStatus, onRefresh }) {
  const [liveDetections, setLiveDetections] = useState([]);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isCameraActive, setIsCameraActive] = useState(true);

  // Poll live detection stats every 1 second
  useEffect(() => {
    let isMounted = true;
    const fetchDetections = async () => {
      try {
        const data = await api.getLiveDetections();
        if (isMounted) {
          setLiveDetections(data.detections || []);
        }
      } catch (e) {
        // Handled silently
      }
    };

    fetchDetections();
    const interval = setInterval(fetchDetections, 1200);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStart = async () => {
    await api.startCamera();
    setIsCameraActive(true);
    setStreamKey(Date.now());
    if (onRefresh) onRefresh();
  };

  const handleStop = async () => {
    await api.stopCamera();
    setIsCameraActive(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Tactical Optical Stream Inspector
            </h2>
            <p className="text-xs text-slate-400 m-0">
              High-resolution frame ingestion with active bounding box rendering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={handleStop}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-rose-300" />
              Pause Stream
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              Start Stream
            </button>
          )}

          <a
            href={`${BASE_URL}/api/camera/frame`}
            download="safact_capture.jpg"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Snapshot
          </a>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center">
            {isCameraActive ? (
              <img
                key={streamKey}
                src={`${BASE_URL}/stream/video?t=${streamKey}`}
                alt="Optical Video Feed"
                className="w-full h-full object-contain"
              />
            ) : (

              <div className="text-center p-8 text-slate-500">
                <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Stream Paused. Click Start Stream to resume.</p>
              </div>
            )}

            <div className="absolute top-3 right-3 bg-slate-950/80 px-2.5 py-1 rounded text-[11px] font-mono text-cyan-400 border border-slate-800">
              YOLOv8 TARGETS: {liveDetections.length}
            </div>
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex justify-between font-mono">
            <span>CH: CAM-01 [WEBCAM]</span>
            <span>STATUS: ACTIVE STREAM</span>
            <span>RES: 640×480</span>
          </div>
        </div>

        {/* Live Detected Bounding Boxes Telemetry */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                Target Coordinates
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300">
                {liveDetections.length} TRACKED
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {liveDetections.length > 0 ? (
                liveDetections.map((det, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1 font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold"># {idx + 1} PERSON</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {det.zone_id || 'ZONE_A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Conf: {(det.confidence * 100).toFixed(1)}%</span>
                      <span>Center: ({det.centroid_x}, {det.centroid_y})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Box: [{det.x1}, {det.y1}] to [{det.x2}, {det.y2}]
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  No pedestrians in view. Stand in front of camera to see live detections!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Optical Sensor calibrated to 24 FPS with COCO Class 0 (Person).
          </div>
        </div>
      </div>
    </div>
  );
}
