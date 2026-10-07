import type {
  BibleRepository,
  Book,
  Chapter,
  Translation
} from "./repository";
import { translations } from "../data/translations";
import { canon } from "../data/canon";

class StaticBibleRepository implements BibleRepository {
  async getTranslations(): Promise<Translation[]> {
    return translations;
  }

  async getBooks(_translationId: string): Promise<Book[]> {
    return canon;
  }

  async getChapter(
    translationId: string,
    bookCode: string,
    chapter: number
  ): Promise<Chapter | null> {
    try {
      const response = await fetch(
        `/data/translations/${translationId}/${bookCode}/${chapter}.json`
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as Chapter;
    } catch {
      return null;
    }
  }
}

export const bibleRepository = new StaticBibleRepository();
