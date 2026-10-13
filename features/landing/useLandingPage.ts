import { useEffect, useState } from "react";

export function useLandingPage(hasSearch: boolean, hasResults: boolean) {
  const [isLanding, setIsLanding] = useState(() => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    return !params.has("left") && !params.has("right") && !params.has("q");
  });

  useEffect(() => {
    if (hasSearch || hasResults) {
      setIsLanding(false);
    }
  }, [hasSearch, hasResults]);

  function navigateHome() {
    setIsLanding(true);
    const url = new URL(window.location.href);
    url.search = "";
    window.history.pushState({}, "", url.toString());
  }

  return {
    isLanding,
    setIsLanding,
    navigateHome
  };
}
