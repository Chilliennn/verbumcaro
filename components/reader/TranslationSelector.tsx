import {
  Select,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  type Key
} from "react-aria-components";
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
  const selected = translations.find((item) => item.id === value);

  return (
    <div className="version-selector-wrap">
      <Select
        selectedKey={value}
        onSelectionChange={(key: Key | null) => {
          if (key !== null) {
            onChange(String(key));
          }
        }}
        aria-label={`Select translation, currently ${selected?.name ?? "Select translation"}`}
        className="version-aria-select"
      >
        {({ isOpen }) => (
          <>
            <Button
              className="version-selector"
              aria-label={`Select translation, currently ${selected?.name ?? "Select translation"}`}
            >
              <SelectValue className="version-selector-value">
                {({ selectedText }) => selectedText || selected?.name || "Select translation"}
              </SelectValue>
              <svg
                className={`chevron ${isOpen ? "open" : ""}`}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
            <Popover className="version-selector-popover passage-menu-popover">
              <div className="picker-header">
                <span className="picker-title">Select Translation</span>
              </div>
              <ListBox className="picker-grid translation-picker-grid">
                {translations.map((translation) => (
                  <ListBoxItem
                    key={translation.id}
                    id={translation.id}
                    textValue={translation.name}
                    className={`book-item ${translation.id === value ? "selected" : ""}`}
                  >
                    {translation.name}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </>
        )}
      </Select>
    </div>
  );
}
