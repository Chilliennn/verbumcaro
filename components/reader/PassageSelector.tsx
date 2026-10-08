import { useEffect, useRef, useState } from "react";
import type { Book } from "../../lib/bible/repository";
import { getBookName, getBookLanguageName } from "../../lib/data/book_names";

interface PassageSelectorProps {
  book: Book;
  chapter: number;
  books: Book[];
  onChange: (bookCode: string, chapter: number) => void;
  translationLanguage?: string;
}

export function PassageSelector({
  book,
  chapter,
  books,
  onChange,
  translationLanguage
}: PassageSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedBook = books.find((item) => item.code === book.code) ?? book;
  const language = getBookLanguageName(translationLanguage ?? "en");
  const displayName = getBookName(selectedBook.code, language);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef}>
      <button
        className="passage-selector"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>{displayName} {chapter}</span>
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
          <div className="picker-grid">
            <section>
              <h3>Old Testament</h3>
              <div className="book-list">
                {books
                  .filter((item) => item.testament === "OT")
                  .map((item) => {
                    const name = getBookName(item.code, language);
                    return (
                      <button
                        key={item.code}
                        className={`book-item ${item.code === book.code ? "selected" : ""}`}
                        onClick={() => {
                          onChange(item.code, 1);
                          setOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
              </div>
            </section>

            <section>
              <h3>New Testament</h3>
              <div className="book-list">
                {books
                  .filter((item) => item.testament === "NT")
                  .map((item) => {
                    const name = getBookName(item.code, language);
                    return (
                      <button
                        key={item.code}
                        className={`book-item ${item.code === book.code ? "selected" : ""}`}
                        onClick={() => {
                          onChange(item.code, 1);
                          setOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
              </div>
            </section>

            <section>
              <h3>{displayName}</h3>
              <div className="chapter-list">
                {Array.from(
                  { length: selectedBook.chapters },
                  (_, index) => index + 1
                ).map((number) => (
                  <button
                    key={number}
                    className={`chapter-item ${number === chapter ? "active" : ""}`}
                    onClick={() => {
                      onChange(book.code, number);
                      setOpen(false);
                    }}
                  >
                    <span className="chapter-num">{number}</span>
                    <span className="chapter-title" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
