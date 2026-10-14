import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { api } from '../services/api';

/**
 * Bottom-Left AI Chat Assistant: SaFact Assistant
 * Grounded in real-time camera scan telemetry, zone densities, and space-per-person metrics.
 */
export default function AssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm the SaFact Assistant. I can explain your latest crowd scan, compare zones, and help you understand where crowd density appears lower.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'Where is the crowd most concentrated?',
    'Which zone has fewer people?',
    'Why is Zone A marked red?',
    'How much space is estimated per person?',
    'What does high density mean?',
    'Should I move left or right?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.askAssistant(query, historyPayload);
      const assistantReply =
        res?.reply ||
        "I'm currently unable to retrieve the latest crowd analysis. Please refer to on-site crowd management staff.";

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReply,
          source: res?.source || 'telemetry-engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I could not reach the analysis backend. Please check connection and follow on-site staff instructions.",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm the SaFact Assistant. I can explain your latest crowd scan, compare zones, and help you understand where crowd density appears lower.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans">
      {/* Floating Trigger Button (Bottom Left) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 border border-cyan-500/50 text-white shadow-2xl hover:bg-slate-800 hover:border-cyan-400 transition-all hover:scale-105 group"
          title="Open SaFact AI Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block text-white group-hover:text-cyan-300">
              SaFact Assistant
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Scan Telemetry Ready
            </span>
          </div>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[82vh] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white m-0 flex items-center gap-1.5">
                  SaFact Assistant
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                    AI-CORE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 m-0">
                  Grounded Crowd Safety Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-900/50">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-xl p-3 leading-relaxed ${
                      isAssistant
                        ? m.isError
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                          : 'bg-slate-950/80 text-slate-200 border border-slate-800/80'
                        : 'bg-blue-600 text-white font-medium shadow-md'
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{m.content}</p>
                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-between ${
                        isAssistant ? 'text-slate-500' : 'text-blue-200'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {m.source && (
                        <span className="font-mono text-[8px] uppercase tracking-wider">
                          [{m.source}]
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-md bg-blue-700 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 w-fit">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Consulting scan telemetry & spatial rules...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Chips */}
          <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto">
            <div className="flex items-center gap-1.5 w-max">
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                Ask:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about crowd density, zones, or movement..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors flex items-center justify-center shadow-md shadow-blue-600/30"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Safety Advisory Disclaimer */}
          <div className="px-3 py-1 bg-slate-950 text-[9px] text-slate-500 text-center border-t border-slate-900 flex items-center justify-center gap-1">
            <Shield className="w-2.5 h-2.5 text-slate-400" />
            <span>Advisory only. Always follow physical signage & venue safety marshals.</span>
          </div>
        </div>
      )}
    </div>
  );
}
