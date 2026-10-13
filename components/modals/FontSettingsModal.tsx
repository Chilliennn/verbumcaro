interface FontSettingsModalProps {
  isOpen: boolean;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onClose: () => void;
}

export function FontSettingsModal({
  isOpen,
  fontSize,
  onFontSizeChange,
  onClose
}: FontSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="font-modal-backdrop" onClick={onClose}>
      <div className="font-modal" onClick={(e) => e.stopPropagation()}>
        <div className="font-modal-header">
          <div className="font-modal-title">Font Size</div>
          <button
            className="font-modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="font-preview">
          <span style={{ fontSize: 14 }}>Aa</span>
          <span style={{ fontSize: 28 }}>Aa</span>
        </div>

        <input
          type="range"
          className="font-slider"
          min="14"
          max="28"
          step="1"
          value={fontSize}
          onChange={(event) => onFontSizeChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
