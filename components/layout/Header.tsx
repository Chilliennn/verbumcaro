interface HeaderProps {
  dark: boolean;
  onToggleTheme: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onToggleFontModal?: () => void;
  onOpenGuideModal?: () => void;
  onOpenHubModal?: () => void;
  onNavigateHome?: () => void;
  onOpenReader?: () => void;
}

export function Header({
  dark,
  onToggleTheme,
  search,
  onSearchChange,
  onSearchSubmit,
  onToggleFontModal,
  onOpenGuideModal,
  onOpenHubModal,
  onNavigateHome,
  onOpenReader
}: HeaderProps) {
  return (
    <header className="site-header">
      <button
        className="brand"
        title="Return to VerbumCaro Home"
        type="button"
        onClick={onNavigateHome}
      >
        <span className="brand-mark">
          <svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
            <circle cx="50" cy="50" r="44" strokeWidth="6.5" />
            <path d="M50 29.5 V70.5 M29.5 50 H70.5" strokeWidth="4.5" />
            <path d="M42.5 29.5 H57.5 M42.5 70.5 H57.5 M29.5 42.5 V57.5 M70.5 42.5 V57.5" strokeWidth="4.5" />
          </svg>
        </span>
        <span className="brand-name">VerbumCaro</span>
      </button>

      {onOpenReader && (
        <button
          type="button"
          onClick={onOpenReader}
          className="header-icon"
          title="Open Bible Reader"
          style={{ width: "auto", padding: "0 0.75rem", fontSize: "0.875rem", fontWeight: 500 }}
        >
          Bible
        </button>
      )}

      <div className="header-divider" />

      <div className="search-wrap">
        <form
          className="global-search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search Scripture, passages, or words..."
            aria-label="Search Bible"
          />
          <button
            type="submit"
            className="search-btn"
            title="Search"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>
      </div>

      <div className="header-actions">
        {onOpenGuideModal && (
          <button
            className="header-icon"
            title="Search guide"
            type="button"
            onClick={onOpenGuideModal}
            aria-label="Search syntax guide"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        )}

        <button
          className="header-icon aa"
          title="Text settings"
          type="button"
          onClick={onToggleFontModal}
        >
          Aa
        </button>

        <button
          className="header-icon"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle light/dark mode"
        >
          {dark ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z" />
            </svg>
          )}
        </button>

        <button
          className="header-icon"
          title="Account, Sponsors & API Settings"
          aria-label="Account"
          type="button"
          onClick={onOpenHubModal}
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
