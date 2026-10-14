import type { Chapter } from "../../lib/bible/repository";
import { Verse } from "./Verse";

interface ChapterReaderProps {
  chapter: Chapter | null;
  showHeadings: boolean;
  searchQuery?: string;
  onFootnote: (text: string) => void;
  verseFilter?: { start: number; end: number } | null;
}

export function ChapterReader({
  chapter,
  showHeadings,
  searchQuery,
  onFootnote,
  verseFilter
}: ChapterReaderProps) {
  if (!chapter) {
    return (
      <div className="empty-chapter">
        This chapter is not available in this translation yet.
      </div>
    );
  }

  let filteredVerses = chapter.verses;

  if (verseFilter) {
    filteredVerses = filteredVerses.filter(
      (verse) =>
        verse.verse >= verseFilter.start && verse.verse <= verseFilter.end
    );
  }

  const query = searchQuery?.trim().toLowerCase();

  const verses = query
    ? filteredVerses.filter((verse) =>
        verse.text.toLowerCase().includes(query)
      )
    : filteredVerses;

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
