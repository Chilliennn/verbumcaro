import { describe, it, expect, vi, beforeEach } from "vitest";
import { bibleRepository } from "../../lib/bible/staticRepository";
import type { Translation, Book, Chapter, Verse } from "../../lib/bible/repository";

describe("staticRepository", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTranslations", () => {
    it("returns all 4 translations", async () => {
      const translations = await bibleRepository.getTranslations();
      expect(translations).toHaveLength(4);
      expect(translations.map(t => t.id)).toEqual(["catholic_org", "sigao", "shinkyo", "vulgate"]);
    });

    it("returns correct translation properties", async () => {
      const translations = await bibleRepository.getTranslations();
      const catholic = translations.find(t => t.id === "catholic_org");
      expect(catholic).toEqual({
        id: "catholic_org",
        name: "New Jerusalem Bible",
        language: "en",
        languageName: "English",
        direction: "ltr",
        hasHeadings: false,
        hasFootnotes: false
      });

      const sigao = translations.find(t => t.id === "sigao");
      expect(sigao).toEqual({
        id: "sigao",
        name: "思高圣经",
        language: "zh-Hans",
        languageName: "简体中文",
        direction: "ltr",
        hasHeadings: true,
        hasFootnotes: false
      });
    });
  });

  describe("getBooks", () => {
    it("returns all 73 books", async () => {
      const books = await bibleRepository.getBooks("catholic_org");
      expect(books).toHaveLength(73);
    });

    it("returns correct book structure", async () => {
      const books = await bibleRepository.getBooks("catholic_org");
      const gen = books.find(b => b.code === "GEN");
      expect(gen).toEqual({
        code: "GEN",
        name: "Genesis",
        testament: "OT",
        chapters: 50
      });

      const jhn = books.find(b => b.code === "JHN");
      expect(jhn).toEqual({
        code: "JHN",
        name: "John",
        testament: "NT",
        chapters: 21
      });
    });

    it("includes deuterocanonical books", async () => {
      const books = await bibleRepository.getBooks("catholic_org");
      const codes = books.map(b => b.code);
      expect(codes).toContain("TOB");
      expect(codes).toContain("JDT");
      expect(codes).toContain("1MA");
      expect(codes).toContain("2MA");
      expect(codes).toContain("WIS");
      expect(codes).toContain("SIR");
      expect(codes).toContain("BAR");
    });
  });

  describe("getChapter", () => {
    const mockChapter: Chapter = {
      translationId: "catholic_org",
      book: "JHN",
      chapter: 3,
      verses: [
        { verse: 16, heading: null, text: "For God so loved the world...", footnotes: [] },
        { verse: 17, heading: null, text: "For God did not send his Son...", footnotes: [] }
      ]
    };

    it("fetches chapter from correct URL", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockChapter)
      });

      const chapter = await bibleRepository.getChapter("catholic_org", "JHN", 3);

      expect(mockFetch).toHaveBeenCalledWith("/data/translations/catholic_org/JHN/3.json");
      expect(chapter).toEqual(mockChapter);
    });

    it("returns null for 404 response", async () => {
      mockFetch.mockResolvedValue({
        ok: false
      });

      const chapter = await bibleRepository.getChapter("catholic_org", "JHN", 999);
      expect(chapter).toBeNull();
    });

    it("returns null on network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const chapter = await bibleRepository.getChapter("catholic_org", "JHN", 3);
      expect(chapter).toBeNull();
    });

    it("handles different translations", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockChapter)
      });

      await bibleRepository.getChapter("sigao", "JHN", 3);
      expect(mockFetch).toHaveBeenCalledWith("/data/translations/sigao/JHN/3.json");

      await bibleRepository.getChapter("vulgate", "GEN", 1);
      expect(mockFetch).toHaveBeenCalledWith("/data/translations/vulgate/GEN/1.json");
    });
  });
});