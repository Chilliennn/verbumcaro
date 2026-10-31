import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanEnglishToken,
  tokenizeEnglish,
  extractLemmaFromDefinition,
  isInflectionDefinition,
  formatInflectionDescription,
  analyzeEnglishWord,
  analyzeEnglish,
  loadEnglishExamples,
  clearEnglishLookupCache
} from "../../features/english/englishLookup";

describe("englishLookup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearEnglishLookupCache();
  });

  describe("cleanEnglishToken", () => {
    it("strips surrounding punctuation, quotes, and numbers while keeping internal apostrophes", () => {
      expect(cleanEnglishToken("beginning,")).toBe("beginning");
      expect(cleanEnglishToken("“heavens”")).toBe("heavens");
      expect(cleanEnglishToken("(earth)")).toBe("earth");
      expect(cleanEnglishToken("didn't")).toBe("didn't");
      expect(cleanEnglishToken("God's")).toBe("God's");
      expect(cleanEnglishToken("...light;")).toBe("light");
    });
  });

  describe("tokenizeEnglish", () => {
    it("splits text into cleaned English tokens", () => {
      const tokens = tokenizeEnglish("In the beginning God created the heavens and the earth.");
      expect(tokens).toEqual([
        "In",
        "the",
        "beginning",
        "God",
        "created",
        "the",
        "heavens",
        "and",
        "the",
        "earth"
      ]);
    });

    it("handles multiple spaces and newlines", () => {
      const tokens = tokenizeEnglish("  In \n\n the   beginning   was  the  Word  ");
      expect(tokens).toEqual(["In", "the", "beginning", "was", "the", "Word"]);
    });
  });

  describe("extractLemmaFromDefinition & isInflectionDefinition", () => {
    it("identifies inflection definitions and extracts base lemmas", () => {
      expect(isInflectionDefinition("simple past and past participle of create")).toBe(true);
      expect(extractLemmaFromDefinition("simple past and past participle of create")).toBe("create");

      expect(isInflectionDefinition("plural of heaven")).toBe(true);
      expect(extractLemmaFromDefinition("plural of heaven")).toBe("heaven");

      expect(isInflectionDefinition("first-person singular simple past indicative of be.")).toBe(true);
      expect(extractLemmaFromDefinition("first-person singular simple past indicative of be.")).toBe("be");

      expect(isInflectionDefinition("A position of power or influence")).toBe(false);
    });

    it("formats inflection descriptions", () => {
      expect(
        formatInflectionDescription("simple past and past participle of create")
      ).toBe("simple past and past participle");
      expect(
        formatInflectionDescription("plural of heaven")
      ).toBe("plural");
    });
  });

  describe("analyzeEnglishWord and analyzeEnglish", () => {
    it("analyzes a base word with DictionaryAPI and FreeDictionary data", async () => {
      const mockDictApi = [
        {
          word: "beginning",
          phonetic: "/bɪˈɡɪn.ɪŋ/",
          meanings: [
            {
              partOfSpeech: "noun",
              definitions: [
                {
                  definition: "The act of doing that which begins anything; commencement.",
                  example: "What was the beginning of the dispute?"
                }
              ],
              synonyms: ["start", "commencement"]
            }
          ]
        }
      ];

      const mockFreeDict = {
        word: "beginning",
        entries: [
          {
            partOfSpeech: "noun",
            senses: [
              {
                definition: "The act of doing that which begins anything; commencement."
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("dictionaryapi.dev") || url.includes("__dictionaryapi_dev")) {
          return new Response(JSON.stringify(mockDictApi), { status: 200 });
        }
        if (url.includes("freedictionaryapi") || url.includes("__freedictionary_en")) {
          return new Response(JSON.stringify(mockFreeDict), { status: 200 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const word = await analyzeEnglishWord("beginning");
      expect(word.surface).toBe("beginning");
      expect(word.partOfSpeech).toBe("noun");
      expect(word.pronunciation).toBe("bɪˈɡɪn.ɪŋ");
      expect(word.definitions).toContain("The act of doing that which begins anything; commencement.");
      expect(word.synonyms).toContain("start");
      expect(word.examples[0].english).toBe("What was the beginning of the dispute?");
    });

    it("resolves an inflected word (created) to its lemma (create)", async () => {
      const mockCreatedDictApi = [
        {
          word: "created",
          phonetic: "/kɹiˈeɪtɪd/",
          meanings: [
            {
              partOfSpeech: "verb",
              definitions: [
                {
                  definition: "To bring into existence.",
                  example: "You can create the color orange by mixing yellow and red."
                }
              ]
            }
          ]
        }
      ];

      const mockCreatedFreeDict = {
        word: "created",
        entries: [
          {
            partOfSpeech: "verb",
            senses: [
              {
                definition: "simple past and past participle of create"
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("created")) {
          if (url.includes("dictionaryapi") || url.includes("__dictionaryapi_dev")) {
            return new Response(JSON.stringify(mockCreatedDictApi), { status: 200 });
          }
          return new Response(JSON.stringify(mockCreatedFreeDict), { status: 200 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const word = await analyzeEnglishWord("created");
      expect(word.surface).toBe("created");
      expect(word.isInflected).toBe(true);
      expect(word.lemma).toBe("create");
      expect(word.inflection).toBe("simple past and past participle");
      expect(word.definitions).toContain("To bring into existence.");
    });

    it("tokenizes and analyzes a full verse", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        const match = url.match(/(?:entries\/en\/|word=)([^&/?]+)/);
        const term = match ? decodeURIComponent(match[1]) : "word";
        return new Response(
          JSON.stringify([
            {
              word: term,
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [{ definition: `definition of ${term}` }]
                }
              ]
            }
          ]),
          { status: 200 }
        );
      });

      const text = "In the beginning was the Word";
      const lookup = await analyzeEnglish(text);
      expect(lookup.text).toBe(text);
      expect(lookup.words.map((w) => w.surface)).toEqual([
        "In",
        "the",
        "beginning",
        "was",
        "the",
        "Word"
      ]);
      expect(lookup.words[2].definitions[0]).toBe("definition of beginning");
    });
  });

  describe("loadEnglishExamples", () => {
    it("fetches examples from Tatoeba if fewer than 2 exist", async () => {
      const mockTatoeba = {
        data: [
          { text: "Hashem created everything." },
          { text: "He created a masterpiece." }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockTatoeba), { status: 200 })
      );

      const word = await loadEnglishExamples({
        surface: "created",
        lemma: "create",
        partOfSpeech: "verb",
        definitions: ["to bring into existence"],
        examples: []
      });

      expect(word.examples.length).toBe(2);
      expect(word.examples[0].english).toBe("Hashem created everything.");
    });
  });
});
