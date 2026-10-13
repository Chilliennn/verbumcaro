import { HeroSection } from "./HeroSection";
import { WidgetsSection } from "./WidgetsSection";

export function LandingView() {
  return (
    <div className="landing-view">
      <HeroSection />
      <WidgetsSection />
    </div>
  );
}
