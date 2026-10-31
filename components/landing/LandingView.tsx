import { HeroSection } from "./HeroSection";
import { WidgetsSection } from "./WidgetsSection";
import type { CitationTarget } from "../common/VerseCitationPopover";

interface LandingViewProps {
  onReadScripture: () => void;
  onSelectCitation?: (target: CitationTarget) => void;
}

export function LandingView({ onReadScripture, onSelectCitation }: LandingViewProps) {
  return (
    <div className="landing-view">
      <HeroSection onReadScripture={onReadScripture} />
      <WidgetsSection onSelectCitation={onSelectCitation} />
    </div>
  );
}
