import { englishDebug } from "./debug";

export interface EnglishExample {
  english: string;
  context?: string;
  reference?: string;
}

export interface EnglishWord {
  surface: string;
  lemma?: string;
  isInflected?: boolean;
  inflection?: string;
  pronunciation?: string;
  partOfSpeech: string;
  forms?: string[];
  definitions: string[];
  synonyms?: string[];
  examples: EnglishExample[];
}

export interface EnglishLookup {
  text: string;
  words: EnglishWord[];
}

interface DictionaryApiMeaning {
  partOfSpeech?: string;
  definitions?: Array<{
    definition?: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictionaryApiPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiEntry {
  word?: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings?: DictionaryApiMeaning[];
}

interface FreeDictionarySense {
  definition?: string;
  tags?: string[];
  examples?: string[];
  quotes?: Array<{
    text?: string;
    reference?: string;
  }>;
  synonyms?: string[];
  subsenses?: FreeDictionarySense[];
}

interface FreeDictionaryEntry {
  partOfSpeech?: string;
  pronunciations?: Array<{
    type?: string;
    text?: string;
    tags?: string[];
  }>;
  forms?: Array<{
    word?: string;
    tags?: string[];
  }>;
  senses?: FreeDictionarySense[];
  synonyms?: string[];
}

interface FreeDictionaryResponse {
  word?: string;
  entries?: FreeDictionaryEntry[];
}

interface TatoebaSentence {
  id?: number;
  text?: string;
}

interface TatoebaResponse {
  data?: TatoebaSentence[];
}

const dictionaryApiCache = new Map<string, DictionaryApiEntry[] | null>();
const freeDictionaryCache = new Map<string, FreeDictionaryResponse | null>();
const tatoebaCache = new Map<string, EnglishExample[]>();

export function clearEnglishLookupCache(): void {
  dictionaryApiCache.clear();
  freeDictionaryCache.clear();
  tatoebaCache.clear();
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

export function cleanEnglishToken(raw: string): string {
  // Strip leading and trailing punctuation, quotes, brackets, numbers, but preserve internal apostrophes and hyphens
  return raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").trim();
}

export function tokenizeEnglish(text: string): string[] {
  const rawTokens = text.trim().split(/\s+/);
  const cleaned: string[] = [];
  for (const raw of rawTokens) {
    const token = cleanEnglishToken(raw);
    if (token) {
      cleaned.push(token);
    }
  }
  return cleaned;
}

export function extractLemmaFromDefinition(def: string): string | undefined {
  // Patterns like:
  // "simple past and past participle of create"
  // "plural of heaven"
  // "third-person singular simple past indicative of be."
  // "inflection of factus:"
  // "form of sum"
  const formOfMatch = def.match(/\b(?:inflection|form|plural|singular|comparative|superlative|past|participle)\s+of\s+([a-zA-Z]+)\b/i);
  if (formOfMatch) {
    const candidate = formOfMatch[1].toLowerCase();
    if (!["the", "a", "an", "this", "that", "any", "and", "or"].includes(candidate)) {
      return candidate;
    }
  }

  const ofMatch = def.match(/\bof\s+([a-zA-Z]+)(?:\.|$|;|\s)/i);
  if (ofMatch) {
    const candidate = ofMatch[1].toLowerCase();
    if (!["the", "a", "an", "this", "that", "any", "and", "or", "speech", "fact", "course"].includes(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function isInflectionDefinition(def: string): boolean {
  return (
    /\b(?:inflection|form|plural|singular|indicative|subjunctive|participle|past tense)\s+of\b/i.test(def) ||
    /^(?:alternative|archaic|obsolete)\s+form\s+of\b/i.test(def)
  );
}

export function formatInflectionDescription(def: string, tags?: string[]): string {
  if (isInflectionDefinition(def)) {
    const ofIndex = def.indexOf(" of ");
    if (ofIndex > 0) {
      return def.slice(0, ofIndex).trim();
    }
  }

  if (tags && tags.length > 0) {
    const filteredTags = tags.filter((t) => t !== "form of" && t !== "canonical");
    if (filteredTags.length > 0) {
      return filteredTags.join(" ");
    }
  }

  return def.replace(/\.$/, "").trim();
}

export function mapPosTag(pos?: string): string {
  if (!pos) return "word";
  const lower = pos.toLowerCase();
  if (lower === "n" || lower === "noun") return "noun";
  if (lower === "v" || lower === "verb") return "verb";
  if (lower === "a" || lower === "adj" || lower === "adjective") return "adjective";
  if (lower === "r" || lower === "adv" || lower === "adverb") return "adverb";
  if (lower === "prep" || lower === "preposition") return "preposition";
  if (lower === "conj" || lower === "conjunction") return "conjunction";
  if (lower === "pron" || lower === "pronoun") return "pronoun";
  if (lower === "interj" || lower === "interjection") return "interjection";
  return lower;
}

async function fetchDictionaryApiDev(word: string): Promise<DictionaryApiEntry[] | null> {
  const cacheKey = word.toLowerCase();
  if (dictionaryApiCache.has(cacheKey)) {
    return dictionaryApiCache.get(cacheKey)!;
  }

  // 1. Local dev server proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__dictionaryapi_dev?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as DictionaryApiEntry[];
      dictionaryApiCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Dev proxy unavailable
  }

  // 2. Direct API call
  try {
    const directUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as DictionaryApiEntry[];
      dictionaryApiCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct call failed
  }

  // 3. Fallback to allorigins CORS proxy
  try {
    const target = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cacheKey)}`;
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as DictionaryApiEntry[];
        dictionaryApiCache.set(cacheKey, data);
        return data;
      }
    }
  } catch {
    // All failed
  }

  dictionaryApiCache.set(cacheKey, null);
  return null;
}

async function fetchFreeDictionaryData(word: string): Promise<FreeDictionaryResponse | null> {
  const cacheKey = word.toLowerCase();
  if (freeDictionaryCache.has(cacheKey)) {
    return freeDictionaryCache.get(cacheKey)!;
  }

  // 1. Local dev server proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__freedictionary_en?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictionaryCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Dev proxy unavailable
  }

  // 2. Direct API call
  try {
    const directUrl = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictionaryCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct call failed
  }

  // 3. Fallback to allorigins CORS proxy
  try {
    const target = `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(cacheKey)}`;
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as FreeDictionaryResponse;
        freeDictionaryCache.set(cacheKey, data);
        return data;
      }
    }
  } catch {
    // All failed
  }

  freeDictionaryCache.set(cacheKey, null);
  return null;
}

export async function analyzeEnglishWord(surface: string): Promise<EnglishWord> {
  const clean = cleanEnglishToken(surface);
  englishDebug("Analyzing English word", { surface, clean });

  const [dictApiData, fdData] = await Promise.all([
    fetchDictionaryApiDev(clean),
    fetchFreeDictionaryData(clean)
  ]);

  const dictEntry = dictApiData?.[0];
  const fdEntry = fdData?.entries?.[0];

  let partOfSpeech = mapPosTag(dictEntry?.meanings?.[0]?.partOfSpeech || fdEntry?.partOfSpeech);
  let pronunciation = dictEntry?.phonetic ||
    dictEntry?.phonetics?.find((p) => p.text)?.text ||
    fdEntry?.pronunciations?.find((p) => p.text)?.text;

  if (pronunciation) {
    pronunciation = pronunciation.replace(/^\/|\/$|^\[|\]$/g, "");
  }

  let isInflected = false;
  let inflectionDesc: string | undefined;
  let rawLemma: string | undefined;

  // Check FreeDictionary senses for inflection pointer
  if (fdEntry?.senses) {
    for (const sense of fdEntry.senses) {
      if (sense.definition) {
        const foundLemma = extractLemmaFromDefinition(sense.definition);
        if (foundLemma && !rawLemma && foundLemma !== clean.toLowerCase()) {
          rawLemma = foundLemma;
          isInflected = true;
          inflectionDesc = formatInflectionDescription(sense.definition, sense.tags);
          break;
        }
      }
    }
  }

  const forms: string[] = [];
  if (fdEntry?.forms) {
    for (const f of fdEntry.forms) {
      if (f.word) forms.push(f.word);
    }
  }

  const rawDefinitions: string[] = [];
  const rawExamples: EnglishExample[] = [];
  const rawSynonyms: string[] = [];

  // Extract from DictionaryAPI
  if (dictEntry?.meanings) {
    for (const meaning of dictEntry.meanings) {
      if (meaning.synonyms) rawSynonyms.push(...meaning.synonyms);
      for (const d of meaning.definitions ?? []) {
        if (d.definition) rawDefinitions.push(d.definition);
        if (d.example) rawExamples.push({ english: d.example });
        if (d.synonyms) rawSynonyms.push(...d.synonyms);
      }
    }
  }

  // Extract from FreeDictionary
  if (fdEntry?.senses) {
    for (const sense of fdEntry.senses) {
      if (sense.definition && !isInflectionDefinition(sense.definition)) {
        rawDefinitions.push(sense.definition);
      }
      if (sense.examples) {
        for (const ex of sense.examples) {
          if (ex) rawExamples.push({ english: ex });
        }
      }
      if (sense.quotes) {
        for (const q of sense.quotes) {
          if (q.text) rawExamples.push({ english: q.text, reference: q.reference });
        }
      }
      if (sense.synonyms) rawSynonyms.push(...sense.synonyms);
    }
  }
  if (fdEntry?.synonyms) {
    rawSynonyms.push(...fdEntry.synonyms);
  }

  // If word is inflected and we have no/few definitions, resolve the lemma!
  if (isInflected && rawLemma && rawDefinitions.length === 0) {
    englishDebug("Fetching lemma dictionary entry", { rawLemma });
    const [lemmaDict, lemmaFd] = await Promise.all([
      fetchDictionaryApiDev(rawLemma),
      fetchFreeDictionaryData(rawLemma)
    ]);

    const lemmaDEntry = lemmaDict?.[0];
    const lemmaFEntry = lemmaFd?.entries?.[0];

    if (lemmaDEntry?.meanings) {
      if (partOfSpeech === "word" && lemmaDEntry.meanings[0]?.partOfSpeech) {
        partOfSpeech = mapPosTag(lemmaDEntry.meanings[0].partOfSpeech);
      }
      for (const m of lemmaDEntry.meanings) {
        for (const d of m.definitions ?? []) {
          if (d.definition) rawDefinitions.push(d.definition);
          if (d.example) rawExamples.push({ english: d.example });
        }
      }
    }

    if (lemmaFEntry?.senses) {
      for (const sense of lemmaFEntry.senses) {
        if (sense.definition && !isInflectionDefinition(sense.definition)) {
          rawDefinitions.push(sense.definition);
        }
        if (sense.examples) {
          for (const ex of sense.examples) {
            if (ex) rawExamples.push({ english: ex });
          }
        }
      }
    }
  }

  // If definitions are still empty, use inflection description
  if (rawDefinitions.length === 0 && inflectionDesc) {
    rawDefinitions.push(inflectionDesc);
  }

  return {
    surface,
    lemma: rawLemma || clean,
    isInflected,
    inflection: inflectionDesc,
    pronunciation,
    partOfSpeech,
    forms: unique(forms).slice(0, 4),
    definitions: unique(rawDefinitions).slice(0, 5),
    synonyms: unique(rawSynonyms).slice(0, 5),
    examples: rawExamples.slice(0, 3)
  };
}

export async function analyzeEnglish(text: string): Promise<EnglishLookup> {
  englishDebug("English text analysis started", { text });
  const tokens = tokenizeEnglish(text);
  if (tokens.length === 0) {
    return { text, words: [] };
  }

  const maxWords = 50;
  const wordsToAnalyze = tokens.slice(0, maxWords);
  const words = await Promise.all(wordsToAnalyze.map((t) => analyzeEnglishWord(t)));

  englishDebug("English text analysis complete", { text, count: words.length });
  return { text, words };
}

export async function loadEnglishExamples(word: EnglishWord): Promise<EnglishWord> {
  if (word.examples.length >= 2) return word;

  const target = word.lemma || cleanEnglishToken(word.surface);
  const cacheKey = target.toLowerCase();

  if (tatoebaCache.has(cacheKey)) {
    const cached = tatoebaCache.get(cacheKey)!;
    return { ...word, examples: [...word.examples, ...cached].slice(0, 4) };
  }

  // Try dev server Tatoeba proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__tatoeba_eng?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as TatoebaResponse;
      const fetched: EnglishExample[] = (data.data ?? [])
        .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
        .map((item) => ({ english: item.text }));
      tatoebaCache.set(cacheKey, fetched);
      return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
    }
  } catch {
    // Dev proxy unavailable
  }

  // Try direct Tatoeba query via allorigins
  try {
    const tatoebaUrl = new URL("https://api.tatoeba.org/v1/sentences");
    tatoebaUrl.searchParams.set("lang", "eng");
    tatoebaUrl.searchParams.set("q", cacheKey);
    tatoebaUrl.searchParams.set("sort", "relevance");
    tatoebaUrl.searchParams.set("limit", "3");

    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tatoebaUrl.toString())}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as TatoebaResponse;
        const fetched: EnglishExample[] = (data.data ?? [])
          .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
          .map((item) => ({ english: item.text }));
        tatoebaCache.set(cacheKey, fetched);
        return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
      }
    }
  } catch {
    // Ignore error
  }

  return word;
}
