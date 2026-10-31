import { chineseDebug } from "./debug";

export interface ChineseExample {
  chinese: string;
  english?: string;
  pinyin?: string;
}

export interface ChineseWord {
  surface: string;
  pinyin?: string;
  partOfSpeech?: string;
  definitions: string[];
  synonyms?: string[];
  examples: ChineseExample[];
}

export interface ChineseLookup {
  text: string;
  pinyin?: string;
  words: ChineseWord[];
}

interface YoudaoCEItem {
  pos?: string;
  i?: Array<string | { "#text"?: string }>;
  "#tran"?: string;
}

interface YoudaoWordEntry {
  phone?: string;
  trs?: Array<{
    tr?: Array<{
      l?: YoudaoCEItem;
    }>;
  }>;
}

interface YoudaoSentencePair {
  sentence?: string;
  "sentence-translation"?: string;
}

interface YoudaoJsonApiResponse {
  ce?: {
    word?: YoudaoWordEntry[];
  };
  simple?: {
    word?: Array<{
      phone?: string;
      trs?: Array<{
        tr?: Array<{
          l?: {
            i?: string[];
          };
        }>;
      }>;
    }>;
  };
  newhh?: {
    data?: {
      word?: {
        phone?: string;
      };
    };
  };
  blng_sents_part?: {
    "sentence-pair"?: YoudaoSentencePair[];
  };
}

interface YoudaoSuggestResponse {
  data?: {
    entries?: Array<{
      entry?: string;
      explain?: string;
    }>;
  };
}

interface FreeDictionarySense {
  definition?: string;
  examples?: string[];
}

interface FreeDictionaryResponse {
  word?: string;
  entries?: Array<{
    partOfSpeech?: string;
    pronunciations?: Array<{
      type?: string;
      text?: string;
      tags?: string[];
    }>;
    senses?: FreeDictionarySense[];
    synonyms?: string[];
  }>;
}

interface TatoebaSentence {
  id?: number;
  text?: string;
  translations?: Array<{
    id?: number;
    text?: string;
    lang?: string;
  }>;
}

interface TatoebaResponse {
  data?: TatoebaSentence[];
}

const youdaoCache = new Map<string, YoudaoJsonApiResponse | null>();
const youdaoSuggestCache = new Map<string, YoudaoSuggestResponse | null>();
const freeDictZhCache = new Map<string, FreeDictionaryResponse | null>();
const tatoebaZhCache = new Map<string, ChineseExample[]>();

