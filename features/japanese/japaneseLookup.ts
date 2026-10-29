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
  examples: Array<{ japanese: string; english?: string; transcription?: string; romaji?: string }>;
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

interface TatoebaSentence {
  id?: number;
  text?: string;
  transcriptions?: Array<{
    script?: string;
    text?: string;
    type?: string;
  }>;
  translations?: Array<{
    id?: number;
    text?: string;
    lang?: string;
  }>;
}

interface TatoebaResponse {
  data?: TatoebaSentence[];
}

const definitionCache = new Map<string, string[]>();

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

async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function fetchJishoData(word: string): Promise<JishoResponse | null> {
  // 1. Try local dev server proxy first
  try {
    const localUrl = `${import.meta.env.BASE_URL}__jisho?keyword=${encodeURIComponent(word)}`;
    const res = await fetchWithTimeout(localUrl, 10000);
    if (res.ok) {
      return (await res.json()) as JishoResponse;
    }
  } catch {
    // Local proxy not available or timed out, fallback to CORS proxy
  }

  // 2. Try allorigins CORS proxy fallback (useful for preview / production / direct testing)
  try {
    const target = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target.toString())}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as { contents?: string };
      if (data.contents) {
        return JSON.parse(data.contents) as JishoResponse;
      }
    }
  } catch {
    // Both failed
  }

  return null;
}

async function findDefinitions(word: string, reading: string): Promise<{ definitions: string[] }> {
  const cacheKey = `${word}:${reading}`;
  if (definitionCache.has(cacheKey)) {
    return { definitions: definitionCache.get(cacheKey)! };
  }

  try {
    japaneseDebug("Definitions request", { word, reading });
    const data = await fetchJishoData(word);
    if (!data) {
      japaneseDebug("Definitions empty", { word });
      return { definitions: [] };
    }

    if (!data.data?.length) {
      definitionCache.set(cacheKey, []);
      return { definitions: [] };
    }

    const result = data.data.find((item) =>
      item.japanese?.some((entry) => entry.word === word || entry.reading === reading)
    ) ?? data.data[0];

    const definitions = unique(result?.senses?.flatMap((sense) => sense.english_definitions ?? []) ?? []).slice(0, 5);
    japaneseDebug("Definitions response", { word, count: definitions.length });
    definitionCache.set(cacheKey, definitions);
    return { definitions };
  } catch {
    return { definitions: [] };
  }
}

async function findExamples(word: string) {
  const localUrl = `${import.meta.env.BASE_URL}__tatoeba?word=${encodeURIComponent(word)}`;
  try {
    const response = await fetchWithTimeout(localUrl, 30000);
    if (response.ok) {
      const data = await response.json() as TatoebaResponse;
      return await mapExamples(data);
    }
  } catch {
    // Local proxy is unavailable outside the development server.
  }

  try {
    const target = new URL("https://api.tatoeba.org/v1/sentences");
    target.searchParams.set("lang", "jpn");
    target.searchParams.set("q", word);
    target.searchParams.set("trans:lang", "eng");
    target.searchParams.set("showtrans:lang", "eng");
    target.searchParams.set("trans:is_direct", "yes");
    target.searchParams.set("trans:is_orphan", "no");
    target.searchParams.set("is_unapproved", "no");
    target.searchParams.set("trans:is_unapproved", "no");
    target.searchParams.set("sort", "relevance");
    target.searchParams.set("limit", "3");
    target.searchParams.set("include", "transcriptions");
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target.toString())}`;
    const response = await fetchWithTimeout(alloriginsUrl, 4000);
    if (!response.ok) return [];
    const data = await response.json() as { contents?: string };
    return data.contents ? await mapExamples(JSON.parse(data.contents) as TatoebaResponse) : [];
  } catch {
    return [];
  }
}

async function mapExamples(data: TatoebaResponse) {
  const { kuroshiro } = await getAnalyzer();
  return Promise.all((data.data ?? []).filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text)).map(async (item) => {
    const transcription = item.transcriptions?.find((entry) => entry.text)?.text;
    return {
      japanese: item.text,
      english: item.translations?.[0]?.text,
      transcription,
      romaji: await kuroshiro.convert(item.text, {
        to: "romaji",
        mode: "spaced",
        romajiSystem: "hepburn"
      })
    };
  }));
}

function getReading(token: Token): string {
  return token.reading ?? token.pronunciation ?? token.surface_form;
}

export async function analyzeJapanese(text: string): Promise<JapaneseLookup> {
  japaneseDebug("Analysis started", { text });
  const { analyzer, kuroshiro } = await getAnalyzer();
  const tokens = await analyzer.parse(text);
  japaneseDebug("Tokenization complete", { text, count: tokens.length });

  // Generate romaji for the full selected text and process tokens concurrently
  const [romaji, words] = await Promise.all([
    kuroshiro.convert(text, {
      to: "romaji",
      mode: "spaced",
      romajiSystem: "hepburn"
    }),
    Promise.all(
      tokens
        .filter((token) => token.surface_form.trim() && token.pos !== "記号")
        .map(async (token) => {
          const reading = getReading(token);
          const isParticle = token.pos === "助詞" || token.pos === "助動詞";
          const defPromise = isParticle
            ? Promise.resolve({ definitions: [] })
            : findDefinitions(token.basic_form, reading);

          const [tokenRomaji, { definitions }] = await Promise.all([
            kuroshiro.convert(reading, { to: "romaji", romajiSystem: "hepburn" }),
            defPromise
          ]);

          return {
            surface: token.surface_form,
            base: token.basic_form,
            reading,
            romaji: tokenRomaji,
            partOfSpeech: token.pos_detail_1 === "*" ? token.pos : `${token.pos}・${token.pos_detail_1}`,
            definitions,
            examples: []
          };
        })
    )
  ]);

  japaneseDebug("Analysis complete", { text, wordCount: words.length });
  return { text, romaji, words };
}

export async function loadJapaneseExamples(word: JapaneseWord): Promise<JapaneseWord> {
  if (word.examples.length > 0) return word;
  try {
    japaneseDebug("Example request", { word: word.surface });
    const examples = await findExamples(word.base || word.surface);
    return { ...word, examples };
  } catch {
    japaneseDebug("Example request failed", { word: word.surface });
    return word;
  }
}