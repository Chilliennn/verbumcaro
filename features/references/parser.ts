import { BOOK_NAMES } from "../../lib/data/book_names";
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

for (const [code, names] of Object.entries(BOOK_NAMES)) {
  for (const name of Object.values(names)) {
    BOOK_ALIASES[name.toLowerCase()] ??= code;
  }
}

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

export function extractLanguageModifiers(input: string) {
  const aliases = Object.keys(LANGUAGE_MODIFIERS).map((alias) => alias.slice(1)).join("|");
  const match = input.match(new RegExp(`\\s*\\/(${aliases})(?:\\s+\\/?(${aliases}))?$`, "i"));
  return {
    reference: match ? input.slice(0, match.index).trim() : input.trim(),
    translationId: match ? LANGUAGE_MODIFIERS[`/${match[1].toLowerCase()}`] : undefined,
    rightTranslationId: match?.[2] ? LANGUAGE_MODIFIERS[`/${match[2].toLowerCase()}`] : undefined
  };
}

export interface ParsedReference {
  panel: PanelState;
  translationId?: string;
  rightTranslationId?: string;
  verse?: number;
}

export interface SearchResult {
  panel: PanelState;
  translationId?: string;
  rightTranslationId?: string;
  verse?: number;
  verseEnd?: number;
  raw: string;
}

export function parseReference(input: string): ParsedReference | null {
  const normalized = input.trim();

  const { reference, translationId, rightTranslationId } = extractLanguageModifiers(normalized);

  const match = reference.match(
    /^([\p{L}\p{N}\s]+?)\s*(\d+)(?::(\d+))?$/iu
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
    rightTranslationId,
    verse: match[3] ? Number(match[3]) : undefined
  };
}

export function parseSearchQuery(input: string): SearchResult[] {
  const results: SearchResult[] = [];
  let inheritedBook: string | undefined;
  let inheritedChapter: number | undefined;

  for (const passage of input.trim().split(/\s*;\s*/)) {
    const { reference, translationId, rightTranslationId } = extractLanguageModifiers(passage);

    for (const part of reference.split(/\s*,\s*/)) {
      if (!part) continue;
      const full = part.match(
        /^([\p{L}\p{N}\s]+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/iu
      );
      const chapterVerse = part.match(/^(\d+):(\d+)(?:-(\d+))?$/);
      const verseOnly = part.match(/^(\d+)(?:-(\d+))?$/);
      let bookCode = inheritedBook;
      let chapter = inheritedChapter;
      let verse: number | undefined;
      let verseEnd: number | undefined;

      if (full && /\p{L}/u.test(full[1])) {
        bookCode = BOOK_ALIASES[full[1].toLowerCase().replace(/\s+/g, " ").trim()];
        chapter = Number(full[2]);
        verse = full[3] ? Number(full[3]) : undefined;
        verseEnd = full[4] ? Number(full[4]) : verse;
      } else if (chapterVerse) {
        chapter = Number(chapterVerse[1]);
        verse = Number(chapterVerse[2]);
        verseEnd = chapterVerse[3] ? Number(chapterVerse[3]) : verse;
      } else if (verseOnly) {
        verse = Number(verseOnly[1]);
        verseEnd = verseOnly[2] ? Number(verseOnly[2]) : verse;
      } else {
        continue;
      }

      if (!bookCode || !chapter) continue;
      inheritedBook = bookCode;
      inheritedChapter = chapter;
      results.push({
        panel: { translationId: translationId ?? "catholic_org", bookCode, chapter },
        translationId,
        rightTranslationId,
        verse,
        verseEnd,
        raw: part
      });
    }
  }

  return results;
}
