export interface Verse {
  verse: number;
  heading: string | null;
  text: string;
  footnotes: string[];
}

export interface Chapter {
  translationId: string;
  book: string;
  chapter: number;
  verses: Verse[];
}

export interface Translation {
  id: string;
  name: string;
  language: string;
  languageName: string;
  direction: "ltr" | "rtl";
  hasHeadings: boolean;
  hasFootnotes: boolean;
  copyright?: string;
}

export interface Book {
  code: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
}

export interface BibleRepository {
  getTranslations(): Promise<Translation[]>;
  getBooks(translationId: string): Promise<Book[]>;
  getChapter(
    translationId: string,
    bookCode: string,
    chapter: number
  ): Promise<Chapter | null>;
}
