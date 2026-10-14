import { useEffect, useRef, useState } from "react";
import type { Translation } from "../../lib/bible/repository";

interface TranslationSelectorProps {
  value: string;
  translations: Translation[];
  onChange: (value: string) => void;
}

export function TranslationSelector({
  value,
  translations,
  onChange
}: TranslationSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = translations.find((item) => item.id === value);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="version-selector-wrap">
      <button
        className="version-selector"
        onClick={() => setOpen((value) => !value)}
        type="button"
        aria-expanded={open}
        aria-label={`Select translation, currently ${selected?.name ?? "Select translation"}`}
      >
        <span>{selected?.name ?? "Select translation"}</span>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="passage-menu">
          <div className="picker-mobile-header">
            <span className="picker-mobile-title">Select Translation</span>
            <button
              type="button"
              className="picker-mobile-close"
              onClick={() => setOpen(false)}
              aria-label="Close translation selector"
            >
              &times;
            </button>
          </div>
          <div className="picker-grid translation-picker-grid">
            {translations.map((translation) => (
              <button
                key={translation.id}
                type="button"
                className={`book-item ${translation.id === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(translation.id);
                  setOpen(false);
                }}
              >
                {translation.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