export function clearChineseLookupCache(): void {
  youdaoCache.clear();
  youdaoSuggestCache.clear();
  freeDictZhCache.clear();
  tatoebaZhCache.clear();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
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

export function cleanChineseToken(raw: string): string {
  // Strip punctuation, quotes, brackets, numbers, and whitespace (both Chinese and ASCII)
  return raw
    .replace(/^[\p{P}\p{S}\p{Z}\s]+|[\p{P}\p{S}\p{Z}\s]+$/gu, "")
    .trim();
}

export function tokenizeChinese(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Use Intl.Segmenter if supported by browser/Node
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new (Intl as unknown as { Segmenter: new (locales: string, options: { granularity: string }) => { segment: (text: string) => Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter("zh-Hans", {
        granularity: "word"
      });
      const tokens: string[] = [];
      for (const seg of segmenter.segment(trimmed)) {
        if (seg.isWordLike) {
          const cleaned = cleanChineseToken(seg.segment);
          if (cleaned) tokens.push(cleaned);
        }
      }
      if (tokens.length > 0) return tokens;
    } catch {
      // Fallback if Segmenter throws
    }
  }

  // Regex fallback: extract contiguous Han characters
  const matches = trimmed.match(/[\p{Script=Han}]+/gu) ?? [];
  return matches.map(cleanChineseToken).filter(Boolean);
}

export function mapPosTag(pos?: string): string | undefined {
  if (!pos) return undefined;
  const lower = pos.toLowerCase().replace(/\.$/, "").trim();
  if (lower === "n" || lower === "noun") return "noun";
  if (lower === "v" || lower === "verb" || lower === "vt" || lower === "vi") return "verb";
  if (lower === "a" || lower === "adj" || lower === "adjective") return "adjective";
  if (lower === "adv" || lower === "adverb") return "adverb";
  if (lower === "prep" || lower === "preposition") return "preposition";
  if (lower === "conj" || lower === "conjunction") return "conjunction";
  if (lower === "pron" || lower === "pronoun") return "pronoun";
  if (lower === "num" || lower === "numeral") return "numeral";
  if (lower === "art" || lower === "article") return "article";
  if (lower === "char" || lower === "character") return "character";
  return lower;
}

async function fetchYoudaoData(word: string): Promise<YoudaoJsonApiResponse | null> {
  const cacheKey = word.trim();
  if (youdaoCache.has(cacheKey)) {
    return youdaoCache.get(cacheKey)!;
  }

  // 1. Local dev server proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__youdao_jsonapi?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as YoudaoJsonApiResponse;
      youdaoCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Dev proxy unavailable
  }

  // 2. Direct API call
  try {
    const directUrl = `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as YoudaoJsonApiResponse;
      youdaoCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct call failed
  }

  // 3. Fallback to allorigins CORS proxy
  try {
    const target = `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(cacheKey)}`;
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as YoudaoJsonApiResponse;
        youdaoCache.set(cacheKey, data);
        return data;
      }
    }
  } catch {
    // All failed
  }

  youdaoCache.set(cacheKey, null);
  return null;
}

async function fetchYoudaoSuggest(word: string): Promise<YoudaoSuggestResponse | null> {
  const cacheKey = word.trim();
  if (youdaoSuggestCache.has(cacheKey)) {
    return youdaoSuggestCache.get(cacheKey)!;
  }

  // 1. Local dev proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__youdao_suggest?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as YoudaoSuggestResponse;
      youdaoSuggestCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Proxy unavailable
  }

  // 2. Direct call
  try {
    const directUrl = `https://dict.youdao.com/suggest?num=5&doctype=json&q=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as YoudaoSuggestResponse;
      youdaoSuggestCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct failed
  }

  youdaoSuggestCache.set(cacheKey, null);
  return null;
}

