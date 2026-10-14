import { useState } from "react";

export function useLandingPage() {
  const [isLanding, setIsLanding] = useState(() => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    return !params.has("left") && !params.has("right") && !params.has("q") && params.get("mode") !== "reader";
  });

  function navigateHome() {
    setIsLanding(true);
    const url = new URL(window.location.href);
    url.search = "";
    window.history.pushState({}, "", url.pathname);
  }

  return {
    isLanding,
    setIsLanding,
    navigateHome
  };
}
