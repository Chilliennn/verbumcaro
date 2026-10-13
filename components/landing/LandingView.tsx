import { HeroSection } from "./HeroSection";
import { WidgetsSection } from "./WidgetsSection";

interface LandingViewProps {
  onReadScripture: () => void;
}

export function LandingView({ onReadScripture }: LandingViewProps) {
  return (
    <div className="landing-view">
      <HeroSection onReadScripture={onReadScripture} />
      <WidgetsSection />
    </div>
  );
}
