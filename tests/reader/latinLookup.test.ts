import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanLatinToken,
  tokenizeLatin,
  normalizeLatinLemma,
  extractLemmaFromDefinition,
  analyzeLatinWord,
  analyzeLatin,
  loadLatinExamples
} from "../../features/latin/latinLookup";

describe("latinLookup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("cleanLatinToken", () => {
    it("strips surrounding punctuation and numbers", () => {
      expect(cleanLatinToken("verbum,")).toBe("verbum");
      expect(cleanLatinToken("«principio»")).toBe("principio");
      expect(cleanLatinToken("(Deus)")).toBe("Deus");
      expect(cleanLatinToken("erat.")).toBe("erat");
      expect(cleanLatinToken("...terram;")).toBe("terram");
    });

    it("preserves accents / macron letters", () => {
      expect(cleanLatinToken("creāvit")).toBe("creāvit");
    });
  });

  describe("tokenizeLatin", () => {
    it("splits text into cleaned Latin tokens", () => {
      const tokens = tokenizeLatin("In principio creavit Deus caelum et terram.");
      expect(tokens).toEqual([
        "In",
        "principio",
        "creavit",
        "Deus",
        "caelum",
        "et",
        "terram"
      ]);
    });

    it("handles multiple spaces and newlines", () => {
      const tokens = tokenizeLatin("  In \n\n principio   erat   Verbum  ");
      expect(tokens).toEqual(["In", "principio", "erat", "Verbum"]);
    });
  });

  describe("normalizeLatinLemma & extractLemmaFromDefinition", () => {
    it("normalizes macrons, accents, and ligatures to ASCII search keys", () => {
      expect(normalizeLatinLemma("creō")).toBe("creo");
      expect(normalizeLatinLemma("lūx")).toBe("lux");
      expect(normalizeLatinLemma("tenebræ")).toBe("tenebrae");
      expect(normalizeLatinLemma("factus:")).toBe("factus");
      expect(normalizeLatinLemma("prīncipium")).toBe("principium");
    });

    it("extracts lemma from various Wiktionary definition patterns", () => {
      expect(
        extractLemmaFromDefinition("third-person singular perfect active indicative of creō")
      ).toBe("creō");
      expect(
        extractLemmaFromDefinition("nominative/accusative/vocative plural of verbum")
      ).toBe("verbum");
      expect(
        extractLemmaFromDefinition("singular of tenebrae (“darkness, shadow; ignorance; concealment”)")
      ).toBe("tenebrae");
      expect(
        extractLemmaFromDefinition("inflection of factus:")
      ).toBe("factus");
    });
  });

  describe("analyzeLatinWord and analyzeLatin", () => {
    it("resolves an inflected past tense word (creavit) to original lemma (creō) and its definitions", async () => {
      const mockCreavitResponse = {
        word: "creavit",
        entries: [
          {
            partOfSpeech: "verb",
            forms: [{ word: "creāvit", tags: ["canonical"] }],
            senses: [
              {
                definition: "third-person singular perfect active indicative of creō",
                tags: ["active", "form of", "indicative", "perfect", "singular", "third person"]
              }
            ]
          }
        ]
      };

      const mockCreoResponse = {
        word: "creo",
        entries: [
          {
            partOfSpeech: "verb",
            pronunciations: [{ text: "[ˈkre.oː]", type: "ipa" }],
            forms: [
              { word: "creō", tags: ["canonical"] },
              { word: "creāre", tags: ["infinitive", "present"] },
              { word: "creāvī", tags: ["active", "perfect"] },
              { word: "creātum", tags: ["supine"] }
            ],
            senses: [
              {
                definition: "to create, to give existence to, to form, to make, to produce",
                tags: ["conjugation 1"]
              },
              {
                definition: "to cause, to prepare, to occasion",
                tags: ["conjugation 1"]
              }
            ]
          }
        ]
      };

      const mockCreoWordNet = {
        count: 1,
        results: [
          {
            lemma: "creo",
            pos: "v",
            synsets: {
              literal: [
                {
                  gloss: 'bring into existence: "The company was created 25 years ago"'
                }
              ]
            }
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("/creavit") || url.includes("word=creavit")) {
          return new Response(JSON.stringify(mockCreavitResponse), { status: 200 });
        }
        if (url.includes("/creo") || url.includes("word=creo")) {
          return new Response(JSON.stringify(mockCreoResponse), { status: 200 });
        }
        if (url.includes("latinwordnet") || url.includes("__latinwordnet")) {
          return new Response(JSON.stringify(mockCreoWordNet), { status: 200 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const word = await analyzeLatinWord("creavit");
      expect(word.surface).toBe("creavit");
      expect(word.isInflected).toBe(true);
      expect(word.lemma).toBe("creō");
      expect(word.inflection).toBe("third-person singular perfect active indicative");
      expect(word.pronunciation).toBe("ˈkre.oː");
      expect(word.principalParts).toEqual(["creō", "creāre", "creāvī", "creātum"]);
      // Definitions MUST be the original word's definition
      expect(word.definitions).toContain(
        "to create, to give existence to, to form, to make, to produce"
      );
      expect(word.definitions).toContain("bring into existence");
    });

    it("resolves plural noun (verba) to original lemma (verbum) and retrieves synsets with classical spelling", async () => {
      const mockVerbaResponse = {
        word: "verba",
        entries: [
          {
            partOfSpeech: "noun",
            senses: [
              {
                definition: "nominative/accusative/vocative plural of verbum",
                tags: ["accusative", "form of", "nominative", "plural", "vocative"]
              }
            ]
          }
        ]
      };

      const mockVerbumResponse = {
        word: "verbum",
        entries: [
          {
            partOfSpeech: "noun",
            pronunciations: [{ text: "[ˈwɛr.bũː]", type: "ipa" }],
            forms: [
              { word: "verbum", tags: ["canonical"] },
              { word: "verbī", tags: ["genitive"] }
            ],
            senses: [
              {
                definition: "a word",
                tags: ["neuter"]
              }
            ]
          }
        ]
      };

      const mockUerbumWordNet = {
        count: 1,
        results: [
          {
            lemma: "uerbum",
            pos: "n",
            synsets: {
              literal: [
                {
                  gloss: 'a promise: "he gave his word"'
                }
              ]
            }
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("/verba") || url.includes("word=verba")) {
          return new Response(JSON.stringify(mockVerbaResponse), { status: 200 });
        }
        if (url.includes("/verbum") || url.includes("word=verbum")) {
          return new Response(JSON.stringify(mockVerbumResponse), { status: 200 });
        }
        // Latin WordNet query for verbum returns 0, but query for uerbum returns results
        if (url.includes("uerbum")) {
          return new Response(JSON.stringify(mockUerbumWordNet), { status: 200 });
        }
        if (url.includes("latinwordnet") || url.includes("__latinwordnet")) {
          return new Response(JSON.stringify({ count: 0, results: [] }), { status: 200 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const word = await analyzeLatinWord("verba");
      expect(word.surface).toBe("verba");
      expect(word.isInflected).toBe(true);
      expect(word.lemma).toBe("verbum");
      expect(word.inflection).toBe("nominative/accusative/vocative plural");
      expect(word.definitions).toContain("a word");
      expect(word.definitions).toContain("a promise");
    });
  });

  describe("loadLatinExamples", () => {
    it("fetches additional examples from Tatoeba if fewer than 2 examples exist", async () => {
      const mockTatoeba = {
        data: [
          {
            text: "Verba volant, scripta manent.",
            translations: [{ text: "Words fly away, the written word remains." }]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockTatoeba), { status: 200 })
      );

      const word = await loadLatinExamples({
        surface: "verba",
        partOfSpeech: "noun",
        definitions: ["words"],
        examples: []
      });

      expect(word.examples.length).toBeGreaterThan(0);
      expect(word.examples[0].latin).toBe("Verba volant, scripta manent.");
      expect(word.examples[0].english).toBe("Words fly away, the written word remains.");
    });
  });
});
