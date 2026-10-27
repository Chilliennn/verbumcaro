import { useState } from "react";

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HubModal({ isOpen, onClose }: HubModalProps) {
  const [activeTab, setActiveTab] = useState<"api" | "about">("api");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("verbumnobis.ai_key") ?? "");

  if (!isOpen) return null;

  function handleSaveKey() {
    localStorage.setItem("verbumnobis.ai_key", apiKey.trim());
    localStorage.setItem("verbumnobis.ai_provider", provider);
    alert("AI settings saved locally in your browser.");
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Preferences &amp; Community</h2>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "api" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("api")}
          >
            Chatbot API
          </button>
          <button
            className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("about")}
          >
            About &amp; Sponsors
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "api" ? (
            <div className="tab-pane">
              <p className="tab-desc">
                Provide your API key to activate exegesis and parallel theological study. Keys are stored locally on your device.
              </p>

              <div className="input-group">
                <label>MODEL PROVIDER</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                  <option value="gemini">Google Gemini (Gemini 1.5 Pro)</option>
                </select>
              </div>

              <div className="input-group">
                <label>API KEY</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>

              <button className="save-btn" type="button" onClick={handleSaveKey}>
                Save API Key
              </button>
            </div>
          ) : (
            <div className="tab-pane">
              <h3 className="section-title">Why verbumnobis?</h3>
              <p className="tab-desc">
                verbumnobis was born out of a desire for an accessible, flexible Catholic Scripture study tool. While platforms like BibleGateway offer powerful syntax searching, their Chinese selections are exclusively Protestant versions that differ in biblical book canons and character names. Reading Catholic translations meant juggling disjointed websites one language at a time.
              </p>
              <p className="tab-desc">
                verbumnobis provides an agile, side-by-side reading experience for catechists, RCIA teachers, and anyone seeking deeper scripture comprehension. Comparing passages across translations like the Latin Vulgate alongside modern translations unlocks nuances and theological richness that a single language cannot convey alone. It is also designed for language learners exploring Scripture in Japanese or Latin, with future plans for on-device AI research and interactive pronunciation and glossing tools.
              </p>

              <div className="tech-stack-card">
                <div>
                  <strong>Tech Stack:</strong> React 19, TypeScript, Vite 7, Vitest
                </div>
                <div>
                  <strong>Architecture:</strong> Static JSON Bible data, IndexedDB persistence, two-panel parallel reader with URL-synced state, responsive CSS (no UI framework).
                </div>
              </div>

              <div className="sponsor-box">
                <strong className="sponsor-title">Domain &amp; Hosting Sponsorship</strong>
                <p>
                  We are seeking sponsors to support custom domain renewals and fast CDN distribution. Every sponsor will be permanently honored on the public Contributor Honor Roll.
                </p>
              </div>

              <h3 className="section-title">Feedback &amp; Socials</h3>
              <div className="social-links">
                {/* Instagram */}
                <a
                  href="https://instagram.com/chilliennn_/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Gmail */}
                <a
                  href="mailto:chillien0815@gmail.com"
                  onClick={(e) => {
                    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                      e.preventDefault();
                      window.open(
                        "https://mail.google.com/mail/?view=cm&fs=1&to=chillien0815@gmail.com",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                  className="social-icon-btn"
                  title="Gmail"
                  aria-label="Gmail"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/@chilliennn"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
