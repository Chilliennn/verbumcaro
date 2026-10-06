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
  onLeftChange: (panel: PanelState) => void;
  onRightChange: (panel: PanelState) => void;
  onSyncVerse: (verse: number) => void;
}

export function ParallelReader({
  left,
  right,
  books,
  translations,
  showHeadings,
  sync,
  parallel,
  onLeftChange,
  onRightChange,
  onSyncVerse
}: ParallelReaderProps) {
  return (
    <div className={`reader-grid ${parallel ? "" : "single-panel"}`}>
      <BiblePanel
        panel={left}
        books={books}
        translations={translations}
        showHeadings={showHeadings}
        sync={sync}
        onChange={onLeftChange}
        onVerseVisible={onSyncVerse}
      />

      {parallel && (
        <BiblePanel
          panel={right}
          books={books}
          translations={translations}
          showHeadings={showHeadings}
          sync={sync}
          onChange={onRightChange}
          onVerseVisible={() => undefined}
        />
      )}
    </div>
  );
}
