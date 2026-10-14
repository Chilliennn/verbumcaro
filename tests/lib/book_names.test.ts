import { describe, it, expect } from "vitest";
import { getBookName, getBookLanguageName, BOOK_NAMES } from "../../lib/data/book_names";
import type { BookLanguage } from "../../lib/data/book_names";

describe("book_names", () => {
  describe("BOOK_NAMES", () => {
    it("contains all 73 books", () => {
      expect(Object.keys(BOOK_NAMES)).toHaveLength(73);
    });

    it("each book has all 4 languages", () => {
      for (const [, names] of Object.entries(BOOK_NAMES)) {
        expect(names).toHaveProperty("en");
        expect(names).toHaveProperty("zh");
        expect(names).toHaveProperty("ja");
        expect(names).toHaveProperty("la");
      }
    });

    it("has correct names for key books", () => {
      expect(BOOK_NAMES.GEN.en).toBe("Genesis");
      expect(BOOK_NAMES.GEN.zh).toBe("创世纪");
      expect(BOOK_NAMES.GEN.ja).toBe("創世記");
      expect(BOOK_NAMES.GEN.la).toBe("Genesis");

      expect(BOOK_NAMES.JHN.en).toBe("John");
      expect(BOOK_NAMES.JHN.zh).toBe("若望福音");
      expect(BOOK_NAMES.JHN.ja).toBe("ヨハネによる福音書");
      expect(BOOK_NAMES.JHN.la).toBe("Ioannem");

      expect(BOOK_NAMES.PSA.en).toBe("Psalms");
      expect(BOOK_NAMES.REV.en).toBe("Revelation");
    });
  });

  describe("getBookName", () => {
    it("returns English name by default", () => {
      expect(getBookName("GEN", "en")).toBe("Genesis");
      expect(getBookName("JHN", "en")).toBe("John");
    });

    it("returns Chinese name for zh", () => {
      expect(getBookName("GEN", "zh")).toBe("创世纪");
      expect(getBookName("JHN", "zh")).toBe("若望福音");
    });

    it("returns Japanese name for ja", () => {
      expect(getBookName("GEN", "ja")).toBe("創世記");
      expect(getBookName("JHN", "ja")).toBe("ヨハネによる福音書");
    });

    it("returns Latin name for la", () => {
      expect(getBookName("GEN", "la")).toBe("Genesis");
      expect(getBookName("JHN", "la")).toBe("Ioannem");
    });

    it("falls back to English for unknown language", () => {
      expect(getBookName("GEN", "fr" as BookLanguage)).toBe("Genesis");
    });

    it("falls back to English for unknown book code", () => {
      expect(getBookName("UNKNOWN", "en")).toBe("UNKNOWN");
    });
  });

  describe("getBookLanguageName", () => {
    it("returns zh for Chinese languages", () => {
      expect(getBookLanguageName("zh")).toBe("zh");
      expect(getBookLanguageName("zh-Hans")).toBe("zh");
      expect(getBookLanguageName("zh-Hant")).toBe("zh");
    });

    it("returns ja for Japanese", () => {
      expect(getBookLanguageName("ja")).toBe("ja");
    });

    it("returns la for Latin", () => {
      expect(getBookLanguageName("la")).toBe("la");
    });

    it("returns en for English and others", () => {
      expect(getBookLanguageName("en")).toBe("en");
      expect(getBookLanguageName("fr")).toBe("en");
      expect(getBookLanguageName("es")).toBe("en");
    });
  });
});