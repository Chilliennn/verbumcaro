import type { PanelState } from "../reader/readerTypes";

const BOOK_ALIASES: Record<string, string> = {
  john: "JHN",
  jn: "JHN",
  "1 john": "1JN",
  "1jn": "1JN",
  "2 john": "2JN",
  "2jn": "2JN",
  "3 john": "3JN",
  "3jn": "3JN",
  matthew: "MAT",
  matt: "MAT",
  mark: "MRK",
  mk: "MRK",
  luke: "LUK",
  lk: "LUK",
  acts: "ACT"
};

const MODIFIERS: Record<string, string> = {
  "/en": "catholic_org",
  "/chi": "sigao",
  "/ja": "shinkyo",
  "/jp": "shinkyo",
  "/lat": "vulgate",
  "/latin": "vulgate",
  "/njb": "catholic_org",
  "/sigao": "sigao",
  "/vulgate": "vulgate"
};

export interface ParsedReference {
  panel: PanelState;
  translationId?: string;
}

export function parseReference(input: string): ParsedReference | null {
  const normalized = input.trim();

  const modifierMatch = normalized.match(
    /(\s+)?(\/(?:en|chi|ja|jp|lat|latin|njb|sigao|vulgate))$/i
  );

  const modifier = modifierMatch?.[2]?.toLowerCase();
  const translationId = modifier ? MODIFIERS[modifier] : undefined;

  const reference = modifierMatch
    ? normalized.slice(0, modifierMatch.index).trim()
    : normalized;

  const match = reference.match(
    /^((?:\d\s*)?[A-Za-z]+)\s+(\d+)(?::(\d+))?$/
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
    translationId
  };
}
