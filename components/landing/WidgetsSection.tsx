import { SaintQuoteWidget } from "./SaintQuoteWidget";
import { VerseOfDayWidget } from "./VerseOfDayWidget";
import { BibleQuizWidget } from "./BibleQuizWidget";
import { CatholicTriviaWidget } from "./CatholicTriviaWidget";
import type { CitationTarget } from "../common/VerseCitationPopover";

interface WidgetsSectionProps {
  onSelectCitation?: (target: CitationTarget) => void;
}

export function WidgetsSection({ onSelectCitation }: WidgetsSectionProps = {}) {
  return (
    <section className="widgets-grid">
      <SaintQuoteWidget />
      <VerseOfDayWidget onSelectCitation={onSelectCitation} />
      <BibleQuizWidget onSelectCitation={onSelectCitation} />
      <CatholicTriviaWidget onSelectCitation={onSelectCitation} />
    </section>
  );
}