async function fetchFreeDictionaryZh(word: string): Promise<FreeDictionaryResponse | null> {
  const cacheKey = word.trim();
  if (freeDictZhCache.has(cacheKey)) {
    return freeDictZhCache.get(cacheKey)!;
  }

  // 1. Local dev server proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__freedictionary_zh?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictZhCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Proxy unavailable
  }

  // 2. Direct call
  try {
    const directUrl = `https://freedictionaryapi.com/api/v1/entries/zh/${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictZhCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct failed
  }

  freeDictZhCache.set(cacheKey, null);
  return null;
}

export async function analyzeChineseWord(surface: string): Promise<ChineseWord> {
  const clean = cleanChineseToken(surface);
  chineseDebug("Analyzing Chinese word", { surface, clean });

  const [youdaoData, suggestData, fdData] = await Promise.all([
    fetchYoudaoData(clean),
    fetchYoudaoSuggest(clean),
    fetchFreeDictionaryZh(clean)
  ]);

  // 1. Extract Pinyin
  const pinyin =
    youdaoData?.ce?.word?.[0]?.phone ||
    youdaoData?.simple?.word?.[0]?.phone ||
    youdaoData?.newhh?.data?.word?.phone;

  // 2. Extract Part of Speech
  let pos = youdaoData?.ce?.word?.[0]?.trs?.[0]?.tr?.[0]?.l?.pos || fdData?.entries?.[0]?.partOfSpeech;
  pos = mapPosTag(pos);

  // 3. Extract Definitions
  const defs: string[] = [];
  const examples: ChineseExample[] = [];

  // A. From Youdao CE
  const trs = youdaoData?.ce?.word?.[0]?.trs ?? [];
  for (const trGroup of trs) {
    for (const tr of trGroup.tr ?? []) {
      const l = tr.l;
      if (l?.i) {
        const textParts = l.i
          .map((item) => (typeof item === "string" ? item : item["#text"]))
          .filter(Boolean)
          .join("")
          .trim();
        if (textParts) {
          defs.push(textParts);
        }
      }
    }
  }

  // B. From Youdao Suggest
  if (defs.length === 0 && suggestData?.data?.entries) {
    for (const entry of suggestData.data.entries) {
      if (entry.entry === clean && entry.explain) {
        const parts = entry.explain.split(/;\s*/).map((p) => p.trim()).filter(Boolean);
        defs.push(...parts);
      }
    }
  }

  // C. From FreeDictionaryZh senses
  if (fdData?.entries) {
    for (const entry of fdData.entries) {
      for (const sense of entry.senses ?? []) {
        if (sense.definition) {
          defs.push(sense.definition);
        }
        if (sense.examples) {
          for (const ex of sense.examples) {
            examples.push({ chinese: ex });
          }
        }
      }
    }
  }

  // 4. Extract Bilingual Examples from Youdao
  const sentencePairs = youdaoData?.blng_sents_part?.["sentence-pair"] ?? [];
  for (const pair of sentencePairs) {
    if (pair.sentence) {
      // Remove <b> tags if present in sentence
      const cleanSentence = pair.sentence.replace(/<[^>]+>/g, "").trim();
      examples.push({
        chinese: cleanSentence,
        english: pair["sentence-translation"]?.trim()
      });
    }
  }

  // 5. Extract Synonyms from FreeDictionary
  const synonyms: string[] = [];
  if (fdData?.entries?.[0]?.synonyms) {
    synonyms.push(...fdData.entries[0].synonyms);
  }

  return {
    surface,
    pinyin: pinyin?.trim(),
    partOfSpeech: pos,
    definitions: unique(defs).slice(0, 5),
    synonyms: unique(synonyms).slice(0, 5),
    examples: examples.slice(0, 3)
  };
}

export async function analyzeChinese(text: string): Promise<ChineseLookup> {
  chineseDebug("Chinese text analysis started", { text });
  const tokens = tokenizeChinese(text);
  if (tokens.length === 0) {
    return { text, words: [] };
  }

  const maxWords = 50;
  const wordsToAnalyze = tokens.slice(0, maxWords);
  const words = await Promise.all(wordsToAnalyze.map((t) => analyzeChineseWord(t)));

  // Combine individual word pinyins into full selection pinyin if available
  const pinyins = words.map((w) => w.pinyin).filter(Boolean);
  const fullPinyin = pinyins.length === words.length ? pinyins.join(" ") : undefined;

  chineseDebug("Chinese text analysis complete", { text, count: words.length });
  return { text, pinyin: fullPinyin, words };
}

export async function loadChineseExamples(word: ChineseWord): Promise<ChineseWord> {
  if (word.examples.length >= 2) return word;

  const target = cleanChineseToken(word.surface);
  const cacheKey = target;

  if (tatoebaZhCache.has(cacheKey)) {
    const cached = tatoebaZhCache.get(cacheKey)!;
    return { ...word, examples: [...word.examples, ...cached].slice(0, 4) };
  }

  // Try dev server Tatoeba proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__tatoeba_cmn?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as TatoebaResponse;
      const fetched: ChineseExample[] = (data.data ?? [])
        .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
        .map((item) => ({
          chinese: item.text,
          english: item.translations?.[0]?.text
        }));
      tatoebaZhCache.set(cacheKey, fetched);
      return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
    }
  } catch {
    // Dev proxy unavailable
  }

  // Try direct Tatoeba query via allorigins
  try {
    const tatoebaUrl = new URL("https://api.tatoeba.org/v1/sentences");
    tatoebaUrl.searchParams.set("lang", "cmn");
    tatoebaUrl.searchParams.set("q", cacheKey);
    tatoebaUrl.searchParams.set("trans:lang", "eng");
    tatoebaUrl.searchParams.set("showtrans:lang", "eng");
    tatoebaUrl.searchParams.set("sort", "relevance");
    tatoebaUrl.searchParams.set("limit", "3");

    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tatoebaUrl.toString())}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as TatoebaResponse;
        const fetched: ChineseExample[] = (data.data ?? [])
          .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
          .map((item) => ({
            chinese: item.text,
            english: item.translations?.[0]?.text
          }));
        tatoebaZhCache.set(cacheKey, fetched);
        return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
      }
    }
  } catch {
    // Ignore error
  }

  return word;
}
