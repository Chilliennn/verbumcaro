import { latinDebug } from "./debug";

export interface LatinExample {
  latin: string;
  english?: string;
  reference?: string;
}

export interface LatinWord {
  surface: string;
  lemma?: string;
  pronunciation?: string;
  partOfSpeech: string;
  forms?: string[];
  definitions: string[];
  examples: LatinExample[];
}

export interface LatinLookup {
  text: string;
  words: LatinWord[];
}

interface FreeDictionarySense {
  definition?: string;
  tags?: string[];
  examples?: string[];
  quotes?: Array<{
    text?: string;
    reference?: string;
    translation?: string;
  }>;
}

interface FreeDictionaryPronunciation {
  type?: string;
  text?: string;
  tags?: string[];
}

interface FreeDictionaryEntry {
  language?: string;
  partOfSpeech?: string;
  pronunciations?: FreeDictionaryPronunciation[];
  forms?: Array<{
    word?: string;
    tags?: string[];
  }>;
  senses?: FreeDictionarySense[];
}

interface FreeDictionaryResponse {
  word?: string;
  entries?: FreeDictionaryEntry[];
}

interface LatinWordNetSynset {
  id?: string;
  offset?: string;
  definition?: string;
  semfield?: string;
}

interface LatinWordNetLemmaEntry {
  lemma?: string;
  pos?: string;
  morpho?: string;
  uri?: string;
  synsets?: LatinWordNetSynset[];
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

const freeDictionaryCache = new Map<string, FreeDictionaryResponse | null>();
const latinWordNetCache = new Map<string, LatinWordNetLemmaEntry[] | null>();
const tatoebaCache = new Map<string, LatinExample[]>();

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

export function cleanLatinToken(raw: string): string {
  // Strip leading and trailing punctuation, quotes, brackets, numbers
  return raw.replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, "").trim();
}

export function tokenizeLatin(text: string): string[] {
  const rawTokens = text.trim().split(/\s+/);
  const cleaned: string[] = [];
  for (const raw of rawTokens) {
    const token = cleanLatinToken(raw);
    if (token) {
      cleaned.push(token);
    }
  }
  return cleaned;
}

async function fetchFreeDictionaryData(word: string): Promise<FreeDictionaryResponse | null> {
  const cacheKey = word.toLowerCase();
  if (freeDictionaryCache.has(cacheKey)) {
    return freeDictionaryCache.get(cacheKey)!;
  }

  // 1. Try local dev server proxy first
  try {
    const localUrl = `${import.meta.env.BASE_URL}__freedictionary?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 10000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictionaryCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Local proxy not available or timed out
  }

  // 2. Try direct API call
  try {
    const directUrl = `https://freedictionaryapi.com/api/v1/entries/la/${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as FreeDictionaryResponse;
      freeDictionaryCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct call failed or CORS blocked
  }

  // 3. Fallback to allorigins CORS proxy
  try {
    const target = `https://freedictionaryapi.com/api/v1/entries/la/${encodeURIComponent(cacheKey)}`;
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
    // All attempts failed
  }

  freeDictionaryCache.set(cacheKey, null);
  return null;
}

async function fetchLatinWordNetData(lemma: string): Promise<LatinWordNetLemmaEntry[] | null> {
  const cacheKey = lemma.toLowerCase();
  if (latinWordNetCache.has(cacheKey)) {
    return latinWordNetCache.get(cacheKey)!;
  }

  // 1. Try local dev server proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__latinwordnet?lemma=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 10000);
    if (res.ok) {
      const data = (await res.json()) as LatinWordNetLemmaEntry[];
      latinWordNetCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Local proxy unavailable
  }

  // 2. Try direct call
  try {
    const directUrl = `https://latinwordnet.exeter.ac.uk/api/lemmas/${encodeURIComponent(cacheKey)}/`;
    const res = await fetchWithTimeout(directUrl, 4000);
    if (res.ok) {
      const data = (await res.json()) as LatinWordNetLemmaEntry[];
      latinWordNetCache.set(cacheKey, data);
      return data;
    }
  } catch {
    // Direct call failed
  }

  // 3. Fallback to allorigins CORS proxy
  try {
    const target = `https://latinwordnet.exeter.ac.uk/api/lemmas/${encodeURIComponent(cacheKey)}/`;
    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as LatinWordNetLemmaEntry[];
        latinWordNetCache.set(cacheKey, data);
        return data;
      }
    }
  } catch {
    // All failed
  }

  latinWordNetCache.set(cacheKey, null);
  return null;
}

function extractLemmaFromDefinition(def: string): string | undefined {
  // Common Wiktionary patterns:
  // "inflection of creo: ..."
  // "third-person singular perfect active indicative of creo"
  const match = def.match(/(?:inflection of|form of|indicative of|subjunctive of|participle of|imperative of)\s+([a-zA-Z\u00C0-\u017F]+)/i);
  if (match) {
    return match[1].toLowerCase().replace(/[^\p{L}]/gu, "");
  }
  return undefined;
}

function mapPosTag(pos?: string): string {
  if (!pos) return "word";
  const lower = pos.toLowerCase();
  if (lower === "n" || lower === "noun") return "noun";
  if (lower === "v" || lower === "verb") return "verb";
  if (lower === "a" || lower === "adj" || lower === "adjective") return "adjective";
  if (lower === "r" || lower === "adv" || lower === "adverb") return "adverb";
  if (lower === "prep" || lower === "preposition") return "preposition";
  if (lower === "conj" || lower === "conjunction") return "conjunction";
  if (lower === "pron" || lower === "pronoun") return "pronoun";
  return pos;
}

