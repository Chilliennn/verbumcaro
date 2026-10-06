interface ReaderToolbarProps {
  title: string;
  sync: boolean;
  parallel: boolean;
  showHeadings: boolean;
  onSync: () => void;
  onParallel: () => void;
  onHeadings: () => void;
}

export function ReaderToolbar({
  title,
  sync,
  parallel,
  showHeadings,
  onSync,
  onParallel,
  onHeadings
}: ReaderToolbarProps) {
  return (
    <div className="reader-toolbar">
      <h1>{title}</h1>

      <div className="toolbar-actions">
        <button
          className={`toolbar-button ${sync ? "active" : ""}`}
          onClick={onSync}
        >
          ⇆ Sync
        </button>

        <button
          className={`toolbar-button ${parallel ? "active" : ""}`}
          onClick={onParallel}
        >
          ◫ Parallel
        </button>

        <button
          className={`toolbar-button ${showHeadings ? "active" : ""}`}
          onClick={onHeadings}
        >
          ¶ Headings
        </button>
      </div>
    </div>
  );
}
