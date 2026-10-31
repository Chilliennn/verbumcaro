import { describe, it, expect } from "vitest";
import {
  parseReference,
  parseSearchQuery,
  normalizeSearchQuery,
  resolveBookCode,
  extractLanguageModifiers,
  extractScriptureCitation
} from "../../features/references/parser";

describe("normalizeSearchQuery", () => {
  it("trims whitespace", () => {
    expect(normalizeSearchQuery("  John 3:16  ")).toBe("John 3:16");
  });

  it("normalizes unicode", () => {
    expect(normalizeSearchQuery("Ｊｏｈｎ　３：１６")).toBe("John 3:16");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeSearchQuery("John    3:16")).toBe("John 3:16");
  });
});

describe("resolveBookCode", () => {
  it("resolves standard English book names", () => {
    expect(resolveBookCode("Genesis")).toBe("GEN");
    expect(resolveBookCode("John")).toBe("JHN");
    expect(resolveBookCode("1 Corinthians")).toBe("1CO");
    expect(resolveBookCode("Revelation")).toBe("REV");
  });

  it("resolves abbreviated English book names", () => {
    expect(resolveBookCode("Gen")).toBe("GEN");
    expect(resolveBookCode("Jn")).toBe("JHN");
    expect(resolveBookCode("1Cor")).toBe("1CO");
    expect(resolveBookCode("Rev")).toBe("REV");
  });

  it("resolves Chinese book names", () => {
    expect(resolveBookCode("创世记")).toBe("GEN");
    expect(resolveBookCode("约伯记")).toBe("JOB");
    expect(resolveBookCode("约翰福音")).toBe("JHN");
  });

  it("resolves Japanese book names", () => {
    expect(resolveBookCode("創世記")).toBe("GEN");
    expect(resolveBookCode("ヨハネによる福音書")).toBe("JHN");
  });

  it("returns null for unknown books", () => {
    expect(resolveBookCode("UnknownBook")).toBeNull();
    expect(resolveBookCode("")).toBeNull();
  });

  it("is case insensitive", () => {
    expect(resolveBookCode("genesis")).toBe("GEN");
    expect(resolveBookCode("GENESIS")).toBe("GEN");
  });
});

describe("extractLanguageModifiers", () => {
  it("extracts sigao translation tag", () => {
    const result = extractLanguageModifiers("John 3:16 @sigao");
    expect(result.translationId).toBe("sigao");
    expect(result.reference).toBe("John 3:16");
  });

  it("extracts catholic_org translation tag", () => {
    const result = extractLanguageModifiers("John 3:16 @catholic");
    expect(result.translationId).toBe("catholic_org");
    expect(result.reference).toBe("John 3:16");
  });

  it("extracts Chinese tag", () => {
    const result = extractLanguageModifiers("John 3:16 #思高");
    expect(result.translationId).toBe("sigao");
    expect(result.reference).toBe("John 3:16");
  });

  it("handles multiple tags", () => {
    const result = extractLanguageModifiers("John 3:16 @sigao @catholic");
    expect(result.translationId).toBe("sigao");
    expect(result.rightTranslationId).toBe("catholic_org");
  });

  it("extracts parallel translations in correct left-to-right order with slash syntax", () => {
    const result = extractLanguageModifiers("gen 1 /eng lat");
    expect(result.reference).toBe("gen 1");
    expect(result.translationId).toBe("catholic_org");
    expect(result.rightTranslationId).toBe("vulgate");
  });

  it("extracts parallel translations when order is reversed", () => {
    const result = extractLanguageModifiers("gen 1 /lat eng");
    expect(result.reference).toBe("gen 1");
    expect(result.translationId).toBe("vulgate");
    expect(result.rightTranslationId).toBe("catholic_org");
  });
});

describe("parseReference", () => {
  it("parses simple book chapter:verse", () => {
    const result = parseReference("John 3:16");
    expect(result).toEqual({
      panel: { bookCode: "JHN", chapter: 3 },
      verse: 16,
      verseEnd: undefined,
      translationId: undefined,
      rightTranslationId: undefined
    });
  });

  it("parses book chapter with verse range", () => {
    const result = parseReference("John 3:16-18");
    expect(result?.verse).toBe(16);
    expect(result?.verseEnd).toBe(18);
  });

  it("parses book chapter only", () => {
    const result = parseReference("John 3");
    expect(result).toEqual({
      panel: { bookCode: "JHN", chapter: 3 },
      verse: undefined,
      verseEnd: undefined,
      translationId: undefined,
      rightTranslationId: undefined
    });
  });

  it("parses with Chinese book names", () => {
    const result = parseReference("约翰福音 3:16");
    expect(result?.panel.bookCode).toBe("JHN");
    expect(result?.panel.chapter).toBe(3);
    expect(result?.verse).toBe(16);
  });

  it("parses with Japanese book names", () => {
    const result = parseReference("ヨハネによる福音書 3:16");
    expect(result?.panel.bookCode).toBe("JHN");
    expect(result?.panel.chapter).toBe(3);
    expect(result?.verse).toBe(16);
  });

  it("parses numbered books", () => {
    const result = parseReference("1 Corinthians 13:4");
    expect(result?.panel.bookCode).toBe("1CO");
    expect(result?.panel.chapter).toBe(13);
    expect(result?.verse).toBe(4);
  });

  it("returns null for invalid references", () => {
    expect(parseReference("InvalidBook 1:1")).toBeNull();
    expect(parseReference("Not a reference")).toBeNull();
  });

  it("handles translation tags", () => {
    const result = parseReference("John 3:16 @sigao");
    expect(result?.translationId).toBe("sigao");
  });

  it("handles parallel translation tags with correct panel mapping", () => {
    const result = parseReference("gen 1 /eng lat");
    expect(result?.panel.bookCode).toBe("GEN");
    expect(result?.panel.chapter).toBe(1);
    expect(result?.translationId).toBe("catholic_org");
    expect(result?.rightTranslationId).toBe("vulgate");
  });

  it("defaults to chapter 1 for book-only queries", () => {
    const result = parseReference("John");
    expect(result?.panel.chapter).toBe(1);
  });
});