export async function analyzeLatinWord(surface: string): Promise<LatinWord> {
  const clean = cleanLatinToken(surface);
  latinDebug("Analyzing Latin word", { surface, clean });

  // 1. Query FreeDictionaryAPI
  const fdData = await fetchFreeDictionaryData(clean);
  const entry = fdData?.entries?.[0];

  let partOfSpeech = mapPosTag(entry?.partOfSpeech);
  const pronunciations = entry?.pronunciations ?? [];
  const pronunciation = pronunciations.find((p) => p.text)?.text?.replace(/^\/|\/$|^\[|\]$/g, "");
  const forms: string[] = [];

  const rawDefinitions: string[] = [];
  const examples: LatinExample[] = [];
  let detectedLemma: string | undefined;

  if (entry?.senses) {
    for (const sense of entry.senses) {
      if (sense.definition) {
        rawDefinitions.push(sense.definition);
        if (!detectedLemma) {
          detectedLemma = extractLemmaFromDefinition(sense.definition);
        }
      }
      if (sense.tags) {
        forms.push(...sense.tags);
      }
      if (sense.quotes) {
        for (const q of sense.quotes) {
          if (q.text) {
            examples.push({
              latin: q.text,
              english: q.translation,
              reference: q.reference
            });
          }
        }
      }
      if (sense.examples) {
        for (const ex of sense.examples) {
          if (ex) {
            examples.push({ latin: ex });
          }
        }
      }
    }
  }

  if (entry?.forms) {
    for (const f of entry.forms) {
      if (f.tags?.includes("lemma") && f.word) {
        detectedLemma = f.word.toLowerCase();
      } else if (f.tags) {
        forms.push(...f.tags);
      }
    }
  }

  // 2. Query Latin WordNet for lemma or headword to supplement synsets
  const wordNetTarget = detectedLemma || clean;
  const lwnData = await fetchLatinWordNetData(wordNetTarget);

  if (lwnData && lwnData.length > 0) {
    const lwnEntry = lwnData[0];
    if (!detectedLemma && lwnEntry.lemma && lwnEntry.lemma.toLowerCase() !== clean.toLowerCase()) {
      detectedLemma = lwnEntry.lemma;
    }
    if (partOfSpeech === "word" && lwnEntry.pos) {
      partOfSpeech = mapPosTag(lwnEntry.pos);
    }

    if (lwnEntry.synsets) {
      for (const synset of lwnEntry.synsets) {
        if (synset.definition) {
          rawDefinitions.push(synset.definition);
        }
      }
    }
  }

  const definitions = unique(rawDefinitions).slice(0, 5);

  return {
    surface,
    lemma: detectedLemma,
    pronunciation,
    partOfSpeech,
    forms: unique(forms).slice(0, 4),
    definitions,
    examples: examples.slice(0, 3)
  };
}

export async function analyzeLatin(text: string): Promise<LatinLookup> {
  latinDebug("Latin text analysis started", { text });
  const tokens = tokenizeLatin(text);
  if (tokens.length === 0) {
    return { text, words: [] };
  }

  // Deduplicate consecutive identical words or limit words to avoid overwhelming
  const wordsToAnalyze = tokens.slice(0, 8);
  const words = await Promise.all(wordsToAnalyze.map((t) => analyzeLatinWord(t)));

  latinDebug("Latin text analysis complete", { text, count: words.length });
  return { text, words };
}

export async function loadLatinExamples(word: LatinWord): Promise<LatinWord> {
  if (word.examples.length >= 2) return word;

  const target = word.lemma || cleanLatinToken(word.surface);
  const cacheKey = target.toLowerCase();

  if (tatoebaCache.has(cacheKey)) {
    const cached = tatoebaCache.get(cacheKey)!;
    return { ...word, examples: [...word.examples, ...cached].slice(0, 4) };
  }

  // Try dev server Tatoeba proxy
  try {
    const localUrl = `${import.meta.env.BASE_URL}__tatoeba_lat?word=${encodeURIComponent(cacheKey)}`;
    const res = await fetchWithTimeout(localUrl, 5000);
    if (res.ok) {
      const data = (await res.json()) as TatoebaResponse;
      const fetched: LatinExample[] = (data.data ?? [])
        .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
        .map((item) => ({
          latin: item.text,
          english: item.translations?.[0]?.text
        }));
      tatoebaCache.set(cacheKey, fetched);
      return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
    }
  } catch {
    // Dev proxy unavailable
  }

  // Try direct Tatoeba query
  try {
    const tatoebaUrl = new URL("https://api.tatoeba.org/v1/sentences");
    tatoebaUrl.searchParams.set("lang", "lat");
    tatoebaUrl.searchParams.set("q", cacheKey);
    tatoebaUrl.searchParams.set("trans:lang", "eng");
    tatoebaUrl.searchParams.set("showtrans:lang", "eng");
    tatoebaUrl.searchParams.set("trans:is_direct", "yes");
    tatoebaUrl.searchParams.set("trans:is_orphan", "no");
    tatoebaUrl.searchParams.set("sort", "relevance");
    tatoebaUrl.searchParams.set("limit", "3");

    const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tatoebaUrl.toString())}`;
    const res = await fetchWithTimeout(alloriginsUrl, 4000);
    if (res.ok) {
      const wrapper = (await res.json()) as { contents?: string };
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents) as TatoebaResponse;
        const fetched: LatinExample[] = (data.data ?? [])
          .filter((item): item is TatoebaSentence & { text: string } => Boolean(item.text))
          .map((item) => ({
            latin: item.text,
            english: item.translations?.[0]?.text
          }));
        tatoebaCache.set(cacheKey, fetched);
        return { ...word, examples: [...word.examples, ...fetched].slice(0, 4) };
      }
    }
  } catch {
    // Ignore error
  }

  return word;
}

