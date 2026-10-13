export interface ParsedReference {
  panel: {
    bookCode: string;
    chapter: number;
  };
  verse?: number;
  verseEnd?: number;
  translationId?: string;
  rightTranslationId?: string;
}

export function normalizeSearchQuery(query: string): string {
  return query
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");
}

interface BookAliasMap {
  code: string;
  aliases: string[];
}

const BOOK_REGISTRY: BookAliasMap[] = [
  { code: "GEN", aliases: ["genesis", "gen", "ge", "创", "创世", "创世纪", "创世记"] },
  { code: "EXO", aliases: ["exodus", "exod", "exo", "ex", "出", "出谷", "出谷纪", "出埃及记"] },
  { code: "LEV", aliases: ["leviticus", "lev", "le", "肋", "肋未", "肋未纪", "利未记"] },
  { code: "NUM", aliases: ["numbers", "num", "nu", "户", "户籍", "户籍纪", "民数记"] },
  { code: "DEU", aliases: ["deuteronomy", "deut", "deu", "dt", "申", "申命", "申命纪", "申命记"] },
  { code: "JOS", aliases: ["joshua", "josh", "jos", "苏", "若苏厄", "若苏厄书", "约书亚记"] },
  { code: "JDG", aliases: ["judges", "judg", "jdg", "民", "士", "民长纪", "士师记"] },
  { code: "RUT", aliases: ["ruth", "rut", "ru", "卢", "卢德", "卢德传", "路得记"] },
  { code: "1SA", aliases: ["1samuel", "1sam", "1sa", "撒上", "撒母耳纪上"] },
  { code: "2SA", aliases: ["2samuel", "2sam", "2sa", "撒下", "撒母耳纪下"] },
  { code: "1KI", aliases: ["1kings", "1kgs", "1ki", "列上", "列王纪上"] },
  { code: "2KI", aliases: ["2kings", "2kgs", "2ki", "列下", "列王纪下"] },
  { code: "1CH", aliases: ["1chronicles", "1chron", "1ch", "编上", "历代志上"] },
  { code: "2CH", aliases: ["2chronicles", "2chron", "2ch", "编下", "历代志下"] },
  { code: "EZR", aliases: ["ezra", "ezr", "厄", "厄斯德拉上", "以斯拉记"] },
  { code: "NEH", aliases: ["nehemiah", "neh", "乃", "乃赫米亚", "尼希米记"] },
  { code: "TOB", aliases: ["tobit", "tob", "多", "多俾亚传"] },
  { code: "JDT", aliases: ["judith", "jdt", "友", "友弟德传"] },
  { code: "EST", aliases: ["esther", "est", "艾", "艾斯德尔", "以斯帖记"] },
  { code: "1MA", aliases: ["1maccabees", "1macc", "1ma", "玛上", "玛加伯上"] },
  { code: "2MA", aliases: ["2maccabees", "2macc", "2ma", "玛下", "玛加伯下"] },
  { code: "JOB", aliases: ["job", "jb", "约", "约伯传", "约伯记"] },
  { code: "PSA", aliases: ["psalms", "psalm", "psa", "ps", "咏", "诗", "圣咏", "诗篇"] },
  { code: "PRO", aliases: ["proverbs", "prov", "pro", "pr", "箴", "箴言"] },
  { code: "ECC", aliases: ["ecclesiastes", "eccl", "ecc", "训", "传", "训道篇", "传道书"] },
  { code: "SNG", aliases: ["songofsolomon", "songofsongs", "song", "sos", "歌", "雅歌"] },
  { code: "WIS", aliases: ["wisdom", "wis", "智", "智慧篇"] },
  { code: "SIR", aliases: ["sirach", "sir", "德", "德训篇"] },
  { code: "ISA", aliases: ["isaiah", "isa", "is", "依", "赛", "依撒意亚", "以赛亚书"] },
  { code: "JER", aliases: ["jeremiah", "jer", "耶", "耶肋米亚", "耶利米书"] },
  { code: "LAM", aliases: ["lamentations", "lam", "哀", "哀歌"] },
  { code: "BAR", aliases: ["baruch", "bar", "巴", "巴路克"] },
  { code: "EZK", aliases: ["ezekiel", "ezek", "ezk", "结", "厄则克耳", "以西结书"] },
  { code: "DAN", aliases: ["daniel", "dan", "da", "达", "但", "达尼尔", "但以理书"] },
  { code: "HOS", aliases: ["hosea", "hos", "欧", "何", "欧瑟亚", "何西阿书"] },
  { code: "JOL", aliases: ["joel", "joe", "jol", "岳", "珥", "岳厄尔", "约珥书"] },
  { code: "AMO", aliases: ["amos", "amo", "am", "摩", "亚毛斯", "阿摩司书"] },
  { code: "OBA", aliases: ["obadiah", "oba", "ob", "俄", "俄巴底亚书"] },
  { code: "JON", aliases: ["jonah", "jon", "纳", "拿", "约纳", "约拿书"] },
  { code: "MIC", aliases: ["micah", "mic", "米", "米该亚书"] },
  { code: "NAM", aliases: ["nahum", "nah", "nam", "鸿", "那鸿书"] },
  { code: "HAB", aliases: ["habakkuk", "hab", "哈", "哈巴谷书"] },
  { code: "ZEP", aliases: ["zephaniah", "zeph", "zep", "索", "番", "索福尼亚", "西番雅书"] },
  { code: "HAG", aliases: ["haggai", "hag", "哈该书"] },
  { code: "ZEC", aliases: ["zechariah", "zech", "zec", "匝", "匝加利亚", "撒迦利亚书"] },
  { code: "MAL", aliases: ["malachi", "mal", "玛拉基书"] },
  { code: "MAT", aliases: ["matthew", "matt", "mat", "mt", "玛", "太", "玛窦福音", "马太福音"] },
  { code: "MRK", aliases: ["mark", "mrk", "mk", "谷", "可", "马尔谷福音", "马可福音"] },
  { code: "LUK", aliases: ["luke", "luk", "lk", "路", "路加福音"] },
  { code: "JHN", aliases: ["john", "jhn", "jn", "若", "约", "若望福音", "约翰福音"] },
  { code: "ACT", aliases: ["acts", "act", "ac", "宗", "徒", "宗徒大事录", "使徒行传"] },
  { code: "ROM", aliases: ["romans", "rom", "ro", "罗", "罗马书"] },
  { code: "1CO", aliases: ["1corinthians", "1cor", "1co", "格前", "林前", "格林多前书", "哥林多前书"] },
  { code: "2CO", aliases: ["2corinthians", "2cor", "2co", "格后", "林后", "格林多后书", "哥林多后书"] },
  { code: "GAL", aliases: ["galatians", "gal", "ga", "加", "迦", "迦拉达书", "加拉太书"] },
  { code: "EPH", aliases: ["ephesians", "eph", "ep", "以", "厄弗所书", "以弗所书"] },
  { code: "PHP", aliases: ["philippians", "phil", "php", "斐", "腓", "斐理伯书", "腓立比书"] },
  { code: "COL", aliases: ["colossians", "col", "哥", "歌", "哥罗森书", "歌罗西书"] },
  { code: "1TH", aliases: ["1thessalonians", "1thess", "1th", "得前", "帖前", "得撒洛尼前书", "帖撒罗尼迦前书"] },
  { code: "2TH", aliases: ["2thessalonians", "2thess", "2th", "得后", "帖后", "得撒洛尼后书", "帖撒罗尼迦后书"] },
  { code: "1TI", aliases: ["1timothy", "1tim", "1ti", "弟前", "提前", "弟茂德前书", "提摩太前书"] },
  { code: "2TI", aliases: ["2timothy", "2tim", "2ti", "弟后", "提后", "弟茂德后书", "提摩太后书"] },
  { code: "TIT", aliases: ["titus", "tit", "ti", "弟铎书", "提多书"] },
  { code: "PHM", aliases: ["philemon", "phm", "费", "门", "费肋孟书", "腓利门书"] },
  { code: "HEB", aliases: ["hebrews", "heb", "he", "希", "来", "希伯来书"] },
  { code: "JAS", aliases: ["james", "jas", "jm", "雅", "雅各伯书", "雅各书"] },
  { code: "1PE", aliases: ["1peter", "1pet", "1pe", "伯前", "彼前", "伯多禄前书", "彼得前书"] },
  { code: "2PE", aliases: ["2peter", "2pet", "2pe", "伯后", "彼后", "伯多禄后书", "彼得后书"] },
  { code: "1JN", aliases: ["1john", "1jhn", "1jn", "若一", "约一", "若望一书", "约翰一书"] },
  { code: "2JN", aliases: ["2john", "2jhn", "2jn", "若二", "约二", "若望二书", "约翰二书"] },
  { code: "3JN", aliases: ["3john", "3jhn", "3jn", "若三", "约三", "若望三书", "约翰三书"] },
  { code: "JUD", aliases: ["jude", "jud", "犹", "犹达书", "犹大书"] },
  { code: "REV", aliases: ["revelation", "rev", "re", "默", "启", "若望默示录", "启示录"] }
];

