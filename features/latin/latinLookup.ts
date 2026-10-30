import { latinDebug } from "./debug";

export interface LatinExample {
  latin: string;
  english?: string;
  reference?: string;
}

export interface LatinWord {
  surface: string;
  lemma?: string;
  isInflected?: boolean;
  inflection?: string;
  pronunciation?: string;
  partOfSpeech: string;
  principalParts?: string[];
  forms?: string[];
  definitions: string[];
  synsets?: string[];
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
  subsenses?: FreeDictionarySense[];
}

interface FreeDictionaryPronunciation {
  type?: string;
  text?: string;
  tags?: string[];
}

interface FreeDictionaryEntry {
  language?: string | { code?: string; name?: string };
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
  language?: { abbrev?: string };
  pos?: string;
  offset?: string;
  gloss?: string;
  semfield?: Array<{ code?: string; english?: string }>;
}

interface LatinWordNetResult {
  lemma: string;
  pos: string;
  morpho?: string;
  uri?: string;
  prosody?: string;
  principal_parts?: string;
  synsets?: {
    literal?: LatinWordNetSynset[];
    metonymic?: LatinWordNetSynset[];
    metaphoric?: LatinWordNetSynset[];
  };
}

interface LatinWordNetResponse {
  count: number;
  results?: LatinWordNetResult[];
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
const latinWordNetCache = new Map<string, string[]>();
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

export function normalizeLatinLemma(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip macrons and diacritics
    .replace(/æ/gi, "ae")
    .replace(/œ/gi, "oe")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function extractLemmaFromDefinition(def: string): string | undefined {
  // Common Wiktionary patterns:
  // "third-person singular perfect active indicative of creō"
  // "nominative/accusative/vocative plural of verbum"
  // "singular of tenebrae (“darkness, shadow; ignorance; concealment”)"
  // "inflection of factus:"
  // "form of sum"
  const colonMatch = def.match(/\b(?:inflection|form)\s+of\s+([a-zA-Z\u00C0-\u024F]+):?/i);
  if (colonMatch) {
    return colonMatch[1];
  }

  const ofMatch = def.match(/\bof\s+([a-zA-Z\u00C0-\u024F]+)/i);
  if (ofMatch) {
    const candidate = ofMatch[1];
    if (!["the", "a", "an", "this", "that", "any", "and", "or"].includes(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return undefined;
}

export function formatInflectionDescription(def: string, tags?: string[]): string {
  // If def is like "third-person singular perfect active indicative of creō"
  // extract "third-person singular perfect active indicative"
  const ofIndex = def.indexOf(" of ");
  if (ofIndex > 0) {
    return def.slice(0, ofIndex).trim();
  }
  if (def.startsWith("inflection of") && tags && tags.length > 0) {
    return tags.filter((t) => t !== "form of" && t !== "canonical").join(" ");
  }
  return def.replace(/:$/, "").trim();
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
  return pos;
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

function parseWordNetGlosses(data: LatinWordNetResponse): string[] {
  const glosses: string[] = [];
  for (const item of data.results ?? []) {
    const literal = item.synsets?.literal ?? [];
    for (const synset of literal) {
      if (synset.gloss) {
        // Strip example quotes to get concise definitions: e.g. "create or manufacture: \"We produce...\"" -> "create or manufacture"
        const cleanGloss = synset.gloss.split(/:\s*"/)[0].trim();
        if (cleanGloss) {
          glosses.push(cleanGloss);
        }
      }
    }
  }
  return unique(glosses).slice(0, 5);
}

async function fetchLatinWordNetSynsets(lemma: string): Promise<string[]> {
  const cacheKey = lemma.toLowerCase();
  if (latinWordNetCache.has(cacheKey)) {
    return latinWordNetCache.get(cacheKey)!;
  }

  async function tryFetch(l: string): Promise<string[] | null> {
    // 1. Try local dev server proxy
    try {
      const localUrl = `${import.meta.env.BASE_URL}__latinwordnet?lemma=${encodeURIComponent(l)}`;
      const res = await fetchWithTimeout(localUrl, 10000);
      if (res.ok) {
        const data = (await res.json()) as LatinWordNetResponse;
        if (data.results && data.results.length > 0) {
          return parseWordNetGlosses(data);
        }
      }
    } catch {
      // Local proxy unavailable
    }

    // 2. Try direct call
    try {
      const directUrl = `https://latinwordnet.exeter.ac.uk/api/lemmas/${encodeURIComponent(l)}/synsets/`;
      const res = await fetchWithTimeout(directUrl, 4000);
      if (res.ok) {
        const data = (await res.json()) as LatinWordNetResponse;
        if (data.results && data.results.length > 0) {
          return parseWordNetGlosses(data);
        }
      }
    } catch {
      // Direct call failed
    }

    // 3. Fallback to allorigins CORS proxy
    try {
      const target = `https://latinwordnet.exeter.ac.uk/api/lemmas/${encodeURIComponent(l)}/synsets/`;
      const alloriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
      const res = await fetchWithTimeout(alloriginsUrl, 4000);
      if (res.ok) {
        const wrapper = (await res.json()) as { contents?: string };
        if (wrapper.contents) {
          const data = JSON.parse(wrapper.contents) as LatinWordNetResponse;
          if (data.results && data.results.length > 0) {
            return parseWordNetGlosses(data);
          }
        }
      }
    } catch {
      // All failed
    }

    return null;
  }

  let glosses = await tryFetch(cacheKey);
  // Try classical Latin spelling (v -> u, j -> i) if not found (e.g. uerbum instead of verbum)
  if (!glosses || glosses.length === 0) {
    const classical = cacheKey.replace(/v/g, "u").replace(/j/g, "i");
    if (classical !== cacheKey) {
      glosses = await tryFetch(classical);
    }
  }

  const result = glosses ?? [];
  latinWordNetCache.set(cacheKey, result);
  return result;
}

function extractPrincipalParts(entry?: FreeDictionaryEntry): string[] {
  if (!entry?.forms) return [];
  const parts: string[] = [];
  for (const form of entry.forms) {
    const tags = form.tags ?? [];
    if (
      tags.includes("canonical") ||
      tags.includes("infinitive") ||
      tags.includes("perfect") ||
      tags.includes("supine") ||
      tags.includes("genitive")
    ) {
      if (form.word && !form.word.includes("table-tags") && !form.word.includes("conjugation")) {
        parts.push(form.word);
      }
    }
  }
  return unique(parts).slice(0, 4);
}

function extractIpaPronunciation(entry?: FreeDictionaryEntry): string | undefined {
  const pronunciations = entry?.pronunciations ?? [];
  const match = pronunciations.find((p) => p.text)?.text;
  return match ? match.replace(/^\/|\/$|^\[|\]$/g, "") : undefined;
}

function extractQuotesAndExamples(entry?: FreeDictionaryEntry): LatinExample[] {
  const list: LatinExample[] = [];
  if (!entry?.senses) return list;

  for (const sense of entry.senses) {
    if (sense.quotes) {
      for (const q of sense.quotes) {
        if (q.text) {
          list.push({
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
          list.push({ latin: ex });
        }
      }
    }
    if (sense.subsenses) {
      for (const sub of sense.subsenses) {
        if (sub.quotes) {
          for (const q of sub.quotes) {
            if (q.text) {
              list.push({
                latin: q.text,
                english: q.translation,
                reference: q.reference
              });
            }
          }
        }
      }
    }
  }
  return list;
}

function extractRealDefinitions(entry?: FreeDictionaryEntry): string[] {
  const defs: string[] = [];
  if (!entry?.senses) return defs;

  for (const sense of entry.senses) {
    if (sense.definition) {
      const isFormOf = sense.tags?.includes("form of") || /\b(?:inflection|form|plural|singular)\s+of\b/i.test(sense.definition);
      if (!isFormOf) {
        defs.push(sense.definition);
      }
    }
    if (sense.subsenses) {
      for (const sub of sense.subsenses) {
        if (sub.definition && !sub.tags?.includes("form of")) {
          defs.push(sub.definition);
        }
      }
    }
  }
  return unique(defs);
}

export async function analyzeLatinWord(surface: string): Promise<LatinWord> {
  const clean = cleanLatinToken(surface);
  latinDebug("Analyzing Latin word", { surface, clean });

  // 1. Query FreeDictionaryAPI for the selected word
  const fdData = await fetchFreeDictionaryData(clean);
  const entry = fdData?.entries?.[0];

  let partOfSpeech = mapPosTag(entry?.partOfSpeech);
  let pronunciation = extractIpaPronunciation(entry);
  const forms: string[] = [];

  let isInflected = false;
  let inflectionDesc: string | undefined;
  let rawLemma: string | undefined;

  // Check if this surface word is an inflected form
  if (entry?.senses) {
    for (const sense of entry.senses) {
      if (sense.tags) forms.push(...sense.tags);
      if (sense.definition) {
        const foundLemma = extractLemmaFromDefinition(sense.definition);
        if (foundLemma && !rawLemma) {
          rawLemma = foundLemma;
          isInflected = true;
          inflectionDesc = formatInflectionDescription(sense.definition, sense.tags);
        }
      }
    }
  }

  if (!rawLemma && entry?.forms) {
    for (const f of entry.forms) {
      if (f.tags?.includes("lemma") && f.word) {
        rawLemma = f.word;
        isInflected = true;
      }
    }
  }

  // Fallback: if not identified as an inflection, check canonical form
  const canonicalWord = entry?.forms?.find((f) => f.tags?.includes("canonical"))?.word;
  const displayLemma = rawLemma || canonicalWord || clean;
  let normalizedLemma = normalizeLatinLemma(displayLemma);
  if (!normalizedLemma) normalizedLemma = clean.toLowerCase();

  let finalDefinitions: string[] = [];
  let principalParts: string[] = extractPrincipalParts(entry);
  const examples: LatinExample[] = extractQuotesAndExamples(entry);

  if (isInflected && normalizedLemma !== clean.toLowerCase()) {
    // 2. Fetch the original word (lemma) entry from FreeDictionaryAPI to get its true definition!
    latinDebug("Fetching original lemma dictionary entry", { rawLemma, normalizedLemma });
    const lemmaFdData = await fetchFreeDictionaryData(normalizedLemma);
    let lemmaEntry = lemmaFdData?.entries?.[0];

    // If the lemma itself is an intermediate pointer (e.g. tenebra -> singular of tenebrae)
    if (lemmaEntry?.senses) {
      for (const sense of lemmaEntry.senses) {
        if (sense.definition) {
          const secondaryLemma = extractLemmaFromDefinition(sense.definition);
          if (secondaryLemma && normalizeLatinLemma(secondaryLemma) !== normalizedLemma) {
            const secondaryNormalized = normalizeLatinLemma(secondaryLemma);
            const secondaryData = await fetchFreeDictionaryData(secondaryNormalized);
            if (secondaryData?.entries?.[0]) {
              lemmaEntry = secondaryData.entries[0];
              normalizedLemma = secondaryNormalized;
            }
            break;
          }
        }
      }
    }

    if (lemmaEntry) {
      if (partOfSpeech === "word" && lemmaEntry.partOfSpeech) {
        partOfSpeech = mapPosTag(lemmaEntry.partOfSpeech);
      }
      if (!pronunciation) {
        pronunciation = extractIpaPronunciation(lemmaEntry);
      }
      const lemmaPrincipalParts = extractPrincipalParts(lemmaEntry);
      if (lemmaPrincipalParts.length > 0) {
        principalParts = lemmaPrincipalParts;
      }
      finalDefinitions.push(...extractRealDefinitions(lemmaEntry));
      examples.push(...extractQuotesAndExamples(lemmaEntry));
    }
  } else {
    // Word is already a base headword or no inflection was detected
    finalDefinitions.push(...extractRealDefinitions(entry));
  }

  // 3. Query Latin WordNet synsets endpoint for the lemma
  const wordNetTarget = normalizedLemma || clean.toLowerCase();
  const synsetGlosses = await fetchLatinWordNetSynsets(wordNetTarget);

  if (finalDefinitions.length === 0) {
    // If no direct dictionary definitions found, use WordNet synsets or inflection description
    if (synsetGlosses.length > 0) {
      finalDefinitions.push(...synsetGlosses);
    } else if (inflectionDesc) {
      finalDefinitions.push(inflectionDesc);
    }
  } else {
    // Enrich with top WordNet glosses
    finalDefinitions.push(...synsetGlosses);
  }

  const definitions = unique(finalDefinitions).slice(0, 5);

  return {
    surface,
    lemma: displayLemma,
    isInflected,
    inflection: inflectionDesc,
    pronunciation,
    partOfSpeech,
    principalParts: principalParts.length > 0 ? principalParts : undefined,
    forms: unique(forms).slice(0, 4),
    definitions,
    synsets: synsetGlosses.slice(0, 3),
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

  const target = word.lemma ? normalizeLatinLemma(word.lemma) : cleanLatinToken(word.surface);
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
