import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import LiveMonitoringView from './views/LiveMonitoringView';
import ZoneAnalysisView from './views/ZoneAnalysisView';
import RiskAnalysisView from './views/RiskAnalysisView';
import RecommendationsView from './views/RecommendationsView';
import AlertsView from './views/AlertsView';
import SettingsView from './views/SettingsView';
import { api } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [dash, sys] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getSystemStatus().catch(() => null),
      ]);

      if (dash) setDashboardData(dash);
      if (sys) setSystemStatus(sys);
      setErrorCount(0);
    } catch (err) {
      setErrorCount((prev) => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Fast 1.5s real-time polling
    const timer = setInterval(loadData, 1500);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const activeAlertsCount = dashboardData?.active_alerts_count ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        systemStatus={systemStatus}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Body with Sidebar + Content Viewport */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          activeAlertsCount={activeAlertsCount}
          systemStatus={systemStatus}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && (
              <DashboardView
                dashboardData={dashboardData}
                onRefresh={handleManualRefresh}
              />
            )}
            {activeView === 'live-monitoring' && (
              <LiveMonitoringView
                systemStatus={systemStatus}
                onRefresh={handleManualRefresh}
              />
            )}
            {activeView === 'zones' && (
              <ZoneAnalysisView zones={dashboardData?.zones} />
            )}
            {activeView === 'risk' && (
              <RiskAnalysisView currentRisk={dashboardData?.risk} />
            )}
            {activeView === 'recommendations' && (
              <RecommendationsView
                recommendations={dashboardData?.recommendations}
                riskLevel={dashboardData?.risk?.risk_level}
              />
            )}
            {activeView === 'alerts' && <AlertsView />}
            {activeView === 'settings' && (
              <SettingsView
                systemStatus={systemStatus}
                onRefresh={handleManualRefresh}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
