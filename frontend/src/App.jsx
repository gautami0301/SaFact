import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import ScanningSection from './components/ScanningSection';
import AboutUsSection from './components/AboutUsSection';
import WhyItMattersSection from './components/WhyItMattersSection';
import FourZoneSection from './components/FourZoneSection';
import RiskAnalysisSection from './components/RiskAnalysisSection';
import ContactAndCareSection from './components/ContactAndCareSection';
import AssistantChatbot from './components/AssistantChatbot';

import DashboardView from './views/DashboardView';
import LiveMonitoringView from './views/LiveMonitoringView';
import ZoneAnalysisView from './views/ZoneAnalysisView';
import RiskAnalysisView from './views/RiskAnalysisView';
import RecommendationsView from './views/RecommendationsView';
import AlertsView from './views/AlertsView';
import SettingsView from './views/SettingsView';
import { api } from './services/api';
import { Shield, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'console' | tactical view tabs
  const [tacticalTab, setTacticalTab] = useState('dashboard');
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

  const handleScrollToScan = () => {
    if (activeView !== 'overview') {
      setActiveView('overview');
    }
    setTimeout(() => {
      const scanEl = document.getElementById('scan-area');
      if (scanEl) {
        scanEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const activeAlertsCount = dashboardData?.active_alerts_count ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 scroll-smooth">
      {/* Top Header with Clean Nav Links and Top-Right Brand Logo */}
      <Header
        systemStatus={systemStatus}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main View Router */}
      {activeView === 'overview' ? (
        <main className="flex-1 overflow-x-hidden">
          {/* 1. Hero Section */}
          <HeroSection onScanClick={handleScrollToScan} />

          {/* 2. Real-Time Camera Scanning & Ingestion Section */}
          <ScanningSection
            dashboardData={dashboardData}
            onRefresh={handleManualRefresh}
          />

          {/* 3. About Us Section */}
          <AboutUsSection />

          {/* 4. Why Crowd Analysis Matters Section */}
          <WhyItMattersSection />

          {/* 5. Four-Zone Spatial Crowd Analysis & 3D Map */}
          <FourZoneSection dashboardData={dashboardData} />

          {/* 6. Risk Analysis Dashboard & Evidence Directives */}
          <RiskAnalysisSection dashboardData={dashboardData} />

          {/* 7. Contact, Customer Care FAQs & Privacy Transparency */}
          <ContactAndCareSection />

          {/* Global Website Footer */}
          <footer className="bg-slate-950 border-t border-slate-900 py-12 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white tracking-wide">SAFACT</span>
                  <span className="mx-2">•</span>
                  <span>Smart AI for Crowd Flow and Spatial Safety</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <a href="#about" className="hover:text-slate-300 transition-colors">About</a>
                <a href="#why-it-matters" className="hover:text-slate-300 transition-colors">Science</a>
                <a href="#zone-analysis" className="hover:text-slate-300 transition-colors">Zones</a>
                <a href="#risk-analysis" className="hover:text-slate-300 transition-colors">Risk</a>
                <a href="#contact" className="hover:text-slate-300 transition-colors">Contact</a>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Return to top"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-slate-900/60 text-center text-[11px] text-slate-600">
              © {new Date().getFullYear()} SAFACT. Academic engineering demonstration. All rights reserved.
            </div>
          </footer>
        </main>
      ) : (
        /* Tactical Operator Console View (Preserving existing dashboard & sub-views) */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <Sidebar
            activeView={tacticalTab}
            setActiveView={setTacticalTab}
            activeAlertsCount={activeAlertsCount}
            systemStatus={systemStatus}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
            <div className="max-w-7xl mx-auto">
              {tacticalTab === 'dashboard' && (
                <DashboardView
                  dashboardData={dashboardData}
                  onRefresh={handleManualRefresh}
                />
              )}
              {tacticalTab === 'live-monitoring' && (
                <LiveMonitoringView
                  systemStatus={systemStatus}
                  onRefresh={handleManualRefresh}
                />
              )}
              {tacticalTab === 'zones' && (
                <ZoneAnalysisView zones={dashboardData?.zones} />
              )}
              {tacticalTab === 'risk' && (
                <RiskAnalysisView currentRisk={dashboardData?.risk} />
              )}
              {tacticalTab === 'recommendations' && (
                <RecommendationsView
                  recommendations={dashboardData?.recommendations}
                  riskLevel={dashboardData?.risk?.risk_level}
                />
              )}
              {tacticalTab === 'alerts' && <AlertsView />}
              {tacticalTab === 'settings' && (
                <SettingsView
                  systemStatus={systemStatus}
                  onRefresh={handleManualRefresh}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Floating Bottom-Left SaFact AI Assistant */}
      <AssistantChatbot />
    </div>
  );
}
