import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/layout/Header";
import { ReaderToolbar } from "../components/layout/ReaderToolbar";
import { AppShell } from "../components/layout/AppShell";
import { ParallelReader } from "../components/reader/ParallelReader";
import { bibleRepository } from "../lib/bible/staticRepository";
import type {
  Book,
  Translation
} from "../lib/bible/repository";
import {
  DEFAULT_READER_STATE,
  loadReaderState,
  saveReaderState
} from "../features/reader/readerStore";
import type {
  PanelState,
  ReaderState
} from "../features/reader/readerTypes";
import { parseReference } from "../features/references/parser";

function getUrlState(): Partial<ReaderState> {
  const params = new URLSearchParams(window.location.search);

  function parsePanel(value: string | null): PanelState | null {
    if (!value) {
      return null;
    }

    const [translationId, bookCode, chapter] = value.split(":");

    if (!translationId || !bookCode || !chapter) {
      return null;
    }

    return {
      translationId,
      bookCode,
      chapter: Number(chapter)
    };
  }

  const left = parsePanel(params.get("left"));
  const right = parsePanel(params.get("right"));

  return {
    ...(left ? { left } : {}),
    ...(right ? { right } : {})
  };
}

function updateUrl(state: ReaderState) {
  const params = new URLSearchParams();

  params.set(
    "left",
    `${state.left.translationId}:${state.left.bookCode}:${state.left.chapter}`
  );

  params.set(
    "right",
    `${state.right.translationId}:${state.right.bookCode}:${state.right.chapter}`
  );

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

export default function App() {
  const [dark, setDark] = useState(
    localStorage.getItem("verbumcaro.theme") === "dark"
  );

  const [reader, setReader] = useState<ReaderState>(() => ({
    ...DEFAULT_READER_STATE,
    ...loadReaderState(),
    ...getUrlState()
  }));

  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    bibleRepository.getTranslations().then(setTranslations);
    bibleRepository.getBooks("catholic_org").then(setBooks);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("verbumcaro.theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    saveReaderState(reader);
    updateUrl(reader);
  }, [reader]);

  const title = useMemo(() => {
    const book = books.find((item) => item.code === reader.left.bookCode);

    return `${book?.name ?? "Bible"} ${reader.left.chapter}`;
  }, [books, reader.left.bookCode, reader.left.chapter]);

  function updateLeft(panel: PanelState) {
    setReader((state) => {
      const next = {
        ...state,
        left: panel,
        ...(state.parallel && state.sync === "off"
          ? {}
          : {})
      };

      return next;
    });
  }

  function updateRight(panel: PanelState) {
    setReader((state) => ({
      ...state,
      right: panel
    }));
  }

  function submitSearch() {
    const result = parseReference(search);

    if (!result) {
      return;
    }

    setReader((state) => {
      const nextLeft = result.translationId
        ? {
            ...result.panel
          }
        : {
            ...state.left,
            ...result.panel
          };

      const nextRight = result.translationId
        ? {
            ...result.panel,
            translationId:
              result.translationId === "catholic_org"
                ? "sigao"
                : "catholic_org"
          }
        : {
            ...state.right,
            bookCode: result.panel.bookCode,
            chapter: result.panel.chapter
          };

      return {
        ...state,
        left: nextLeft,
        right: nextRight
      };
    });

    setSearch("");
  }

  function syncVerse(verse: number) {
    if (reader.sync !== "verse") {
      return;
    }

    const target = document.querySelector(
      `.bible-panel:nth-child(2) [data-verse="${verse}"]`
    );

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  return (
    <AppShell>
      <Header
        dark={dark}
        onToggleTheme={() => setDark((value) => !value)}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
      />

      <main className="main-content">
        <ReaderToolbar
          title={title}
          sync={reader.sync === "verse"}
          parallel={reader.parallel}
          showHeadings={reader.showHeadings}
          onSync={() =>
            setReader((state) => ({
              ...state,
              sync: state.sync === "off" ? "verse" : "off"
            }))
          }
          onParallel={() =>
            setReader((state) => ({
              ...state,
              parallel: !state.parallel
            }))
          }
          onHeadings={() =>
            setReader((state) => ({
              ...state,
              showHeadings: !state.showHeadings
            }))
          }
        />

        <ParallelReader
          left={reader.left}
          right={reader.right}
          books={books}
          translations={translations}
          showHeadings={reader.showHeadings}
          sync={reader.sync === "verse"}
          parallel={reader.parallel}
          onLeftChange={updateLeft}
          onRightChange={updateRight}
          onSyncVerse={syncVerse}
        />
      </main>
    </AppShell>
  );
}
