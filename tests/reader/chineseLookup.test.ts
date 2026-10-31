import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanChineseToken,
  tokenizeChinese,
  analyzeChineseWord,
  analyzeChinese,
  loadChineseExamples,
  clearChineseLookupCache
} from "../../features/chinese/chineseLookup";

describe("chineseLookup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearChineseLookupCache();
  });

  describe("cleanChineseToken", () => {
    it("strips Chinese and ASCII punctuation and whitespace", () => {
      expect(cleanChineseToken("起初，")).toBe("起初");
      expect(cleanChineseToken("“天主”")).toBe("天主");
      expect(cleanChineseToken("（创造）")).toBe("创造");
      expect(cleanChineseToken("。天地；")).toBe("天地");
      expect(cleanChineseToken("【圣言】")).toBe("圣言");
    });
  });

  describe("tokenizeChinese", () => {
    it("segments a Chinese verse into word tokens", () => {
      const tokens = tokenizeChinese("起初天主创造了天地。");
      expect(tokens).toContain("起初");
      expect(tokens).toContain("天主");
      expect(tokens).toContain("创造");
      expect(tokens).toContain("天地");
    });

    it("handles whitespace and punctuation cleanly", () => {
      const tokens = tokenizeChinese(" 在起初 ， 已有 圣言 。 ");
      expect(tokens).toContain("起初");
      expect(tokens).toContain("已有");
    });
  });

  describe("analyzeChineseWord and analyzeChinese", () => {
    it("extracts pinyin, translations, and examples from Youdao data", async () => {
      const mockYoudao = {
        ce: {
          word: [
            {
              phone: "qǐ chū",
              trs: [
                {
                  tr: [
                    {
                      l: {
                        pos: "adv.",
                        i: ["at first"]
                      }
                    }
                  ]
                },
                {
                  tr: [
                    {
                      l: {
                        i: ["in the beginning"]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        blng_sents_part: {
          "sentence-pair": [
            {
              sentence: "它<b>起初</b>按$23.50的价格零售。",
              "sentence-translation": "It originally retailed at $23.50."
            }
          ]
        }
      };

      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("jsonapi") || url.includes("__youdao_jsonapi")) {
          return new Response(JSON.stringify(mockYoudao), { status: 200 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const word = await analyzeChineseWord("起初");
      expect(word.surface).toBe("起初");
      expect(word.pinyin).toBe("qǐ chū");
      expect(word.partOfSpeech).toBe("adverb");
      expect(word.definitions).toContain("at first");
      expect(word.definitions).toContain("in the beginning");
      expect(word.examples.length).toBeGreaterThan(0);
      expect(word.examples[0].chinese).toBe("它起初按$23.50的价格零售。");
      expect(word.examples[0].english).toBe("It originally retailed at $23.50.");
    });

    it("analyzes a full Chinese phrase and generates full pinyin", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = String(input);
        if (url.includes("jsonapi") || url.includes("__youdao_jsonapi")) {
          const match = url.match(/(?:q=|word=)([^&]+)/);
          const term = match ? decodeURIComponent(match[1]) : "";
          const phoneMap: Record<string, string> = {
            "起初": "qǐ chū",
            "天主": "tiān zhǔ",
            "创造": "chuàng zào",
            "了": "le",
            "天地": "tiān dì"
          };
          return new Response(
            JSON.stringify({
              ce: {
                word: [
                  {
                    phone: phoneMap[term] || "shén",
                    trs: [
                      {
                        tr: [
                          {
                            l: {
                              i: [`meaning of ${term}`]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({}), { status: 404 });
      });

      const lookup = await analyzeChinese("起初 天主");
      expect(lookup.text).toBe("起初 天主");
      expect(lookup.words.map((w) => w.surface)).toEqual(["起初", "天主"]);
      expect(lookup.pinyin).toBe("qǐ chū tiān zhǔ");
    });
  });

  describe("loadChineseExamples", () => {
    it("fetches additional examples from Tatoeba if fewer than 2 exist", async () => {
      const mockTatoeba = {
        data: [
          {
            text: "上帝創造了天地。",
            translations: [{ text: "God created the heaven and the earth." }]
          }
        ]
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockTatoeba), { status: 200 })
      );

      const word = await loadChineseExamples({
        surface: "天地",
        pinyin: "tiān dì",
        definitions: ["world", "heaven and earth"],
        examples: []
      });

      expect(word.examples.length).toBeGreaterThan(0);
      expect(word.examples[0].chinese).toBe("上帝創造了天地。");
      expect(word.examples[0].english).toBe("God created the heaven and the earth.");
    });
  });
});
