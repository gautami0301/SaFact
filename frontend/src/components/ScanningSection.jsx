import React from 'react';
import { Camera, Eye, Upload, ShieldCheck, Activity, Clock } from 'lucide-react';
import LiveFeedCard from './LiveFeedCard';
import MetricsRow from './MetricsRow';

/**
 * ScanningSection (#scan-area)
 * Features:
 * - Live Optical Stream & Image Upload (LiveFeedCard)
 * - Real-time metrics row (Headcount, density, composite risk, capacity load)
 * - Start/Stop controls, browser camera permissions, bounding boxes
 * - Scan timestamp & telemetry status
 */
export default function ScanningSection({ dashboardData, onRefresh }) {
  const cameraStatus = {
    connected: dashboardData?.camera_connected,
    is_running: true,
    source: dashboardData?.camera_source,
    fps: dashboardData?.fps,
  };

  const timestamp = dashboardData?.timestamp
    ? new Date(dashboardData.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Awaiting scan';

  return (
    <section id="scan-area" className="py-16 md:py-24 bg-slate-950 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-xs font-mono font-semibold text-cyan-400 mb-3">
              REAL-TIME COMPUTER VISION INGESTION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Optical Scanning & Person Detection
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Activate your internal webcam or upload a crowd photograph. The monocular YOLOv8
              pipeline identifies human centroids in real-time, calculating four-zone spatial distribution.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>SCAN TIME: {timestamp}</span>
          </div>
        </div>

        {/* Real-Time Metrics Row */}
        <MetricsRow dashboardData={dashboardData} />

        {/* Live Camera & Image Upload Ingestion Feed Card */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 sm:p-6 shadow-2xl">
          <LiveFeedCard
            cameraStatus={cameraStatus}
            onCameraStatusChange={onRefresh}
          />
        </div>

        {/* Technical Safety Footnote */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Monocular YOLOv8n architecture: detects pedestrian silhouettes only. No identity retention.</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target FPS: 10–25 • RAM Inference: 12ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
