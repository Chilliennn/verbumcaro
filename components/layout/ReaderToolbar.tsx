interface ReaderToolbarProps {
  sync: boolean;
  parallel: boolean;
  showHeadings: boolean;
  onSync: () => void;
  onParallel: () => void;
  onHeadings: () => void;
}

export function ReaderToolbar({
  sync,
  parallel,
  showHeadings,
  onSync,
  onParallel,
  onHeadings
}: ReaderToolbarProps) {
  return (
    <div className="reader-toolbar">
      <div className="toolbar-actions">
        <button
          className={`toolbar-button ${showHeadings ? "active" : ""}`}
          onClick={onHeadings}
        >
          <span>H1</span>
        </button>

        <button
          className={`toolbar-button ${sync ? "active" : ""}`}
          onClick={onSync}
        >
          <span className="dot" />
          <span>Sync</span>
        </button>

        <button
          className={`toolbar-button ${parallel ? "active" : ""}`}
          onClick={onParallel}
        >
          <span>Parallel</span>
        </button>
      </div>
    </div>
  );
}
