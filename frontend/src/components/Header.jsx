import React, { useState, useEffect } from 'react';
import { Shield, Camera, Wifi, WifiOff, RefreshCw, Clock, Menu, X, LayoutDashboard } from 'lucide-react';

/**
 * Header Component
 * Navigation links:
 * - About Us (#about)
 * - Why It Matters (#why-it-matters)
 * - Zone Analysis (#zone-analysis)
 * - Risk Analysis (#risk-analysis)
 * - Contact (#contact)
 * - Customer Care (#customer-care)
 * Top-Right area: SAFACT logo and brand, clickable to return to homepage (#hero / root).
 */
export default function Header({
  systemStatus,
  onRefresh,
  isRefreshing,
  activeView,
  setActiveView,
}) {
  const [timeStr, setTimeStr] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const isOnline = systemStatus?.system_online ?? false;
  const isCamOnline = systemStatus?.camera_connected ?? false;

  const navLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Why It Matters', href: '#why-it-matters' },
    { label: 'Zone Analysis', href: '#zone-analysis' },
    { label: 'Risk Analysis', href: '#risk-analysis' },
    { label: 'Contact', href: '#contact' },
    { label: 'Customer Care', href: '#customer-care' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    // If user is currently in a tactical tab (like alerts or settings), switch to overview first
    if (activeView !== 'overview' && activeView !== 'dashboard') {
      setActiveView('overview');
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Area: Clean Navigation Links + Mobile Menu Button */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Navigation Links cleanly arranged */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors tracking-wide py-1 border-b-2 border-transparent hover:border-cyan-400/60"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Center / Utility: Quick Status & View Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Operator Console Toggle */}
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'console' ? 'overview' : 'console')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeView === 'console'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-300" />
              <span>{activeView === 'console' ? 'Website View' : 'Operator Console'}</span>
            </button>

            {/* Camera Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-semibold ${
                isCamOnline
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>{isCamOnline ? 'CAM ACTIVE' : 'CAM OFFLINE'}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800 disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
              />
            </button>
          </div>

          {/* Top-Right Area: SAFACT Logo and Brand (Clickable to return to homepage) */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="flex items-center gap-3 group text-right cursor-pointer"
            title="Return to SAFACT Homepage"
          >
            <div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  SAFE ACT
                </span>
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  SAFACT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 m-0 font-mono tracking-tight hidden sm:block">
                Crowd Safety & Zone Intelligence
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </a>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-slate-200 hover:text-cyan-400 py-2 px-3 rounded-lg hover:bg-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView(activeView === 'console' ? 'overview' : 'console');
              }}
              className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{activeView === 'console' ? 'Switch to Landing Page' : 'Switch to Operator Console'}</span>
            </button>
            <div className="text-[10px] font-mono text-slate-500">{timeStr} LOCAL</div>
          </div>
        </div>
      )}
    </header>
  );
}
