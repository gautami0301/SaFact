import React from 'react';
import MetricsRow from '../components/MetricsRow';
import LiveFeedCard from '../components/LiveFeedCard';
import RecommendationsCard from '../components/RecommendationsCard';
import ZoneCards from '../components/ZoneCards';
import DensityChart from '../components/DensityChart';
import AlertsTable from '../components/AlertsTable';

export default function DashboardView({ dashboardData, onRefresh }) {
  const cameraStatus = {
    connected: dashboardData?.camera_connected,
    is_running: true,
    source: dashboardData?.camera_source,
    fps: dashboardData?.fps,
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Metrics Row */}
      <MetricsRow dashboardData={dashboardData} />

      {/* 2. Middle Row: Live Optical Feed & Safety Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <LiveFeedCard
            cameraStatus={cameraStatus}
            onCameraStatusChange={onRefresh}
          />
        </div>
        <div className="lg:col-span-5">
          <RecommendationsCard
            recommendations={dashboardData?.recommendations}
            riskLevel={dashboardData?.risk?.risk_level}
          />
        </div>
      </div>

      {/* 3. Concourse Sector Partition Breakdown */}
      <ZoneCards zones={dashboardData?.zones} />

      {/* 4. Bottom Row: Density Timeline Chart & Active Incident Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <DensityChart history={dashboardData?.risk_history} />
        </div>
        <div className="lg:col-span-6">
          <AlertsTable
            incidents={dashboardData?.recent_incidents}
            onUpdate={onRefresh}
          />
        </div>
      </div>
    </div>
  );
}
