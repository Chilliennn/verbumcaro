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
  return (
    <div className="version-wrap">
      <select
        className="version-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Bible translation"
      >
        {translations.map((translation) => (
          <option key={translation.id} value={translation.id}>
            {translation.name}
          </option>
        ))}
      </select>
    </div>
  );
}
