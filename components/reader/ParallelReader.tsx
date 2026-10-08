import type {
  Book,
  Translation
} from "../../lib/bible/repository";
import type { PanelState } from "../../features/reader/readerTypes";
import { BiblePanel } from "./BiblePanel";

interface ParallelReaderProps {
  left: PanelState;
  right: PanelState;
  books: Book[];
  translations: Translation[];
  showHeadings: boolean;
  sync: boolean;
  parallel: boolean;
  searchQuery?: string;
  leftAvailableBooks?: Book[];
  rightAvailableBooks?: Book[];
  onLeftChange: (panel: PanelState) => void;
  onRightChange: (panel: PanelState) => void;
  onSyncVerse: (verse: number) => void;
  onClose: () => void;
}

export function ParallelReader({
  left,
  right,
  books,
  translations,
  showHeadings,
  sync,
  parallel,
  searchQuery,
  leftAvailableBooks,
  rightAvailableBooks,
  onLeftChange,
  onRightChange,
  onSyncVerse,
  onClose
}: ParallelReaderProps) {
  return (
    <div className={`reader-grid ${parallel ? "parallel-mode" : "single-panel"}`}>
      <BiblePanel
        panel={left}
        books={leftAvailableBooks ?? books}
        translations={translations}
        showHeadings={showHeadings}
        sync={sync}
        parallel={parallel}
        searchQuery={searchQuery}
        onChange={onLeftChange}
        onVerseVisible={parallel ? onSyncVerse : undefined}
        onClose={parallel ? onClose : undefined}
      />

      {parallel && (
        <BiblePanel
          panel={right}
          books={rightAvailableBooks ?? books}
          translations={translations}
          showHeadings={showHeadings}
          sync={sync}
          parallel={parallel}
          searchQuery={searchQuery}
          onChange={onRightChange}
          onVerseVisible={parallel ? onSyncVerse : undefined}
          onClose={onClose}
        />
      )}
    </div>
  );
}
