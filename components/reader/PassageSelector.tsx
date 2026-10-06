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
    <div className="selector-wrapper">
      <button
        className="passage-selector"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{selectedBook.name} {chapter}</span>
        <span>⌄</span>
      </button>

      {open && (
        <div className="passage-menu">
          <div className="passage-menu-title">Books</div>

          <div className="book-grid">
            {books.map((item) => (
              <button
                key={item.code}
                className={item.code === book.code ? "selected" : ""}
                onClick={() => {
                  onChange(item.code, 1);
                  setOpen(false);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="chapter-picker">
            <div className="passage-menu-title">
              {selectedBook.name} — Chapter
            </div>

            <div className="chapter-grid">
              {Array.from(
                { length: selectedBook.chapters },
                (_, index) => index + 1
              ).map((number) => (
                <button
                  key={number}
                  className={number === chapter ? "selected" : ""}
                  onClick={() => {
                    onChange(book.code, number);
                    setOpen(false);
                  }}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
