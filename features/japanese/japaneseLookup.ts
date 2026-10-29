import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer, { type Token } from "kuroshiro-analyzer-kuromoji";
import { japaneseDebug } from "./debug";

export interface JapaneseWord {
  surface: string;
  base: string;
  reading: string;
  romaji: string;
  partOfSpeech: string;
  definitions: string[];
  examples: Array<{ japanese: string; english?: string }>;
}

export interface JapaneseLookup {
  text: string;
  romaji: string;
  words: JapaneseWord[];
}

interface JishoResult {
  japanese?: Array<{ word?: string; reading?: string }>;
  senses?: Array<{ english_definitions?: string[] }>;
}

interface JishoResponse {
  data?: JishoResult[];
}

interface TatoebaResponse {
  data?: Array<{
    text?: string;
  }>;
}

let analyzerPromise: Promise<{ analyzer: InstanceType<typeof KuromojiAnalyzer>; kuroshiro: InstanceType<typeof Kuroshiro> }> | null = null;

function getAnalyzer() {
  if (!analyzerPromise) {
    japaneseDebug("Kuromoji initialization started");
    const analyzer = new KuromojiAnalyzer({
      dictPath: `${import.meta.env.BASE_URL}dict/`
    });
    const kuroshiro = new Kuroshiro();
    analyzerPromise = kuroshiro.init(analyzer)
      .then(() => {
        japaneseDebug("Kuromoji initialized");
        return { analyzer, kuroshiro };
      })
      .catch((error: unknown) => {
        japaneseDebug("Kuromoji initialization failed", String(error));
        analyzerPromise = null;
        throw error;
      });
  }
  return analyzerPromise;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

async function findDefinitions(word: string, reading: string) {
  try {
    japaneseDebug("Definitions request", { word, reading });
    const response = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`
    );
    if (!response.ok) {
      japaneseDebug("Definitions response failed", { word, status: response.status });
      return { definitions: [] };
    }

    const data = await response.json() as JishoResponse;
    const result = data.data?.find((item) =>
      item.japanese?.some((entry) => entry.word === word || entry.reading === reading)
    ) ?? data.data?.[0];
    const definitions = unique(result?.senses?.flatMap((sense) => sense.english_definitions ?? []) ?? []).slice(0, 5);
    japaneseDebug("Definitions response", { word, count: definitions.length });
    return { definitions };
  } catch {
    return { definitions: [] };
  }
}

async function findExamples(word: string) {
  const response = await fetch(
    `https://api.tatoeba.org/unstable/sentences?lang=jpn&q=${encodeURIComponent(word)}&sort=relevance&limit=3`
  );
  if (!response.ok) return [];

  const data = await response.json() as TatoebaResponse;
  return (data.data ?? []).flatMap((item) => item.text ? [{ japanese: item.text }] : []);
}

function getReading(token: Token): string {
  return token.reading ?? token.pronunciation ?? token.surface_form;
}

export async function analyzeJapanese(text: string): Promise<JapaneseLookup> {
  japaneseDebug("Analysis started", { text });
  const { analyzer, kuroshiro } = await getAnalyzer();
  const tokens = await analyzer.parse(text);
  japaneseDebug("Tokenization complete", { text, count: tokens.length });
  const romaji = await kuroshiro.convert(text, {
    to: "romaji",
    mode: "spaced",
    romajiSystem: "hepburn"
  });
  const words: JapaneseWord[] = [];

  for (const token of tokens) {
    if (!token.surface_form.trim() || token.pos === "記号") continue;
    const reading = getReading(token);
    const { definitions } = await findDefinitions(token.basic_form, reading);
    words.push({
      surface: token.surface_form,
      base: token.basic_form,
      reading,
      romaji: await kuroshiro.convert(reading, { to: "romaji", romajiSystem: "hepburn" }),
      partOfSpeech: token.pos_detail_1 === "*" ? token.pos : `${token.pos}・${token.pos_detail_1}`,
      definitions,
      examples: []
    });
  }

  japaneseDebug("Analysis complete", { text, wordCount: words.length });
  return { text, romaji, words };
}

export async function loadJapaneseExamples(word: JapaneseWord): Promise<JapaneseWord> {
  if (word.examples.length > 0) return word;
  try {
    japaneseDebug("Example request", { word: word.surface });
    return { ...word, examples: await findExamples(word.surface) };
  } catch {
    japaneseDebug("Example request failed", { word: word.surface });
    return word;
  }
}