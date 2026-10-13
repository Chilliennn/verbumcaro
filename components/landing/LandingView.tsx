import { HeroSection } from "./HeroSection";
import { WidgetsSection } from "./WidgetsSection";

interface LandingViewProps {
  onOpenReader?: () => void;
}

export function LandingView({ onOpenReader }: LandingViewProps) {
  return (
    <div className="landing-view">
      <HeroSection onOpenReader={onOpenReader} />
      <WidgetsSection />
    </div>
  );
}
