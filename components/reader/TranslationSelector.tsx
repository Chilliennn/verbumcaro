import { useState } from "react";
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
  const selected = translations.find((item) => item.id === value);

  return (
    <div className="version-selector-wrap">
      <button
        className="version-selector"
        onClick={() => setOpen((value) => !value)}
        type="button"
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
          <div className="picker-grid">
            {translations.map((translation) => (
              <button
                key={translation.id}
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
