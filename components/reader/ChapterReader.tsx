import type { Chapter } from "../../lib/bible/repository";
import { Verse } from "./Verse";

interface ChapterReaderProps {
  chapter: Chapter | null;
  showHeadings: boolean;
  onFootnote: (text: string) => void;
}

export function ChapterReader({
  chapter,
  showHeadings,
  onFootnote
}: ChapterReaderProps) {
  if (!chapter) {
    return (
      <div className="empty-chapter">
        This chapter is not available in this translation yet.
      </div>
    );
  }

  return (
    <article className="chapter-reader">
      {chapter.verses.map((verse) => (
        <div key={verse.verse}>
          {showHeadings && verse.heading && (
            <h2 className="section-heading">{verse.heading}</h2>
          )}

          <Verse verse={verse} onFootnote={onFootnote} />
        </div>
      ))}
    </article>
  );
}
