import { useEffect, useRef, useState } from "react";
import {
  analyzeChinese,
  loadChineseExamples,
  type ChineseLookup,
  type ChineseWord
} from "../../features/chinese/chineseLookup";

interface ChineseLookupPopoverProps {
  text: string;
  anchor: { top: number; left: number };
  onClose: () => void;
}

export function ChineseLookupPopover({ text, anchor, onClose }: ChineseLookupPopoverProps) {
  const maxDialogHeight = Math.min(520, Math.max(0, window.innerHeight - 24));
  const dialogTop = Math.max(
    12,
    Math.min(anchor.top + 10, window.innerHeight - maxDialogHeight - 12)
  );
  const [lookup, setLookup] = useState<ChineseLookup | null>(null);
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
    analyzeChinese(text)
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
    Promise.all(lookup.words.map((word) => loadChineseExamples(word)))
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

  function toggleExamples(word: ChineseWord) {
    if (!lookup) return;
    if (expandedWord === word.surface) {
      setExpandedWord(null);
      return;
    }
    setExpandedWord(word.surface);
  }

  return (
    <aside
      className="chinese-lookup"
      style={{ top: dialogTop, left: Math.max(12, Math.min(anchor.left, window.innerWidth - 372)) }}
      role="dialog"
      aria-label="Chinese text lookup"
    >
      <button className="chinese-lookup-close" type="button" onClick={onClose} aria-label="Close Chinese lookup">&times;</button>
      <div className="chinese-lookup-content">
        {loading ? (
          <p className="chinese-lookup-status">Reading selected text...</p>
        ) : lookup && lookup.words.length > 0 ? (
          <>
            <div className="chinese-lookup-selection">{lookup.text}</div>
            {lookup.pinyin && <div className="chinese-lookup-pinyin">{lookup.pinyin}</div>}
            <div className="chinese-lookup-words">
              {lookup.words.map((word, index) => (
                <section className="chinese-word" key={`${word.surface}-${index}`}>
                  <div className="chinese-word-heading">
                    <strong>{word.surface}</strong>
                    {word.pinyin && (
                      <span className="chinese-word-pinyin">[{word.pinyin}]</span>
                    )}
                  </div>
                  {word.partOfSpeech && (
                    <div className="chinese-word-grammar">
                      <span className="chinese-word-pos">{word.partOfSpeech}</span>
                    </div>
                  )}
                  <div className="chinese-word-definitions">
                    {word.definitions.length > 0 ? (
                      <ul className="chinese-definition-list">
                        {word.definitions.map((def, di) => (
                          <li key={di}>{def}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="chinese-word-no-def">No definition found</p>
                    )}
                  </div>
                  {word.examples.length > 0 && (
                    <button className="chinese-example-toggle" type="button" onClick={() => toggleExamples(word)}>
                      {exampleLoading && expandedWord === word.surface
                        ? "Loading examples..."
                        : expandedWord === word.surface
                        ? "Hide examples"
                        : "Show examples"}
                    </button>
                  )}
                  {expandedWord === word.surface && word.examples.length > 0 && (
                    <div className="chinese-examples">
                      {word.examples.map((example, ei) => (
                        <p key={ei}>
                          <span className="chinese-example-quote">{example.chinese}</span>
                          {example.english && <><br /><span className="chinese-example-trans">{example.english}</span></>}
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <small className="chinese-lookup-attribution">
              Definitions: Youdao / FreeDictionaryAPI (Wiktionary). Examples: Tatoeba.
            </small>
          </>
        ) : (
          <p className="chinese-lookup-status">Lookup unavailable. No definitions found.</p>
        )}
      </div>
    </aside>
  );
}
