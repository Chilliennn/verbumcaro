import { useEffect, useState } from "react";

export interface SaintQuote {
  index?: number;
  quote: string;
  author: string;
  link?: string;
  preview?: string;
}

interface SaintQuotesPayload {
  count?: number;
  quotes?: SaintQuote[];
}

const FALLBACK_QUOTE: SaintQuote = {
  index: 1,
  quote: "Pray as though everything depended on God. Work as though everything depended on you.",
  author: "St. Augustine of Hippo",
  link: "https://www.newadvent.org/cathen/02084a.htm",
  preview: "Saint Augustine of Hippo was Bishop of Hippo, great Doctor of the Church, and philosopher whose spiritual writings, including the Confessions and The City of God, profoundly shaped Catholic theology and Western thought."
};

export function useSaintQuotes() {
  const [quotes, setQuotes] = useState<SaintQuote[]>([FALLBACK_QUOTE]);
  const [currentQuote, setCurrentQuote] = useState<SaintQuote>(FALLBACK_QUOTE);

  useEffect(() => {
      fetch(`${import.meta.env.BASE_URL}data/saint-quotes.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SaintQuotesPayload | SaintQuote[] | null) => {
        if (!data) return;
        const list = Array.isArray(data) ? data : (data.quotes ?? []);
        if (list.length > 0) {
          setQuotes(list);
          const randomIndex = Math.floor(Math.random() * list.length);
          setCurrentQuote(list[randomIndex]);
        }
      })
      .catch(() => {});
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
