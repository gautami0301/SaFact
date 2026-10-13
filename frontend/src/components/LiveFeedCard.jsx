import React, { useState } from 'react';
import { Camera, Play, Square, Maximize2, RefreshCw, AlertCircle, Eye, Settings } from 'lucide-react';
import { api } from '../services/api';

export default function LiveFeedCard({ cameraStatus, onCameraStatusChange }) {
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const isConnected = cameraStatus?.connected ?? false;
  const isRunning = cameraStatus?.is_running ?? true;
  const currentSource = cameraStatus?.source ?? '0';

  const handleStart = async () => {
    setIsActionLoading(true);
    try {
      await api.startCamera();
      setImgError(false);
      setStreamKey(Date.now());
      if (onCameraStatusChange) onCameraStatusChange();
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStop = async () => {
    setIsActionLoading(true);
    try {
      await api.stopCamera();
      if (onCameraStatusChange) onCameraStatusChange();
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRetry = () => {
    setImgError(false);
    setStreamKey(Date.now());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
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
                SRC: {currentSource === '0' ? 'INTERNAL WEBCAM' : currentSource}
              </span>
            </h3>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleStop}
              disabled={isActionLoading}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-rose-300" />
              Stop Feed
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isActionLoading}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              Start Feed
            </button>
          )}

          <button
            onClick={handleRetry}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reload Video Stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden">
        {isRunning && !imgError ? (
          <img
            key={streamKey}
            src={`/stream/video?t=${streamKey}`}
            alt="Real-time SaFact Optical Stream"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 m-0">
                {!isRunning ? 'Camera Feed Paused' : 'Camera Stream Unavailable'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {!isRunning
                  ? 'Click "Start Feed" above to resume real-time CCTV capture.'
                  : 'Unable to connect to laptop webcam. Ensure permissions are granted or reconnect camera.'}
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Initialize Camera Stream
            </button>
          </div>
        )}

        {/* Tactical HUD Corner Elements */}
        {isRunning && !imgError && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE SENSOR</span>
            </div>

            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-400">
              CHANNEL: CAM-01 [NORTH_GATE] • RESOLUTION: 640×480
            </div>
          </>
        )}
      </div>

      {/* Video Footer Telemetry */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4 font-mono">
          <span>FPS: <strong className="text-slate-200">{cameraStatus?.fps || 0}</strong></span>
          <span>LATENCY: <strong className="text-cyan-400">LOW (&lt;50ms)</strong></span>
        </div>
        <div className="text-[11px] text-slate-400">
          Target Mode: Automated Crowd Bounding Box & Centroid Tracking
        </div>
      </div>
    </div>
  );
}
