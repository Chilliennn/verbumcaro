import { useEffect, useRef, useState } from "react";
import {
  analyzeLatin,
  loadLatinExamples,
  type LatinLookup,
  type LatinWord
} from "../../features/latin/latinLookup";

interface LatinLookupPopoverProps {
  text: string;
  anchor: { top: number; left: number };
  onClose: () => void;
}

export function LatinLookupPopover({ text, anchor, onClose }: LatinLookupPopoverProps) {
  const maxDialogHeight = Math.min(520, Math.max(0, window.innerHeight - 24));
  const dialogTop = Math.max(
    12,
    Math.min(anchor.top + 10, window.innerHeight - maxDialogHeight - 12)
  );
  const [lookup, setLookup] = useState<LatinLookup | null>(null);
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
    analyzeLatin(text)
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
    Promise.all(lookup.words.map((word) => loadLatinExamples(word)))
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

  function toggleExamples(word: LatinWord) {
    if (!lookup) return;
    if (expandedWord === word.surface) {
      setExpandedWord(null);
      return;
    }
    setExpandedWord(word.surface);
  }

  return (
    <aside
      className="latin-lookup"
      style={{ top: dialogTop, left: Math.max(12, Math.min(anchor.left, window.innerWidth - 372)) }}
      role="dialog"
      aria-label="Latin text lookup"
    >
      <button className="latin-lookup-close" type="button" onClick={onClose} aria-label="Close Latin lookup">&times;</button>
      <div className="latin-lookup-content">
        {loading ? (
          <p className="latin-lookup-status">Reading selected text...</p>
        ) : lookup && lookup.words.length > 0 ? (
          <>
            <div className="latin-lookup-selection">{lookup.text}</div>
            <div className="latin-lookup-words">
              {lookup.words.map((word, index) => (
                <section className="latin-word" key={`${word.surface}-${index}`}>
                  <div className="latin-word-heading">
                    <strong>{word.isInflected && word.lemma ? word.lemma : word.surface}</strong>
                    {word.pronunciation && (
                      <span className="latin-word-pronunciation">[{word.pronunciation}]</span>
                    )}
                  </div>
                  <div className="latin-word-reading">
                    {word.isInflected && (
                      <div className="latin-inflection-info">
                        <span className="latin-word-form">Form: <em>{word.surface}</em></span>
                        {word.inflection && <span className="latin-word-inflection"> ({word.inflection})</span>}
                      </div>
                    )}
                    <div className="latin-word-grammar">
                      <span className="latin-word-pos">{word.partOfSpeech}</span>
                      {word.principalParts && word.principalParts.length > 0 ? (
                        <span className="latin-word-parts"> · {word.principalParts.join(", ")}</span>
                      ) : word.forms && word.forms.length > 0 ? (
                        <span className="latin-word-parts"> · {word.forms.join(", ")}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="latin-word-definitions">
                    {word.definitions.length > 0 ? (
                      <ul className="latin-definition-list">
                        {word.definitions.map((def, di) => (
                          <li key={di}>{def}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="latin-word-no-def">No definition found</p>
                    )}
                  </div>
                  {word.examples.length > 0 && (
                    <button className="latin-example-toggle" type="button" onClick={() => toggleExamples(word)}>
                      {exampleLoading && expandedWord === word.surface
                        ? "Loading examples..."
                        : expandedWord === word.surface
                        ? "Hide examples"
                        : "Show examples"}
                    </button>
                  )}
                  {expandedWord === word.surface && word.examples.length > 0 && (
                    <div className="latin-examples">
                      {word.examples.map((example, ei) => (
                        <p key={ei}>
                          <span className="latin-example-quote">{example.latin}</span>
                          {example.reference && <><br /><small className="latin-example-ref">— {example.reference}</small></>}
                          {example.english && <><br /><span className="latin-example-trans">{example.english}</span></>}
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <small className="latin-lookup-attribution">
              Definitions: FreeDictionaryAPI (Wiktionary) / Latin WordNet.
            </small>
          </>
        ) : (
          <p className="latin-lookup-status">Lookup unavailable. No definitions found.</p>
        )}
      </div>
    </aside>
  );
}

