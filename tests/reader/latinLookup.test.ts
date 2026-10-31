import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanLatinToken,
  tokenizeLatin,
  normalizeLatinLemma,
  getLatinSearchCandidates,
  extractLemmaFromDefinition,
  formatInflectionDescription,
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

    it("tokenizes sentence with punctuation and colons properly", () => {
      const sentence =
        "Litigabant ergo Judæi ad invicem, dicentes: Quomodo potest hic nobis carnem suam dare ad manducandum";
      const tokens = tokenizeLatin(sentence);
      expect(tokens).toEqual([
        "Litigabant",
        "ergo",
        "Judæi",
        "ad",
        "invicem",
        "dicentes",
        "Quomodo",
        "potest",
        "hic",
        "nobis",
        "carnem",
        "suam",
        "dare",
        "ad",
        "manducandum"
      ]);
      expect(tokens).toHaveLength(15);
    });
  });

  describe("getLatinSearchCandidates", () => {
    it("generates ligature-expanded and classical orthography variants for vitæ", () => {
      const candidates = getLatinSearchCandidates("vitæ");
      expect(candidates).toContain("vitae");
      expect(candidates[0]).toBe("vitae");
    });

    it("generates candidates for Judæi with ligature expansion and j->i substitution", () => {
      const candidates = getLatinSearchCandidates("Judæi");
      expect(candidates).toContain("judaei");
      expect(candidates).toContain("iudaei");
    });

    it("generates ligature-expanded variants for cœlum", () => {
      const candidates = getLatinSearchCandidates("cœlum");
      expect(candidates).toContain("coelum");
    });
  });

  describe("formatInflectionDescription", () => {
    it("formats inflection with subsenses (e.g. vitae)", () => {
      const subsenses = [
        { definition: "nominative/vocative plural" },
        { definition: "genitive/dative singular" }
      ];
      expect(formatInflectionDescription("inflection of vīta:", [], subsenses)).toBe(
        "nominative/vocative plural, genitive/dative singular"
      );
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

    it("resolves words with ligatures like vitæ to lemma vīta and its definitions", async () => {
      const mockVitaeResponse = {
        word: "vitae",
        entries: [
          {
            partOfSpeech: "noun",
            forms: [{ word: "vītae", tags: ["canonical", "feminine"] }],
            senses: [
              {
                definition: "inflection of vīta:",
                subsenses: [
                  { definition: "nominative/vocative plural", tags: ["form of", "nominative", "plural", "vocative"] },
                  { definition: "genitive/dative singular", tags: ["dative", "form of", "genitive", "singular"] }
                ]
              }
            ]
          }
        ]
      };

      const mockVitaResponse = {
        word: "vita",
        entries: [
          {
            partOfSpeech: "noun",
            pronunciations: [{ text: "[ˈwiː.ta]", type: "ipa" }],
            forms: [
              { word: "vīta", tags: ["canonical", "feminine"] },
              { word: "vītae", tags: ["genitive"] }
            ],
            senses: [
              {
                definition: "life",
                tags: ["declension 1"]
              },
              {
                definition: "a way of life",
                tags: ["declension 1"]
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        // Direct query for vitæ returns 0 entries, mimicking freedictionaryapi.com
        if (url.includes("/vit%C3%A6") || url.includes("word=vit%C3%A6")) {
          return new Response(JSON.stringify({ word: "vitæ", entries: [] }), { status: 200 });
        }
        // Ligature-expanded query for vitae returns the inflection
        if (url.includes("/vitae") || url.includes("word=vitae")) {
          return new Response(JSON.stringify(mockVitaeResponse), { status: 200 });
        }
        // Lemma query for vita returns the definitions
        if (url.includes("/vita") || url.includes("word=vita")) {
          return new Response(JSON.stringify(mockVitaResponse), { status: 200 });
        }
        return new Response(JSON.stringify({ count: 0, results: [] }), { status: 200 });
      });

      const word = await analyzeLatinWord("vitæ");
      expect(word.surface).toBe("vitæ");
      expect(word.isInflected).toBe(true);
      expect(word.lemma).toBe("vīta");
      expect(word.inflection).toBe("nominative/vocative plural, genitive/dative singular");
      expect(word.partOfSpeech).toBe("noun");
      expect(word.definitions).toContain("life");
      expect(word.definitions).toContain("a way of life");
    });

    it("resolves words with ligatures and j/i interchange like Judæi", async () => {
      const mockIudaeiResponse = {
        word: "iudaei",
        entries: [
          {
            partOfSpeech: "adjective",
            forms: [{ word: "iūdaeī", tags: ["canonical"] }],
            senses: [
              {
                definition: "inflection of iūdaeus:",
                subsenses: [
                  { definition: "nominative/vocative masculine plural", tags: ["form of", "masculine", "nominative", "plural", "vocative"] }
                ]
              }
            ]
          }
        ]
      };

      const mockIudaeusResponse = {
        word: "iudaeus",
        entries: [
          {
            partOfSpeech: "noun",
            pronunciations: [{ text: "[juːˈdae̯.ʊs]", type: "ipa" }],
            forms: [
              { word: "iūdaeus", tags: ["canonical", "masculine"] },
              { word: "iūdaeī", tags: ["genitive"] }
            ],
            senses: [
              {
                definition: "a Judaean, Jew",
                tags: ["declension 2"]
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("iudaei") || url.includes("word=iudaei")) {
          return new Response(JSON.stringify(mockIudaeiResponse), { status: 200 });
        }
        if (url.includes("iudaeus") || url.includes("word=iudaeus")) {
          return new Response(JSON.stringify(mockIudaeusResponse), { status: 200 });
        }
        return new Response(JSON.stringify({ word: "none", entries: [] }), { status: 200 });
      });

      const word = await analyzeLatinWord("Judæi");
      expect(word.surface).toBe("Judæi");
      expect(word.isInflected).toBe(true);
      expect(word.lemma).toBe("iūdaeus");
      expect(word.inflection).toBe("nominative/vocative masculine plural");
      expect(word.definitions).toContain("a Judaean, Jew");
    });

    it("preserves participle definitions even when tagged with 'form of' (dicens)", async () => {
      const mockDicensResponse = {
        word: "dicens",
        entries: [
          {
            partOfSpeech: "verb",
            forms: [{ word: "dīcēns", tags: ["canonical"] }],
            senses: [
              {
                definition: "saying, uttering, mentioning, speaking, talking",
                tags: ["active", "declension 3", "form of", "one termination", "participle", "present"]
              },
              {
                definition: "declaring, stating",
                tags: ["active", "declension 3", "form of", "one termination", "participle", "present"]
              }
            ]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockDicensResponse), { status: 200 })
      );

      const word = await analyzeLatinWord("dicens");
      expect(word.definitions).toContain("saying, uttering, mentioning, speaking, talking");
      expect(word.definitions).toContain("declaring, stating");
    });

    it("analyzes all words in a 15-word sentence beyond the previous 8-word cutoff", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        const match = url.match(/(?:entries\/la\/|word=)([^&/?]+)/);
        const term = match ? decodeURIComponent(match[1]) : "word";
        return new Response(
          JSON.stringify({
            word: term,
            entries: [
              {
                partOfSpeech: "noun",
                senses: [{ definition: `definition of ${term}` }]
              }
            ]
          }),
          { status: 200 }
        );
      });

      const sentence =
        "Litigabant ergo Judæi ad invicem, dicentes: Quomodo potest hic nobis carnem suam dare ad manducandum";
      const result = await analyzeLatin(sentence);

      // Must analyze all 15 words rather than stopping at potest (word 8)
      expect(result.words).toHaveLength(15);
      const surfaces = result.words.map((w) => w.surface);
      expect(surfaces).toEqual([
        "Litigabant",
        "ergo",
        "Judæi",
        "ad",
        "invicem",
        "dicentes",
        "Quomodo",
        "potest",
        "hic",
        "nobis",
        "carnem",
        "suam",
        "dare",
        "ad",
        "manducandum"
      ]);

      // Words after potest (hic, nobis, carnem, suam, dare, ad, manducandum) must be present with definitions
      const potestIndex = surfaces.indexOf("potest");
      expect(potestIndex).toBe(7);
      expect(surfaces.slice(8)).toEqual([
        "hic",
        "nobis",
        "carnem",
        "suam",
        "dare",
        "ad",
        "manducandum"
      ]);
      for (const word of result.words) {
        expect(word.definitions.length).toBeGreaterThan(0);
      }
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
