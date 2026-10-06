interface HeaderProps {
  dark: boolean;
  onToggleTheme: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function Header({
  dark,
  onToggleTheme,
  search,
  onSearchChange,
  onSearchSubmit
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-mark">VC</div>
        <span>VerbumCaro</span>
      </div>

      <form
        className="global-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <span className="search-icon">⌕</span>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Bible or enter a reference, e.g. John 3:16 /chi"
          aria-label="Search Bible"
        />

        <kbd>⌘ K</kbd>
      </form>

      <div className="header-actions">
        <button className="icon-button" title="Reading history">
          ◷
        </button>

        <button
          className="icon-button"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleTheme}
        >
          {dark ? "☀" : "☾"}
        </button>

        <button className="icon-button" title="Information">
          ⓘ
        </button>
      </div>
    </header>
  );
}
