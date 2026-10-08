import type { PanelState } from "../reader/readerTypes";

const BOOK_ALIASES: Record<string, string> = {
  gen: "GEN",
  genesis: "GEN",
  exo: "EXO",
  exodus: "EXO",
  lev: "LEV",
  leviticus: "LEV",
  num: "NUM",
  numbers: "NUM",
  deu: "DEU",
  deuteronomy: "DEU",
  jos: "JOS",
  joshua: "JOS",
  jdg: "JDG",
  judges: "JDG",
  rut: "RUT",
  ruth: "RUT",
  "1sa": "1SA",
  "1sam": "1SA",
  "1 samuel": "1SA",
  "2sa": "2SA",
  "2sam": "2SA",
  "2 samuel": "2SA",
  "1ki": "1KI",
  "1kings": "1KI",
  "1 kings": "1KI",
  "2ki": "2KI",
  "2kings": "2KI",
  "2 kings": "2KI",
  "1ch": "1CH",
  "1chron": "1CH",
  "1 chronicles": "1CH",
  "2ch": "2CH",
  "2chron": "2CH",
  "2 chronicles": "2CH",
  ezr: "EZR",
  ezra: "EZR",
  neh: "NEH",
  nehemiah: "NEH",
  tob: "TOB",
  tobit: "TOB",
  jdt: "JDT",
  judith: "JDT",
  est: "EST",
  esther: "EST",
  "1ma": "1MA",
  "1 macc": "1MA",
  "1 maccabees": "1MA",
  "2ma": "2MA",
  "2 macc": "2MA",
  "2 maccabees": "2MA",
  job: "JOB",
  psa: "PSA",
  psalm: "PSA",
  psalms: "PSA",
  pro: "PRO",
  proverbs: "PRO",
  ecc: "ECC",
  ecclesiastes: "ECC",
  sng: "SNG",
  song: "SNG",
  "song of songs": "SNG",
  wis: "WIS",
  wisdom: "WIS",
  sir: "SIR",
  sirach: "SIR",
  isa: "ISA",
  isaiah: "ISA",
  jer: "JER",
  jeremiah: "JER",
  lam: "LAM",
  lamentations: "LAM",
  bar: "BAR",
  baruch: "BAR",
  ezk: "EZK",
  ezekiel: "EZK",
  dan: "DAN",
  daniel: "DAN",
  hos: "HOS",
  hosea: "HOS",
  jol: "JOL",
  joel: "JOL",
  amo: "AMO",
  amos: "AMO",
  oba: "OBA",
  obadiah: "OBA",
  jon: "JON",
  jonah: "JON",
  mic: "MIC",
  micah: "MIC",
  nah: "NAM",
  nahum: "NAM",
  hab: "HAB",
  habakkuk: "HAB",
  zep: "ZEP",
  zephaniah: "ZEP",
  hag: "HAG",
  haggai: "HAG",
  zec: "ZEC",
  zechariah: "ZEC",
  mal: "MAL",
  malachi: "MAL",
  mat: "MAT",
  matt: "MAT",
  matthew: "MAT",
  mrk: "MRK",
  mk: "MRK",
  mark: "MRK",
  luk: "LUK",
  lk: "LUK",
  luke: "LUK",
  jhn: "JHN",
  jn: "JHN",
  john: "JHN",
  act: "ACT",
  acts: "ACT",
  rom: "ROM",
  romans: "ROM",
  "1co": "1CO",
  "1cor": "1CO",
  "1 corinthians": "1CO",
  "1 cor": "1CO",
  "2co": "2CO",
  "2cor": "2CO",
  "2 corinthians": "2CO",
  "2 cor": "2CO",
  gal: "GAL",
  galatians: "GAL",
  eph: "EPH",
  ephesians: "EPH",
  php: "PHP",
  philippians: "PHP",
  col: "COL",
  colossians: "COL",
  "1th": "1TH",
  "1thess": "1TH",
  "1 thessalonians": "1TH",
  "1 thess": "1TH",
  "2th": "2TH",
  "2thess": "2TH",
  "2 thessalonians": "2TH",
  "2 thess": "2TH",
  "1ti": "1TI",
  "1tim": "1TI",
  "1 timothy": "1TI",
  "1 tim": "1TI",
  "2ti": "2TI",
  "2tim": "2TI",
  "2 timothy": "2TI",
  "2 tim": "2TI",
  tit: "TIT",
  titus: "TIT",
  phm: "PHM",
  philemon: "PHM",
  heb: "HEB",
  hebrews: "HEB",
  jas: "JAS",
  james: "JAS",
  "1pe": "1PE",
  "1pet": "1PE",
  "1 peter": "1PE",
  "1 pet": "1PE",
  "2pe": "2PE",
  "2pet": "2PE",
  "2 peter": "2PE",
  "2 pet": "2PE",
  "1jn": "1JN",
  "1john": "1JN",
  "1 john": "1JN",
  "2jn": "2JN",
  "2john": "2JN",
  "2 john": "2JN",
  "3jn": "3JN",
  "3john": "3JN",
  "3 john": "3JN",
  jud: "JUD",
  jude: "JUD",
  rev: "REV",
  revelation: "REV"
};

