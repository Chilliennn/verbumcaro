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
          type="button"
        >
          <span className="dot" />
          Headings
        </button>
        <button
          className={`toolbar-button ${sync ? "active" : ""}`}
          onClick={onSync}
          type="button"
        >
          <span className="dot" />
          Sync
        </button>
        <button
          className={`toolbar-button ${parallel ? "active" : ""}`}
          onClick={onParallel}
          type="button"
        >
          <span className="dot" />
          Parallel
        </button>
      </div>
    </div>
  );
}
