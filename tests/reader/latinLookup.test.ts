import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanLatinToken,
  tokenizeLatin,
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

  describe("analyzeLatinWord and analyzeLatin", () => {
    it("parses FreeDictionaryAPI data properly", async () => {
      const mockFdResponse = {
        word: "verbum",
        entries: [
          {
            partOfSpeech: "noun",
            pronunciations: [{ text: "/ˈwer.bum/", type: "IPA" }],
            forms: [{ word: "verbum", tags: ["nominative", "singular"] }],
            senses: [
              {
                definition: "a word",
                tags: ["neuter"],
                quotes: [
                  {
                    text: "In principio erat Verbum",
                    reference: "Vulgate, John 1:1",
                    translation: "In the beginning was the Word"
                  }
                ]
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("freedictionaryapi") || url.includes("__freedictionary")) {
          return new Response(JSON.stringify(mockFdResponse), { status: 200 });
        }
        return new Response(JSON.stringify([]), { status: 404 });
      });

      const word = await analyzeLatinWord("Verbum,");
      expect(word.surface).toBe("Verbum,");
      expect(word.partOfSpeech).toBe("noun");
      expect(word.pronunciation).toBe("ˈwer.bum");
      expect(word.definitions).toContain("a word");
      expect(word.examples).toHaveLength(1);
      expect(word.examples[0].latin).toBe("In principio erat Verbum");
      expect(word.examples[0].reference).toBe("Vulgate, John 1:1");
    });

    it("enriches definitions with Latin WordNet synsets", async () => {
      const mockFdResponse = {
        word: "virtus",
        entries: [
          {
            partOfSpeech: "noun",
            senses: [{ definition: "manliness, virtue" }]
          }
        ]
      };

      const mockLwnResponse = [
        {
          lemma: "virtus",
          pos: "n",
          synsets: [
            { definition: "the trait of excellence in moral and physical qualities" }
          ]
        }
      ];

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("freedictionaryapi") || url.includes("__freedictionary")) {
          return new Response(JSON.stringify(mockFdResponse), { status: 200 });
        }
        if (url.includes("latinwordnet") || url.includes("__latinwordnet")) {
          return new Response(JSON.stringify(mockLwnResponse), { status: 200 });
        }
        return new Response(JSON.stringify([]), { status: 404 });
      });

      const result = await analyzeLatin("virtus");
      expect(result.words).toHaveLength(1);
      expect(result.words[0].definitions).toContain("manliness, virtue");
      expect(result.words[0].definitions).toContain(
        "the trait of excellence in moral and physical qualities"
      );
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

