import { SaintQuoteWidget } from "./SaintQuoteWidget";
import { VerseOfDayWidget } from "./VerseOfDayWidget";

export function WidgetsSection() {
  return (
    <section className="widgets-grid">
      <SaintQuoteWidget />
      <VerseOfDayWidget />
    </section>
  );
}
