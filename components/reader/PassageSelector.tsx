import { useState } from "react";
import type { Book } from "../../lib/bible/repository";

interface PassageSelectorProps {
  book: Book;
  chapter: number;
  books: Book[];
  onChange: (bookCode: string, chapter: number) => void;
}

export function PassageSelector({
  book,
  chapter,
  books,
  onChange
}: PassageSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedBook = books.find((item) => item.code === book.code) ?? book;

  return (
    <>
      <button
        className="passage-selector"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>{selectedBook.name} {chapter}</span>
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
                  .map((item) => (
                    <button
                      key={item.code}
                      className={`book-item ${item.code === book.code ? "selected" : ""}`}
                      onClick={() => {
                        onChange(item.code, 1);
                        setOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
            </section>

            <section>
              <h3>New Testament</h3>
              <div className="book-list">
                {books
                  .filter((item) => item.testament === "NT")
                  .map((item) => (
                    <button
                      key={item.code}
                      className={`book-item ${item.code === book.code ? "selected" : ""}`}
                      onClick={() => {
                        onChange(item.code, 1);
                        setOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
            </section>

            <section>
              <h3>{selectedBook.name}</h3>
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
    </>
  );
}