interface NormalizedAliasEntry {
  alias: string;
  code: string;
  isCJK: boolean;
}

const INDEX: NormalizedAliasEntry[] = [];
for (const entry of BOOK_REGISTRY) {
  for (const alias of entry.aliases) {
    const clean = alias.toLowerCase().replace(/[\s\-_.]/g, "");
    INDEX.push({
      alias: clean,
      code: entry.code,
      isCJK: /[\u4e00-\u9fa5]/.test(clean)
    });
  }
}
INDEX.sort((a, b) => b.alias.length - a.alias.length);

export function resolveBookCode(input: string): string | null {
  const clean = input.toLowerCase().replace(/[\s\-_.]/g, "");
  if (!clean) return null;

  const exact = INDEX.find((e) => e.alias === clean);
  if (exact) return exact.code;

  const isCjk = /[\u4e00-\u9fa5]/.test(clean);
  if (isCjk) {
    const cjkPrefix = INDEX.find((e) => e.isCJK && e.alias.startsWith(clean));
    if (cjkPrefix) return cjkPrefix.code;
  } else if (clean.length >= 3) {
    const prefixCandidate = INDEX.find((e) => !e.isCJK && e.alias.startsWith(clean));
    if (prefixCandidate) return prefixCandidate.code;
  }

  return null;
}

