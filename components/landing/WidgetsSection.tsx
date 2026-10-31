import { SaintQuoteWidget } from "./SaintQuoteWidget";
import { VerseOfDayWidget } from "./VerseOfDayWidget";
import { BibleQuizWidget } from "./BibleQuizWidget";
import { CatholicTriviaWidget } from "./CatholicTriviaWidget";

export function WidgetsSection() {
  return (
    <section className="widgets-grid">
      <SaintQuoteWidget />
      <VerseOfDayWidget />
      <BibleQuizWidget />
      <CatholicTriviaWidget />
    </section>
  );
}
