import { Drawer } from "../ui/Drawer";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  onOpenFontModal: () => void;
  onOpenGuideModal: () => void;
  onOpenHubModal: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  dark,
  onToggleTheme,
  onOpenFontModal,
  onOpenGuideModal,
  onOpenHubModal
}: MobileDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Navigation & Settings">
      <nav className="mobile-drawer-menu" aria-label="Mobile Navigation">
        <button
          type="button"
          className="mobile-drawer-item"
          onClick={() => {
            onClose();
            onOpenGuideModal();
          }}
        >
          <span className="mobile-drawer-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div className="mobile-drawer-item-text">
            <span className="mobile-drawer-item-title">Search Syntax Guide</span>
            <span className="mobile-drawer-item-subtitle">Aliases, books &amp; target flags</span>
          </div>
        </button>

        <button
          type="button"
          className="mobile-drawer-item"
          onClick={() => {
            onClose();
            onOpenFontModal();
          }}
        >
          <span className="mobile-drawer-icon font-icon">Aa</span>
          <div className="mobile-drawer-item-text">
            <span className="mobile-drawer-item-title">Reader Font Size</span>
            <span className="mobile-drawer-item-subtitle">Adjust chapter typography size</span>
          </div>
        </button>

        <button
          type="button"
          className="mobile-drawer-item"
          onClick={() => {
            onToggleTheme();
          }}
        >
          <span className="mobile-drawer-icon">
            {dark ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z" />
              </svg>
            )}
          </span>
          <div className="mobile-drawer-item-text">
            <span className="mobile-drawer-item-title">
              {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </span>
            <span className="mobile-drawer-item-subtitle">
              Current theme: {dark ? "Dark" : "Light"}
            </span>
          </div>
        </button>

        <button
          type="button"
          className="mobile-drawer-item"
          onClick={() => {
            onClose();
            onOpenHubModal();
          }}
        >
          <span className="mobile-drawer-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </span>
          <div className="mobile-drawer-item-text">
            <span className="mobile-drawer-item-title">Preferences &amp; Community</span>
            <span className="mobile-drawer-item-subtitle">AI API keys, about &amp; sponsors</span>
          </div>
        </button>
      </nav>
    </Drawer>
  );
}