export function extractLanguageModifiers(query: string): {
  reference: string;
  translationId?: string;
  rightTranslationId?: string;
} {
  let normalized = normalizeSearchQuery(query);
  let translationId: string | undefined;
  let rightTranslationId: string | undefined;

  const tagRegex = /[@#/]([a-zA-Z0-9_\u4e00-\u9fa5]+)/g;
  normalized = normalized.replace(tagRegex, (_, tag) => {
    const lower = tag.toLowerCase();
    if (lower === "sigao" || lower === "zh" || lower === "思高") {
      translationId = "sigao";
    } else if (lower === "catholic" || lower === "catholic_org" || lower === "en") {
      translationId = "catholic_org";
    }
    return "";
  });

  return {
    reference: normalizeSearchQuery(normalized),
    translationId,
    rightTranslationId
  };
}

export function parseReference(input: string, defaultBookCode?: string): ParsedReference | null {
  const { reference, translationId, rightTranslationId } = extractLanguageModifiers(input);
  if (!reference) return null;

  const explicitPattern = /^([1-3]?\s*[\u3040-\u30ff\u4e00-\u9fa5a-zA-Z\s]+?)\s*(\d+)[\s: ]*(\d+)?(?:\s*[- ]\s*(\d+))?$/;
  const explicitMatch = reference.match(explicitPattern);
  if (explicitMatch) {
    const rawBook = explicitMatch[1].trim();
    const chapter = parseInt(explicitMatch[2], 10);
    const verse = explicitMatch[3] ? parseInt(explicitMatch[3], 10) : undefined;
    const verseEnd = explicitMatch[4] ? parseInt(explicitMatch[4], 10) : undefined;

    const bookCode = resolveBookCode(rawBook);
    if (bookCode && !isNaN(chapter)) {
      return {
        panel: { bookCode, chapter },
        verse,
        verseEnd,
        translationId,
        rightTranslationId
      };
    }
  }

  if (defaultBookCode) {
    const nakedPattern = /^(\d+)[\s: ]*(\d+)?(?:\s*[- ]\s*(\d+))?$/;
    const nakedMatch = reference.match(nakedPattern);
    if (nakedMatch) {
      const chapter = parseInt(nakedMatch[1], 10);
      const verse = nakedMatch[2] ? parseInt(nakedMatch[2], 10) : undefined;
      const verseEnd = nakedMatch[3] ? parseInt(nakedMatch[3], 10) : undefined;
      if (!isNaN(chapter)) {
        return {
          panel: { bookCode: defaultBookCode, chapter },
          verse,
          verseEnd,
          translationId,
          rightTranslationId
        };
      }
    }
  }

  if (!/\s/.test(reference)) {
    const standaloneBookCode = resolveBookCode(reference);
    if (standaloneBookCode) {
      return {
        panel: { bookCode: standaloneBookCode, chapter: 1 },
        translationId,
        rightTranslationId
      };
    }
  }

  return null;
}

export function parseSearchQuery(query: string): ParsedReference[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!/\d/.test(trimmed)) {
    const standalone = parseReference(trimmed);
    return standalone ? [standalone] : [];
  }

  const parts = trimmed.split(/[,;]+/);
  const references: ParsedReference[] = [];
  let currentBookCode: string | undefined;

  for (const part of parts) {
    const item = part.trim();
    if (!item) continue;

    const ref = parseReference(item, currentBookCode);
    if (ref) {
      currentBookCode = ref.panel.bookCode;
      references.push(ref);
    }
  }

  return references;
}