const LANGUAGE_MODIFIERS: Record<string, string> = {
  "/en": "catholic_org",
  "/eng": "catholic_org",
  "/njb": "catholic_org",
  "/chi": "sigao",
  "/zh": "sigao",
  "/sigao": "sigao",
  "/ja": "shinkyo",
  "/jap": "shinkyo",
  "/jpn": "shinkyo",
  "/shinkyo": "shinkyo",
  "/lat": "vulgate",
  "/latin": "vulgate",
  "/vulgate": "vulgate"
};

export interface ParsedReference {
  panel: PanelState;
  translationId?: string;
  verse?: number;
}

export interface SearchResult {
  panel: PanelState;
  translationId?: string;
  verse?: number;
  verseEnd?: number;
  raw: string;
}

export function parseReference(input: string): ParsedReference | null {
  const normalized = input.trim();

  const modifierMatch = normalized.match(
    /(\s+)?(\/(?:en|eng|njb|chi|zh|ja|jap|jpn|lat|latin|sigao|vulgate|shinkyo))$/i
  );

  const modifier = modifierMatch?.[2]?.toLowerCase();
  const translationId = modifier ? LANGUAGE_MODIFIERS[modifier] : undefined;

  const reference = modifierMatch
    ? normalized.slice(0, modifierMatch.index).trim()
    : normalized;

  const match = reference.match(
    /^((?:\d\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+))?$/i
  );

  if (!match) {
    return null;
  }

  const rawBook = match[1].toLowerCase().replace(/\s+/g, " ").trim();
  const bookCode = BOOK_ALIASES[rawBook];

  if (!bookCode) {
    return null;
  }

  return {
    panel: {
      translationId: translationId ?? "catholic_org",
      bookCode,
      chapter: Number(match[2])
    },
    translationId,
    verse: match[3] ? Number(match[3]) : undefined
  };
}

export function parseSearchQuery(input: string): SearchResult[] {
  const normalized = input.trim();

  if (!normalized) {
    return [];
  }

  const results: SearchResult[] = [];
  const passages = normalized.split(/\s*;\s*/);

  let inheritedBook: string | undefined;
  let inheritedChapter: number | undefined;

  for (const passage of passages) {
    const trimmed = passage.trim();

    if (!trimmed) {
      continue;
    }

    const modifierMatch = trimmed.match(
      /(\s+)?(\/(?:en|eng|njb|chi|zh|ja|jap|jpn|lat|latin|sigao|vulgate|shinkyo))$/i
    );

    const modifier = modifierMatch?.[2]?.toLowerCase();
    const translationId = modifier ? LANGUAGE_MODIFIERS[modifier] : undefined;
    const withoutModifier = modifierMatch
      ? trimmed.slice(0, modifierMatch.index).trim()
      : trimmed;

    const firstMatch = withoutModifier.match(
      /^((?:\d\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/i
    );

    let bookCode: string | undefined;
    let chapter: number | undefined;

    if (firstMatch) {
      const rawBook = firstMatch[1]
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      bookCode = BOOK_ALIASES[rawBook];

      if (bookCode) {
        chapter = Number(firstMatch[2]);
        inheritedBook = bookCode;
        inheritedChapter = chapter;
      }
    }

    if (!bookCode || !chapter) {
      const chapterVerseMatch = withoutModifier.match(
        /^(\d+):(\d+)(?:-(\d+))?$/
      );

      if (chapterVerseMatch && inheritedBook) {
        const cvChapter = Number(chapterVerseMatch[1]);
        const cvVerseStart = Number(chapterVerseMatch[2]);
        const cvVerseEnd = chapterVerseMatch[3]
          ? Number(chapterVerseMatch[3])
          : cvVerseStart;

        results.push({
          panel: {
            translationId: translationId ?? "catholic_org",
            bookCode: inheritedBook,
            chapter: cvChapter
          },
          translationId,
          verse: cvVerseStart,
          verseEnd: cvVerseEnd,
          raw: withoutModifier
        });

        inheritedChapter = cvChapter;
        continue;
      }

      bookCode = inheritedBook;
      chapter = inheritedChapter;
    }

    if (!bookCode || !chapter) {
      continue;
    }

    const rest = firstMatch
      ? withoutModifier.slice(firstMatch[0].length).trim()
      : withoutModifier;

    const commaParts = rest ? rest.split(/\s*,\s*/) : [];

    const partsToProcess: Array<{
      verseStart?: number;
      verseEnd?: number;
      raw: string;
    }> = [];

    if (firstMatch) {
      const verseStart = firstMatch[3] ? Number(firstMatch[3]) : undefined;
      const verseEnd = firstMatch[4]
        ? Number(firstMatch[4])
        : verseStart;

      partsToProcess.push({
        verseStart,
        verseEnd,
        raw: firstMatch[0]
      });
    }

    for (const part of commaParts) {
      const rangeMatch = part.match(/^(\d+)(?:-(\d+))?$/);

      if (rangeMatch) {
        partsToProcess.push({
          verseStart: Number(rangeMatch[1]),
          verseEnd: rangeMatch[2]
            ? Number(rangeMatch[2])
            : Number(rangeMatch[1]),
          raw: part
        });
      }
    }

    for (const part of partsToProcess) {
      if (part.verseStart === undefined) {
        continue;
      }

      results.push({
        panel: {
          translationId: translationId ?? "catholic_org",
          bookCode,
          chapter
        },
        translationId,
        verse: part.verseStart,
        verseEnd: part.verseEnd,
        raw: part.raw
      });
    }
  }

  return results;
}
