interface SearchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchGuideModal({ isOpen, onClose }: SearchGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Search Reference Guide</h2>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="guide-card">
            <strong>Prefix Tolerant Search</strong>
            <p>Type incomplete prefixes without failing:</p>
            <code>exod 3:14</code> or <code>exo 3:14</code> &rarr; Exodus 3:14
          </div>

          <div className="guide-card">
            <strong>Chinese Traditional &amp; Catholic Shorthand</strong>
            <p>Supports both Sigao (思高) and Union (和合本) abbreviations:</p>
            <p><code>若一 1:9</code> &rarr; 1 John 1:9 (若望一书)</p>
            <p><code>格前 13:4-7</code> &rarr; 1 Corinthians 13:4-7 (格林多前书)</p>
            <p><code>创 1:1</code> &rarr; Genesis 1:1 (创世纪)</p>
          </div>

          <div className="guide-card">
            <strong>Chained Passages</strong>
            <p>Chain chapters &amp; verses sharing the preceding book:</p>
            <code>John 3:16, 15:5</code> or <code>若望 3:16, 15:5</code>
          </div>

          <div className="guide-card">
            <strong>Manuscript Target Flags</strong>
            <p>Filter translation via modifiers:</p>
            <code>@sigao</code> or <code>@catholic</code>
          </div>
        </div>
      </div>
    </div>
  );
}
