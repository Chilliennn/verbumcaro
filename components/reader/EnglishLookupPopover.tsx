import { useEffect, useRef, useState } from "react";
import {
  analyzeEnglish,
  loadEnglishExamples,
  type EnglishLookup,
  type EnglishWord
} from "../../features/english/englishLookup";

interface EnglishLookupPopoverProps {
  text: string;
  anchor: { top: number; left: number };
  onClose: () => void;
}

export function EnglishLookupPopover({ text, anchor, onClose }: EnglishLookupPopoverProps) {
  const maxDialogHeight = Math.min(520, Math.max(0, window.innerHeight - 24));
  const dialogTop = Math.max(
    12,
    Math.min(anchor.top + 10, window.innerHeight - maxDialogHeight - 12)
  );
  const [lookup, setLookup] = useState<EnglishLookup | null>(null);
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
    analyzeEnglish(text)
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
    if (!lookup || preloadedText.current === lookup.text || lookup.words.length === 0) return;

    preloadedText.current = lookup.text;
    let cancelled = false;
    setExampleLoading(true);
    Promise.all(lookup.words.map((word) => loadEnglishExamples(word)))
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

  function toggleExamples(word: EnglishWord) {
    if (!lookup) return;
    if (expandedWord === word.surface) {
      setExpandedWord(null);
      return;
    }
    setExpandedWord(word.surface);
  }

  return (
    <aside
      className="english-lookup"
      style={{ top: dialogTop, left: Math.max(12, Math.min(anchor.left, window.innerWidth - 372)) }}
      role="dialog"
      aria-label="English text lookup"
    >
      <button className="english-lookup-close" type="button" onClick={onClose} aria-label="Close English lookup">&times;</button>
      <div className="english-lookup-content">
        {loading ? (
          <p className="english-lookup-status">Reading selected text...</p>
        ) : lookup && lookup.words.length > 0 ? (
          <>
            <div className="english-lookup-selection">{lookup.text}</div>
            <div className="english-lookup-words">
              {lookup.words.map((word, index) => (
                <section className="english-word" key={`${word.surface}-${index}`}>
                  <div className="english-word-heading">
                    <strong>{word.isInflected && word.lemma ? word.lemma : word.surface}</strong>
                    {word.pronunciation && (
                      <span className="english-word-pronunciation">[{word.pronunciation}]</span>
                    )}
                  </div>
                  <div className="english-word-reading">
                    {word.isInflected && (
                      <div className="english-inflection-info">
                        <span className="english-word-form">Form: <em>{word.surface}</em></span>
                        {word.inflection && <span className="english-word-inflection"> ({word.inflection})</span>}
                      </div>
                    )}
                    <div className="english-word-grammar">
                      <span className="english-word-pos">{word.partOfSpeech}</span>
                      {word.forms && word.forms.length > 0 ? (
                        <span className="english-word-parts"> · {word.forms.join(", ")}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="english-word-definitions">
                    {word.definitions.length > 0 ? (
                      <ul className="english-definition-list">
                        {word.definitions.map((def, di) => (
                          <li key={di}>{def}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="english-word-no-def">No definition found</p>
                    )}
                  </div>
                  {word.examples.length > 0 && (
                    <button className="english-example-toggle" type="button" onClick={() => toggleExamples(word)}>
                      {exampleLoading && expandedWord === word.surface
                        ? "Loading examples..."
                        : expandedWord === word.surface
                        ? "Hide examples"
                        : "Show examples"}
                    </button>
                  )}
                  {expandedWord === word.surface && word.examples.length > 0 && (
                    <div className="english-examples">
                      {word.examples.map((example, ei) => (
                        <p key={ei}>
                          <span className="english-example-quote">{example.english}</span>
                          {example.reference && <><br /><small className="english-example-ref">— {example.reference}</small></>}
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <small className="english-lookup-attribution">
              Definitions: FreeDictionaryAPI (Wiktionary) / DictionaryAPI.dev. Examples: Tatoeba.
            </small>
          </>
        ) : (
          <p className="english-lookup-status">Lookup unavailable. No definitions found.</p>
        )}
      </div>
    </aside>
  );
}
