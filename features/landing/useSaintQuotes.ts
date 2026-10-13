import { useEffect, useState } from "react";

export interface SaintQuote {
  quote: string;
  author: string;
}

const FALLBACK_QUOTE: SaintQuote = {
  quote: "Pray as though everything depended on God. Work as though everything depended on you.",
  author: "St. Augustine of Hippo"
};

export function useSaintQuotes() {
  const [quotes, setQuotes] = useState<SaintQuote[]>([FALLBACK_QUOTE]);
  const [currentQuote, setCurrentQuote] = useState<SaintQuote>(FALLBACK_QUOTE);

  useEffect(() => {
    fetch("/data/saint-quotes.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SaintQuote[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuotes(data);
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentQuote(data[randomIndex]);
        }
      })
      .catch(() => {
        // Fallback maintained
      });
  }, []);

  function shuffleQuote() {
    if (quotes.length <= 1) return;
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * quotes.length);
    } while (quotes[nextIndex].quote === currentQuote.quote);
    setCurrentQuote(quotes[nextIndex]);
  }

  return {
    quote: currentQuote,
    shuffleQuote
  };
}
