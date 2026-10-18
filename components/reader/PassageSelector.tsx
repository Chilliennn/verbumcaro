import { useEffect, useRef, useState } from "react";
import type { Book } from "../../lib/bible/repository";
import { getBookName, getBookLanguageName } from "../../lib/data/book_names";

interface PassageSelectorProps {
  book: Book;
  chapter: number;
  verseFilter?: { start: number; end: number };
  books: Book[];
  onChange: (bookCode: string, chapter: number) => void;
  translationLanguage?: string;
}

export function PassageSelector({
  book,
  chapter,
  verseFilter,
  books,
  onChange,
  translationLanguage
}: PassageSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedBook = books.find((item) => item.code === book.code) ?? book;
  const language = getBookLanguageName(translationLanguage ?? "en");
  const displayName = getBookName(selectedBook.code, language);
  const testamentTabs: Array<{ value: "OT" | "NT"; label: string }> = [
    { value: "OT", label: "Old Testament" },
    { value: "NT", label: "New Testament" }
  ];

  const [activeTestament, setActiveTestament] = useState<"OT" | "NT">(
    selectedBook.testament === "NT" ? "NT" : "OT"
  );
  const [expandedBookCode, setExpandedBookCode] = useState<string>(selectedBook.code);

  useEffect(() => {
    if (open) {
      setActiveTestament(selectedBook.testament === "NT" ? "NT" : "OT");
      setExpandedBookCode(selectedBook.code);
    }
  }, [open, selectedBook.code, selectedBook.testament]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className={open ? "passage-picker-open" : undefined}>
      <button
        className="passage-selector"
        onClick={() => setOpen((value) => !value)}
        type="button"
        aria-expanded={open}
        aria-label={`Select passage, currently ${displayName} ${chapter}`}
      >
        <span>
          {displayName} {chapter}
          {verseFilter &&
            `:${verseFilter.start}${verseFilter.end !== verseFilter.start ? `-${verseFilter.end}` : ""}`}
        </span>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="passage-menu">
          <div className="picker-header">
            <div className="testament-tabs">
              {testamentTabs.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`tab-btn ${activeTestament === value ? "active" : ""}`}
                  onClick={() => {
                    setActiveTestament(value);
                    const firstBook = books.find((item) => item.testament === value);
                    if (firstBook && selectedBook.testament !== value) {
                      setExpandedBookCode(firstBook.code);
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="picker-close"
              onClick={() => setOpen(false)}
              aria-label="Close passage selector"
            >
              &times;
            </button>
          </div>
          <div className="passage-mobile-list">
            {books
              .filter((item) => item.testament === activeTestament)
              .map((item) => {
                const name = getBookName(item.code, language);
                const isExpanded = item.code === expandedBookCode;
                return (
                  <div key={item.code} className="passage-book-group">
                    <button
                      type="button"
                      className={`book-accordion-btn ${isExpanded ? "expanded" : ""}`}
                      onClick={() =>
                        setExpandedBookCode(isExpanded ? "" : item.code)
                      }
                    >
                      <span>{name}</span>
                    </button>
                    {isExpanded && (
                      <div className="passage-chapter-grid">
                        {Array.from(
                          { length: item.chapters },
                          (_, index) => index + 1
                        ).map((number) => (
                          <button
                            key={number}
                            type="button"
                            className={`passage-chapter-cell ${item.code === book.code && number === chapter ? "selected" : ""}`}
                            onClick={() => {
                              onChange(item.code, number);
                              setOpen(false);
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
