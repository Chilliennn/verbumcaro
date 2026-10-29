import { useEffect, useRef, useState } from "react";
import {
  analyzeJapanese,
  loadJapaneseExamples,
  type JapaneseLookup,
  type JapaneseWord
} from "../../features/japanese/japaneseLookup";

interface JapaneseLookupPopoverProps {
  text: string;
  anchor: { top: number; left: number };
  onClose: () => void;
}

export function JapaneseLookupPopover({ text, anchor, onClose }: JapaneseLookupPopoverProps) {
  const maxDialogHeight = Math.min(520, Math.max(0, window.innerHeight - 24));
  const dialogTop = Math.max(
    12,
    Math.min(anchor.top + 10, window.innerHeight - maxDialogHeight - 12)
  );
  const [lookup, setLookup] = useState<JapaneseLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [exampleLoading, setExampleLoading] = useState(false);
  const preloadedText = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLookup(null);
    setExpandedWord(null);
    setExampleLoading(false);
    analyzeJapanese(text)
      .then((result) => {
        if (!cancelled) setLookup(result);
      })
      .catch(() => {
        if (!cancelled) setLookup(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  useEffect(() => {
    if (!lookup || preloadedText.current === lookup.text) return;

    preloadedText.current = lookup.text;
    let cancelled = false;
    setExampleLoading(true);
    Promise.all(lookup.words.map((word) => loadJapaneseExamples(word)))
      .then((words) => {
        if (cancelled) return;
        setLookup((current) => current?.text === lookup.text ? { ...current, words } : current);
      })
      .finally(() => {
        if (!cancelled) setExampleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lookup]);

  async function toggleExamples(word: JapaneseWord) {
    if (!lookup) return;
    if (expandedWord === word.surface) {
      setExpandedWord(null);
      return;
    }
    setExpandedWord(word.surface);
  }

  return (
    <aside
      className="japanese-lookup"
      style={{ top: dialogTop, left: Math.max(12, Math.min(anchor.left, window.innerWidth - 372)) }}
      role="dialog"
      aria-label="Japanese text lookup"
    >
      <button className="japanese-lookup-close" type="button" onClick={onClose} aria-label="Close Japanese lookup">&times;</button>
      {loading ? <p className="japanese-lookup-status">Reading selected text...</p> : lookup ? (
        <>
          <div className="japanese-lookup-selection">{lookup.text}</div>
          <div className="japanese-lookup-romaji">{lookup.romaji}</div>
          <div className="japanese-lookup-words">
            {lookup.words.map((word, index) => (
              <section className="japanese-word" key={`${word.surface}-${index}`}>
                <div className="japanese-word-heading">
                  <strong>{word.surface}</strong>
                  <span>{word.romaji}</span>
                </div>
                <div className="japanese-word-reading">{word.reading} · {word.partOfSpeech}</div>
                <div>{word.definitions.length > 0 ? word.definitions.join("; ") : "No definition found"}</div>
                <button className="japanese-example-toggle" type="button" onClick={() => toggleExamples(word)}>
                  {exampleLoading && expandedWord === word.surface ? "Loading examples..." : expandedWord === word.surface ? "Hide examples" : "Show examples"}
                </button>
                {expandedWord === word.surface && word.examples.length > 0 && (
                  <div className="japanese-examples">
                    {word.examples.map((example) => (
                      <p key={`${example.japanese}-${example.english ?? ""}`}>
                        <span>{example.japanese}</span>
                        {example.transcription && <><br /><small>{example.transcription}</small></>}
                        {example.romaji && <><br /><small>{example.romaji}</small></>}
                        {example.english && <><br />{example.english}</>}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      ) : <p className="japanese-lookup-status">Lookup unavailable. Romaji could not be generated.</p>}
      <small className="japanese-lookup-attribution">Definitions: Jisho.org / JMdict. Examples: Tatoeba.</small>
    </aside>
  );
}