describe("parseSearchQuery", () => {
  it("parses single reference", () => {
    const results = parseSearchQuery("John 3:16");
    expect(results).toHaveLength(1);
    expect(results[0].panel.bookCode).toBe("JHN");
    expect(results[0].panel.chapter).toBe(3);
    expect(results[0].verse).toBe(16);
  });

  it("parses multiple references separated by comma", () => {
    const results = parseSearchQuery("John 3:16, Romans 8:28");
    expect(results).toHaveLength(2);
    expect(results[0].panel.bookCode).toBe("JHN");
    expect(results[1].panel.bookCode).toBe("ROM");
  });

  it("parses multiple references separated by semicolon", () => {
    const results = parseSearchQuery("John 3:16; Romans 8:28");
    expect(results).toHaveLength(2);
  });

  it("carries over book code for naked chapter:verse", () => {
    const results = parseSearchQuery("John 3:16, 4:5");
    expect(results).toHaveLength(2);
    expect(results[0].panel.bookCode).toBe("JHN");
    expect(results[0].panel.chapter).toBe(3);
    expect(results[1].panel.bookCode).toBe("JHN");
    expect(results[1].panel.chapter).toBe(4);
  });

  it("handles Chinese separators", () => {
    const results = parseSearchQuery("约翰福音 3:16，罗马书 8:28");
    expect(results).toHaveLength(2);
  });

  it("handles empty parts gracefully", () => {
    const results = parseSearchQuery("John 3:16, , Romans 8:28");
    expect(results).toHaveLength(2);
  });

  it("parses John 6:35, 38 into John 6:35 and John 6:38", () => {
    const results = parseSearchQuery("John 6:35, 38");
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      panel: { bookCode: "JHN", chapter: 6 },
      verse: 35,
      verseEnd: undefined,
      translationId: undefined,
      rightTranslationId: undefined
    });
    expect(results[1]).toEqual({
      panel: { bookCode: "JHN", chapter: 6 },
      verse: 38,
      verseEnd: undefined,
      translationId: undefined,
      rightTranslationId: undefined
    });
  });

  it("only renders a chapter if the number ends with ':'", () => {
    const results = parseSearchQuery("John 6:35, 7:");
    expect(results).toHaveLength(2);
    expect(results[0].panel.chapter).toBe(6);
    expect(results[0].verse).toBe(35);
    expect(results[1].panel.chapter).toBe(7);
    expect(results[1].verse).toBeUndefined();
  });

  it("handles verse ranges following a chapter:verse reference", () => {
    const results = parseSearchQuery("John 6:35, 38-40");
    expect(results).toHaveLength(2);
    expect(results[0].verse).toBe(35);
    expect(results[1].panel.chapter).toBe(6);
    expect(results[1].verse).toBe(38);
    expect(results[1].verseEnd).toBe(40);
  });

  it("handles parallel translation query preserving left and right panel translations", () => {
    const results = parseSearchQuery("gen 1 /eng lat");
    expect(results).toHaveLength(1);
    expect(results[0].panel.bookCode).toBe("GEN");
    expect(results[0].panel.chapter).toBe(1);
    expect(results[0].translationId).toBe("catholic_org");
    expect(results[0].rightTranslationId).toBe("vulgate");
  });
});

describe("extractScriptureCitation", () => {
  it("extracts clean Scripture citation with suffix notes", () => {
    const res = extractScriptureCitation("John 1:1 (Vulgate: In principio erat Verbum)");
    expect(res).not.toBeNull();
    expect(res?.reference).toBe("John 1:1");
    expect(res?.parsed.panel.bookCode).toBe("JHN");
    expect(res?.parsed.panel.chapter).toBe(1);
    expect(res?.parsed.verse).toBe(1);
    expect(res?.suffixText).toBe("(Vulgate: In principio erat Verbum)");
  });

  it("extracts citation with verse range", () => {
    const res = extractScriptureCitation("Luke 2:25-32 (Nunc Dimittis)");
    expect(res).not.toBeNull();
    expect(res?.reference).toBe("Luke 2:25-32");
    expect(res?.parsed.panel.bookCode).toBe("LUK");
    expect(res?.parsed.panel.chapter).toBe(2);
    expect(res?.parsed.verse).toBe(25);
    expect(res?.parsed.verseEnd).toBe(32);
  });

  it("extracts citation with prefix text", () => {
    const res = extractScriptureCitation("CCC 1376 / John 6:51");
    expect(res).not.toBeNull();
    expect(res?.reference).toBe("John 6:51");
    expect(res?.prefixText).toBe("CCC 1376 /");
  });

  it("returns null for non-Scripture citations", () => {
    expect(extractScriptureCitation("Council of Trent (1546), CCC 120")).toBeNull();
    expect(extractScriptureCitation("General Instruction of the Roman Missal (GIRM 346d)")).toBeNull();
  });
});
