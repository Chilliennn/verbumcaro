import type { Verse as VerseData } from "../../lib/bible/repository";

interface VerseProps {
  verse: VerseData;
  onFootnote?: (text: string) => void;
}

export function Verse({ verse, onFootnote }: VerseProps) {
  return (
    <div className="verse" data-verse={verse.verse}>
      <span className="verse-number">{verse.verse}</span>

      <span className="verse-text">
        {verse.text}

        {verse.footnotes.length > 0 && (
          <button
            className="footnote-button"
            onClick={() => onFootnote?.(verse.footnotes[0])}
            aria-label={`Footnote for verse ${verse.verse}`}
          >
            *
          </button>
        )}
      </span>
    </div>
  );
}
