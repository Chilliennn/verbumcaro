import { useState } from "react";
import { AppSelect } from "../ui/Select";

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HubTab = "about" | "acknowledgments" | "takedown" | "sponsorship" | "api";

export function HubModal({ isOpen, onClose }: HubModalProps) {
  const [activeTab, setActiveTab] = useState<HubTab>("about");
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
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-tabs" role="tablist">
          <button
            className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "about"}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button
            className={`tab-btn ${activeTab === "acknowledgments" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "acknowledgments"}
            onClick={() => setActiveTab("acknowledgments")}
          >
            Copyright &amp; Sources
          </button>
          <button
            className={`tab-btn ${activeTab === "takedown" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "takedown"}
            onClick={() => setActiveTab("takedown")}
          >
            Takedown Policy
          </button>
          <button
            className={`tab-btn ${activeTab === "sponsorship" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "sponsorship"}
            onClick={() => setActiveTab("sponsorship")}
          >
            Sponsorship &amp; Mission
          </button>
          <button
            className={`tab-btn ${activeTab === "api" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "api"}
            onClick={() => setActiveTab("api")}
          >
            Chatbot API
          </button>
        </div>

        <div className="modal-body">
          {/* Tab 1: About & Story */}
          {activeTab === "about" && (
            <div className="tab-pane active">
              <h3 className="section-title">Why VerbumNobis?</h3>
              <p className="tab-desc">
                VerbumNobis was born out of a desire for an accessible, flexible Catholic Scripture study tool. While platforms like BibleGateway offer powerful syntax searching, their Chinese selections are exclusively Protestant versions that differ in biblical book canons and character names. Reading Catholic translations meant juggling disjointed websites one language at a time.
              </p>
              <p className="tab-desc">
                VerbumNobis provides an agile, side-by-side reading experience for catechists, RCIA teachers, and anyone seeking deeper scripture comprehension. Comparing passages across translations like the Latin Vulgate alongside modern translations unlocks nuances and theological richness that a single language cannot convey alone. It is also designed for language learners exploring Scripture in Japanese or Latin, with future plans for on-device AI research and interactive pronunciation and glossing tools.
              </p>

              <div className="tech-stack-card">
                <div>
                  <strong>Tech Stack:</strong> React 19, TypeScript, Vite 7, Vitest
                </div>
                <div>
                  <strong>Architecture:</strong> Static JSON Bible data, IndexedDB persistence, two-panel parallel reader with URL-synced state, responsive CSS (no UI framework).
                </div>
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

          {/* Tab 2: Copyright & Attributions */}
          {activeTab === "acknowledgments" && (
            <div className="tab-pane active">
              <div className="card-notice">
                <strong>Intellectual Property &amp; Legal Notice</strong>
                The VerbumNobis application source code is released under the MIT License. The MIT license applies strictly to the software code and does not transfer or license third-party Scripture translations or dictionary databases, which remain the property of their respective copyright holders.
              </div>

              <h3 className="section-title" style={{ marginTop: "16px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em", color: "var(--stone-500)" }}>
                Scripture Translations
              </h3>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>Biblia Sacra Vulgata (Latin)</strong>
                  <span className="legal-badge badge-pd">Public Domain</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  Clementine Vulgate (1592 edition). Historic Latin edition free of copyright worldwide.
                </p>
              </div>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>New Jerusalem Bible (English)</strong>
                  <span className="legal-badge badge-cr">Copyrighted</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  Text © 1985 by Darton, Longman &amp; Todd Ltd and Doubleday, a division of Penguin Random House LLC. Displayed for private comparative study and devotion.
                </p>
              </div>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>新共同訳聖書 (Japanese Shinkyōdōyaku)</strong>
                  <span className="legal-badge badge-cr">Copyrighted</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  日本語訳聖書 © 日本聖書協会 (Japan Bible Society), 1987, 1988. Ecumenical edition displayed for cross-language study.
                </p>
              </div>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>思高圣经 (Studium Biblicum Chinese)</strong>
                  <span className="legal-badge badge-cr">Copyrighted</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  中文译本版权归属于 <strong>香港方济会思高圣经学会</strong> (Studium Biblicum Franciscanum Hong Kong, 1968). 供天主教教友、慕道班及学者研读比对之用。
                </p>
              </div>

              <h3 className="section-title" style={{ marginTop: "20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em", color: "var(--stone-500)" }}>
                Linguistic &amp; Lexical Datasets
              </h3>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>JMdict Dictionary</strong>
                  <span className="legal-badge badge-cc">CC BY-SA 4.0</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  Property of the Electronic Dictionary Research and Development Group (EDRDG). Used in accordance with the EDRDG license.
                </p>
              </div>

              <div className="legal-item">
                <div className="legal-item-title">
                  <strong>Tatoeba Project</strong>
                  <span className="legal-badge badge-cc">CC BY 2.0 FR</span>
                </div>
                <p className="tab-desc" style={{ marginBottom: "4px", fontSize: "12.5px" }}>
                  Sentence corpus provided by contributors at Tatoeba.org under Creative Commons Attribution.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Notice & Takedown Policy (DMCA) */}
          {activeTab === "takedown" && (
            <div className="tab-pane active">
              <p className="tab-desc">
                VerbumNobis operates in good faith as a non-commercial educational resource for religious and comparative linguistic study. We respect the intellectual property of all authors, Bible societies, and publishing houses.
              </p>

              <div className="takedown-box">
                <strong>Designated Copyright Agent Notice</strong>
                <p style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.6" }}>
                  If you are a copyright owner or an authorized legal representative and believe that content hosted on this service infringes your rights, please notify us directly. Upon verification, the requested material will be promptly removed or restricted within <strong>7 business days</strong> without necessity of formal litigation.
                </p>
              </div>

              <div style={{ marginTop: "16px" }}>
                <strong>To submit a review request, please provide:</strong>
                <ul style={{ paddingLeft: "20px", marginTop: "8px", fontSize: "12.5px", color: "var(--stone-500)", lineHeight: "1.6" }}>
                  <li>Identification of the copyrighted translation or material claimed to have been infringed.</li>
                  <li>Proof or statement of ownership / authorization to act on behalf of the copyright owner.</li>
                  <li>Your contact information (name, organization, telephone number, and email).</li>
                </ul>

                <a
                  href="mailto:chillien0815@gmail.com?subject=%5BCopyright%20Review%5D%20VerbumNobis"
                  className="action-email-btn"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Contact Copyright Agent (chillien0815@gmail.com)</span>
                </a>
              </div>
            </div>
          )}

          {/* Tab 4: Sponsorship & Mission Transparency */}
          {activeTab === "sponsorship" && (
            <div className="tab-pane active">
              <div className="sponsor-box">
                <strong className="sponsor-title" style={{ fontSize: "15px", marginBottom: "6px" }}>Domain &amp; Infrastructure Sponsorship</strong>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6" }}>
                  VerbumNobis does not seek profit, advertising revenue, or personal gain. Any potential sponsorship is allocated 100% directly toward domain registration renewals and fast global CDN distribution.
                </p>
              </div>

              <h3 className="section-title" style={{ marginTop: "16px" }}>Why a Custom Domain is Needed:</h3>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", lineHeight: "1.65", color: "var(--stone-800)" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Trust &amp; Credibility:</strong> A recognized domain (such as <code>verbumnobis.org</code>) gives parishes, RCIA teachers, catechists, and university students confidence that the study resource is reputable and safe, unlike unfamiliar personal <code>github.io</code> subdomains.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Search Engine Discovery (SEO):</strong> A dedicated domain enables Catholic Scripture researchers searching for parallel translations to discover this tool organically on search engines.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>High-Speed Global CDN:</strong> Ensuring instant passage lookup without rate limits across Asia, the Americas, and Europe.
                </li>
              </ul>

              <div className="card-notice" style={{ marginTop: "16px" }}>
                <strong>Zero-Monetization Commitment</strong>
                The creator does not seek personal profit, commercial monetization, or fame from this project. Sponsors and contributors will be permanently honored on the public Contributor Honor Roll.
              </div>
            </div>
          )}

          {/* Tab 5: Chatbot API Settings */}
          {activeTab === "api" && (
            <div className="tab-pane active">
              <p className="tab-desc">
                Provide your API key to activate exegesis and parallel theological study. Keys are stored locally on your device.
              </p>

              <div className="input-group">
                <label>MODEL PROVIDER</label>
                <AppSelect
                  aria-label="Model Provider"
                  selectedKey={provider}
                  onSelectionChange={(key) => setProvider(key)}
                  options={[
                    { id: "openai", name: "OpenAI (GPT-4o)" },
                    { id: "anthropic", name: "Anthropic (Claude 3.5 Sonnet)" },
                    { id: "gemini", name: "Google Gemini (Gemini 1.5 Pro)" }
                  ]}
                  buttonClassName="hub-modal-select-btn"
                />
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
          )}
        </div>
      </div>
    </div>
  );
}
