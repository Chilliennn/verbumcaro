import type { Chapter } from "../../lib/bible/repository";
import { Verse } from "./Verse";

interface ChapterReaderProps {
  chapter: Chapter | null;
  showHeadings: boolean;
  searchQuery?: string;
  onFootnote: (text: string) => void;
}

export function ChapterReader({
  chapter,
  showHeadings,
  searchQuery,
  onFootnote
}: ChapterReaderProps) {
  if (!chapter) {
    return (
      <div className="empty-chapter">
        This chapter is not available in this translation yet.
      </div>
    );
  }

  const query = searchQuery?.trim().toLowerCase();

  const verses = query
    ? chapter.verses.filter((verse) =>
        verse.text.toLowerCase().includes(query)
      )
    : chapter.verses;

  return (
    <article className="chapter-reader">
      {query && (
        <div className="search-result">
          <strong>{verses.length}</strong> matching verse
          {verses.length === 1 ? "" : "s"} for &ldquo;{searchQuery?.trim()}&rdquo;
        </div>
      )}

      {verses.map((verse) => (
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
