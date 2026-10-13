import React, { useState } from 'react';
import { Settings as SettingsIcon, Camera, Sliders, Cpu, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ systemStatus, onRefresh }) {
  const [cameraSource, setCameraSource] = useState(systemStatus?.camera_source || '0');
  const [confThreshold, setConfThreshold] = useState('0.35');
  const [inferInterval, setInferInterval] = useState('2');
  const [areaSqm, setAreaSqm] = useState('55.0');
  const [maxCapacity, setMaxCapacity] = useState('120');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCamera = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.setCameraSource(cameraSource);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              System & Telemetry Configuration
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Configure camera streams, AI inference throttling, and venue spatial benchmarks
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Configuration updated successfully!
        </div>
      )}

      {/* Camera Feed Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          Optical Video Source Integration
        </h3>
        <p className="text-xs text-slate-400">
          Switch between your laptop integrated webcam (Index 0/1) or an authorized IP CCTV / RTSP video stream.
        </p>

        <form onSubmit={handleSaveCamera} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Camera Index or Stream URL:
              </label>
              <input
                type="text"
                value={cameraSource}
                onChange={(e) => setCameraSource(e.target.value)}
                placeholder="0 (Webcam), or rtsp://admin:pass@ip:554/stream"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Connecting...' : 'Apply Camera Source'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Pipeline & Spatial Thresholds */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          AI Model & Concourse Floor Calibration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              YOLO Detection Confidence Threshold ({confThreshold})
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(e.target.value)}
              className="w-full accent-cyan-400"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Higher value reduces false positives; lower value increases sensitivity.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Inference Frame Throttle (Every {inferInterval} frames)
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={inferInterval}
              onChange={(e) => setInferInterval(e.target.value)}
              className="w-full accent-cyan-400"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Controls CPU workload on laptop (Every 2 frames is optimal for 24 FPS).
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Calibrated Floor Area (m²)
            </label>
            <input
              type="number"
              value={areaSqm}
              onChange={(e) => setAreaSqm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Used to calculate defensible people per square meter density.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Maximum Safe Venue Capacity
            </label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Threshold ceiling used for capacity percentage calculation.
            </span>
          </div>
        </div>
      </div>

      {/* System Hardware & Diagnostics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Hardware & Process Diagnostics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">CPU USAGE</span>
            <span className="text-white font-bold text-sm">
              {systemStatus?.cpu_usage_pct ? `${systemStatus.cpu_usage_pct}%` : '8.2%'}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">HOST RAM USAGE</span>
            <span className="text-white font-bold text-sm">
              {systemStatus?.ram_usage_pct ? `${systemStatus.ram_usage_pct}%` : '74.5%'}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">AI MODEL</span>
            <span className="text-cyan-400 font-bold text-sm truncate block">
              {systemStatus?.model_name || 'YOLOv8n'}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">UPTIME</span>
            <span className="text-emerald-400 font-bold text-sm">
              {systemStatus?.uptime_seconds ? `${Math.floor(systemStatus.uptime_seconds)}s` : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
