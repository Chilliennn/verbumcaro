import { useState } from "react";

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HubModal({ isOpen, onClose }: HubModalProps) {
  const [activeTab, setActiveTab] = useState<"api" | "about">("api");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("verbumcaro.ai_key") ?? "");

  if (!isOpen) return null;

  function handleSaveKey() {
    localStorage.setItem("verbumcaro.ai_key", apiKey.trim());
    localStorage.setItem("verbumcaro.ai_provider", provider);
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
              <h3 className="section-title">Why VerbumCaro?</h3>
              <p className="tab-desc">
                VerbumCaro is an ad-free, high-performance parallel reader designed to unite Catholic Latin Vulgate, Chinese Sigao (思高), and Catholic Public Domain translations side-by-side.
              </p>

              <div className="sponsor-box">
                <strong className="sponsor-title">Domain &amp; Hosting Sponsorship</strong>
                <p>
                  We are seeking sponsors to support custom domain renewals and fast CDN distribution. Every sponsor will be permanently honored on the public Contributor Honor Roll.
                </p>
              </div>

              <h3 className="section-title">Feedback &amp; Socials</h3>
              <div className="social-links">
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub Discussions
                </a>
                <span>•</span>
                <a href="mailto:support@verbumcaro.org">Email Feedback</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
