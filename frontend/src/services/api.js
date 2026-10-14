/**
 * SaFact API Service Client
 * Robust asynchronous communication layer with error resilience.
 */

const envBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
export const BASE_URL = (
  envBaseUrl !== undefined && envBaseUrl !== ''
    ? envBaseUrl
    : (import.meta.env.PROD ? 'https://safact.onrender.com' : '')
).replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    clearTimeout(timeoutId);


    if (!res.ok) {
      throw new Error(`HTTP error ${res.status} on ${endpoint}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[SaFact API] Request timed out on ${endpoint}`);
    } else {
      console.warn(`[SaFact API] Error requesting ${endpoint}:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // Aggregated Dashboard Call
  getDashboard: () => request('/api/detections/dashboard'),

  // System & Health
  getSystemStatus: () => request('/api/system/status'),
  getHealth: () => request('/api/system/health'),

  // Camera Operations & Frame Ingestion
  processFrame: (base64Image) =>
    request('/api/camera/process-frame', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
      timeout: 8000,
    }),
  getCameraStatus: () => request('/api/camera/status'),
  startCamera: () => request('/api/camera/start', { method: 'POST' }),
  stopCamera: () => request('/api/camera/stop', { method: 'POST' }),
  setCameraSource: (source) =>
    request('/api/camera/source', {
      method: 'POST',
      body: JSON.stringify({ source }),
    }),


  // Detections & Spatial Zones
  getLiveDetections: () => request('/api/detections/live'),
  getZones: () => request('/api/zones'),

  // Risk Assessment
  getCurrentRisk: () => request('/api/risk/current'),
  getRiskHistory: (limit = 30) => request(`/api/risk/history?limit=${limit}`),
  simulateRisk: (simulated_count, zone_id = 'ZONE_A') =>
    request('/api/risk/simulate', {
      method: 'POST',
      body: JSON.stringify({ simulated_count, zone_id }),
    }),

  // Recommendations
  getRecommendations: () => request('/api/recommendations'),

  // Alerts & Incident Management
  getAlerts: (severity, status) => {
    const params = new URLSearchParams();
    if (severity && severity !== 'ALL') params.append('severity', severity);
    if (status && status !== 'ALL') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/alerts${qs}`);
  },
  acknowledgeAlert: (alertId) =>
    request(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  resolveAlert: (alertId) =>
    request(`/api/alerts/${alertId}/resolve`, { method: 'POST' }),
  createAlert: (alert) =>
    request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    }),

  // AI Assistant Integration
  askAssistant: (message, history = []) =>
    request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  // Contact & Customer Care
  submitContact: (data) =>
    request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

