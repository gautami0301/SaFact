import React, { useState } from 'react';
import { Mail, HelpCircle, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Shield, Lock, EyeOff } from 'lucide-react';
import { api } from '../services/api';

/**
 * Contact and Customer Care Section
 * Includes:
 * - Validated Contact Form connected to api.submitContact
 * - Genuine contact placeholders clearly marked
 * - Customer Care FAQ Accordion
 * - Privacy by Design Transparency Box
 */
export default function ContactAndCareSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      q: 'How does the scanning and person detection process work?',
      a: 'The browser accesses your local camera via the standard HTML5 getUserMedia API (or processes an uploaded image). Frames are encoded and passed to the backend FastAPI service where an ultralight YOLOv8 model calculates monocular bounding boxes for detected persons, categorizing their centroids into one of four spatial zones.',
    },
    {
      q: 'Why does the browser ask for camera permission, and is it secure?',
      a: 'Modern browsers require explicit user permission to protect your privacy. SaFact processes camera frames solely for spatial person detection within your active session. If camera access is denied, you can use the Image Upload feature to analyze crowd photographs instead.',
    },
    {
      q: 'How are the four zones (A, B, C, D) configured and interpreted?',
      a: 'The monitored plane is divided into four spatial quadrants: Zone A (Red, primary high-density hotspot), Zone B (Yellow, moderate transit), Zone C (Green, lower density egress corridor), and Zone D (Slate grey, outer perimeter count-only sector). Zone D tracks headcount without automated risk scoring.',
    },
    {
      q: 'How are density and space-per-person metrics calculated?',
      a: 'Square feet per person is calculated as: Zone Area (sq ft) ÷ Detected People. People per square foot is: Detected People ÷ Zone Area. Under 5 sq ft/person is flagged as high density, 5–10 as moderate density, and over 10 as lower density.',
    },
    {
      q: 'What should I do if the camera or backend status shows offline?',
      a: 'Ensure the FastAPI backend is running locally at http://localhost:8000. Check that no other application has locked your webcam, and verify that browser permissions are allowed in your site settings.',
    },
    {
      q: 'How is privacy preserved? Are photos or faces stored?',
      a: 'SaFact enforces Privacy-by-Design. The computer-vision pipeline detects generic person bounding boxes only. There is strictly NO facial recognition, biometric profiling, or identity tracking. Video frames are processed in-memory and are never written to disk or third-party servers.',
    },
  ];

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please provide your name.';
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email format (e.g. user@example.com).';
    }
    if (!formData.message.trim() || formData.message.length < 5) {
      errors.message = 'Message must be at least 5 characters long.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await api.submitContact(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-900/40 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-300">
            CONNECT & LEARN
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact & Customer Care
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Have questions about integrating SaFact into your venue, configuring custom zone dimensions,
            or reviewing spatial safety criteria? Reach out or explore our comprehensive care FAQs.
          </p>
        </div>

        {/* Contact Form & Customer Care Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form (Col 6) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 m-0">
                <Mail className="w-5 h-5 text-cyan-400" />
                Get in Touch with SaFact Team
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-0">
                Submit an inquiry or report an issue directly to the engineering team.
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Thank you! Your message has been received by our support dispatch.</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Could not submit message. Please ensure the backend server is reachable.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {formErrors.name && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sarah@stadium-ops.org"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {formErrors.email && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Message or Facility Requirements
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry, venue type, or feedback..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                />
                {formErrors.message && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-400 block mb-0.5">Contact Notice:</strong>
              Project maintained for academic demonstration & crowd research. Direct inquiries sent through this form are logged to the local repository.
            </div>
          </div>

          {/* Customer Care FAQs Accordion (Col 6) */}
          <div id="customer-care" className="lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 m-0">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Customer Care & Operations FAQs
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-0">
                Frequently asked questions covering camera permissions, privacy, and zone logic.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs font-semibold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy by Design Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">
                Privacy Architecture & Data Transparency
              </h3>
              <span className="text-xs text-slate-400">
                Strict Privacy-by-Design standard
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <EyeOff className="w-4 h-4" />
                <span>Zero Facial Recognition</span>
              </div>
              <p className="text-slate-400 m-0 leading-relaxed">
                The computer-vision model detects generic bounding boxes for person bodies only. No facial features, identities, or demographic attributes are extracted.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                <Lock className="w-4 h-4" />
                <span>Ephemeral In-Memory Compute</span>
              </div>
              <p className="text-slate-400 m-0 leading-relaxed">
                Camera frames transmitted to the local FastAPI backend are decoded in RAM, evaluated by the YOLOv8 engine, and immediately discarded. No video is saved to disk.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                <Shield className="w-4 h-4" />
                <span>Local Privacy Isolation</span>
              </div>
              <p className="text-slate-400 m-0 leading-relaxed">
                Execution runs strictly on your local machine. No external cloud computer-vision APIs or third-party tracking services are invoked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
