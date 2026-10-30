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
  { code: "GEN", aliases: ["genesis", "gen", "ge", "创", "创世", "创世纪", "创世记", "創世記"] },
  { code: "EXO", aliases: ["exodus", "exod", "exo", "ex", "出", "出谷", "出埃及", "出谷纪", "出埃及记", "出エジプト記"] },
  { code: "LEV", aliases: ["leviticus", "lev", "le", "利", "肋", "肋未", "利未", "肋未纪", "利未记", "レビ記"] },
  { code: "NUM", aliases: ["numbers", "num", "nu", "户", "民", "户籍", "民数", "户籍纪", "民数记", "民数記"] },
  { code: "DEU", aliases: ["deuteronomy", "deut", "deu", "dt", "申", "申命", "申命纪", "申命记", "申命記"] },
  { code: "JOS", aliases: ["joshua", "josh", "jos", "书", "若", "若苏厄", "约书亚", "若苏厄书", "约书亚记", "ヨシュア記"] },
  { code: "JDG", aliases: ["judges", "judg", "jdg", "士", "民士", "民士纪", "士师", "士师记", "士師記"] },
  { code: "RUT", aliases: ["ruth", "rut", "ru", "卢", "路", "卢德", "路得", "卢德传", "路得记", "ルツ記"] },
  { code: "1SA", aliases: ["1samuel", "1sam", "1sa", "撒上", "撒母耳上", "撒慕尔纪上", "撒慕尔上", "撒上纪", "サムエル記上"] },
  { code: "2SA", aliases: ["2samuel", "2sam", "2sa", "撒下", "撒母耳下", "撒慕尔纪下", "撒慕尔下", "撒下纪", "サムエル記下"] },
  { code: "1KI", aliases: ["1kings", "1kgs", "1ki", "王上", "列王纪上", "列王上下", "列王纪", "列王記上"] },
  { code: "2KI", aliases: ["2kings", "2kgs", "2ki", "王下", "列王纪下", "列王記下"] },
  { code: "1CH", aliases: ["1chronicles", "1chron", "1ch", "代上", "历代志上", "编年纪上", "歴代誌上"] },
  { code: "2CH", aliases: ["2chronicles", "2chron", "2ch", "代下", "历代志下", "编年纪下", "歴代誌下"] },
  { code: "EZR", aliases: ["ezra", "ezr", "厄", "以", "厄斯德拉", "以斯拉", "厄斯德拉上", "エズラ記"] },
  { code: "NEH", aliases: ["nehemiah", "neh", "厄下", "厄斯德拉下", "尼希米", "尼希米记", "ネヘミヤ記"] },
  { code: "TOB", aliases: ["tobit", "tob", "多", "多俾亚", "多俾亚传", "トビト記"] },
  { code: "JDT", aliases: ["judith", "jdt", "友", "犹", "友弟德", "友弟德传", "ユディト記"] },
  { code: "EST", aliases: ["esther", "est", "艾", "以", "艾斯德尔", "以斯帖", "以斯帖记", "エステル記"] },
  { code: "1MA", aliases: ["1maccabees", "1macc", "1ma", "加上", "玛加伯上", "玛加伯纪上", "マカバイ記一"] },
  { code: "2MA", aliases: ["2maccabees", "2macc", "2ma", "加下", "玛加伯下", "玛加伯纪下", "マカバイ記二"] },
  { code: "JOB", aliases: ["job", "jb", "约", "约伯", "约伯传", "约伯记", "ヨブ記"] },
  { code: "PSA", aliases: ["psalms", "psalm", "psa", "ps", "诗", "咏", "圣咏", "诗篇", "圣咏集", "詩編"] },
  { code: "PRO", aliases: ["proverbs", "prov", "pro", "pr", "箴", "箴言", "箴言篇", "箴言"] },
  { code: "ECC", aliases: ["ecclesiastes", "eccl", "ecc", "传", "训", "训道篇", "传道书", "コヘレトの言葉"] },
  { code: "SNG", aliases: ["songofsolomon", "songofsongs", "song", "sos", "歌", "雅", "雅歌", "雅歌"] },
  { code: "WIS", aliases: ["wisdom", "wis", "智", "智慧篇", "知恵の書"] },
  { code: "SIR", aliases: ["sirach", "sir", "德", "德训篇", "シラ書"] },
  { code: "ISA", aliases: ["isaiah", "isa", "is", "赛", "依", "依撒意亚", "以赛亚", "以赛亚书", "イザヤ書"] },
  { code: "JER", aliases: ["jeremiah", "jer", "耶", "耶肋米亚", "耶利米", "耶利米书", "エレミヤ書"] },
  { code: "LAM", aliases: ["lamentations", "lam", "哀", "哀歌", "耶肋米亚哀歌", "耶利米哀歌", "哀歌"] },
  { code: "BAR", aliases: ["baruch", "bar", "巴", "巴路克", "バルク書"] },
  { code: "EZK", aliases: ["ezekiel", "ezek", "ezk", "结", "厄", "厄则克耳", "以西结", "以西结书", "エゼキエル書"] },
  { code: "DAN", aliases: ["daniel", "dan", "da", "但", "达", "达尼尔", "但以理", "但以理书", "ダニエル書"] },
  { code: "HOS", aliases: ["hosea", "hos", "何", "欧", "欧瑟亚", "何西阿书", "ホセア書"] },
  { code: "JOL", aliases: ["joel", "joe", "jol", "珥", "岳", "岳厄尔", "约珥书", "ヨエル書"] },
  { code: "AMO", aliases: ["amos", "amo", "am", "摩", "阿", "阿摩司", "亚毛斯", "アモス書"] },
  { code: "OBA", aliases: ["obadiah", "oba", "ob", "俄", "亚", "亚北底亚", "俄巴底亚书", "オバデヤ書"] },
  { code: "JON", aliases: ["jonah", "jon", "拿", "纳", "约拿", "约拿书", "约纳", "ヨナ書"] },
  { code: "MIC", aliases: ["micah", "mic", "弥", "米", "弥迦", "米该亚", "ミカ書"] },
  { code: "NAM", aliases: ["nahum", "nah", "nam", "鸿", "纳", "那鸿", "鸿书", "ナホム書"] },
  { code: "HAB", aliases: ["habakkuk", "hab", "哈", "哈巴谷", "哈巴谷书", "ハバクク書"] },
  { code: "ZEP", aliases: ["zephaniah", "zeph", "zep", "番", "索", "西番雅", "索福尼亚", "ゼファニヤ書"] },
  { code: "HAG", aliases: ["haggai", "hag", "该", "哈", "哈该", "哈盖", "ハガイ書"] },
  { code: "ZEC", aliases: ["zechariah", "zech", "zec", "亚", "匝", "撒迦利亚", "匝加利亚", "ゼカリヤ書"] },
  { code: "MAL", aliases: ["malachi", "mal", "玛", "玛拉基", "玛拉基亚", "マラキ書"] },
  { code: "MAT", aliases: ["matthew", "matt", "mat", "mt", "太", "玛", "马太", "玛窦", "马太福音", "玛窦福音", "マタイによる福音書"] },
  { code: "MRK", aliases: ["mark", "mrk", "mk", "马", "谷", "马可", "马尔谷", "马可福音", "马尔谷福音", "マルコによる福音書"] },
  { code: "LUK", aliases: ["luke", "luk", "lk", "路", "路加", "路加福音", "ルカによる福音書"] },
  { code: "JHN", aliases: ["john", "jhn", "jn", "约", "若", "约翰", "若望", "约翰福音", "若望福音", "ヨハネによる福音書"] },
  { code: "ACT", aliases: ["acts", "act", "ac", "徒", "宗", "使徒行传", "宗徒大事录", "使徒言行録"] },
  { code: "ROM", aliases: ["romans", "rom", "ro", "罗", "罗马", "罗马书", "ローマの信徒への手紙"] },
  { code: "1CO", aliases: ["1corinthians", "1cor", "1co", "林前", "格前", "哥林多前书", "格林多前书", "コリントの信徒への手紙一"] },
  { code: "2CO", aliases: ["2corinthians", "2cor", "2co", "林后", "格后", "哥林多后书", "格林多后书", "コリントの信徒への手紙二"] },
  { code: "GAL", aliases: ["galatians", "gal", "ga", "加", "迦", "加拉太", "迦拉达", "加拉太书", "迦拉达书", "ガラテヤの信徒への手紙"] },
  { code: "EPH", aliases: ["ephesians", "eph", "ep", "弗", "厄", "以弗所", "厄弗所", "以弗所书", "厄弗所书", "エフェソの信徒への手紙"] },
  { code: "PHP", aliases: ["philippians", "phil", "php", "腓", "斐", "腓立比", "斐理伯", "腓立比书", "斐理伯书", "フィリピの信徒への手紙"] },
  { code: "COL", aliases: ["colossians", "col", "西", "哥", "歌罗西", "哥罗森", "歌罗西书", "哥罗森书", "コロサイの信徒への手紙"] },
  { code: "1TH", aliases: ["1thessalonians", "1thess", "1th", "帖前", "得前", "帖撒罗尼迦前书", "得撒洛尼前书", "テサロニケの信徒への手紙一"] },
  { code: "2TH", aliases: ["2thessalonians", "2thess", "2th", "帖后", "得后", "帖撒罗尼迦后书", "得撒洛尼后书", "テサロニケの信徒への手紙二"] },
  { code: "1TI", aliases: ["1timothy", "1tim", "1ti", "提前", "弟前", "提摩太前书", "弟茂德前书", "テモテへの手紙一"] },
  { code: "2TI", aliases: ["2timothy", "2tim", "2ti", "提后", "弟后", "提摩太后书", "弟茂德后书", "テモテへの手紙二"] },
  { code: "TIT", aliases: ["titus", "tit", "ti", "多", "弟", "提多", "弟铎", "提多书", "弟铎书", "テトスへの手紙"] },
  { code: "PHM", aliases: ["philemon", "phm", "门", "费", "腓利门", "费肋孟", "腓利门书", "费肋孟书", "フィレモンへの手紙"] },
  { code: "HEB", aliases: ["hebrews", "heb", "he", "来", "希", "希伯来", "希伯来书", "ヘブライ人への手紙"] },
  { code: "JAS", aliases: ["james", "jas", "jm", "雅", "雅各", "雅各伯", "雅各书", "雅各伯书", "ヤコブの手紙"] },
  { code: "1PE", aliases: ["1peter", "1pet", "1pe", "彼前", "伯前", "彼得前书", "伯多禄前书", "ペトロの手紙一"] },
  { code: "2PE", aliases: ["2peter", "2pet", "2pe", "彼后", "伯后", "彼得后书", "伯多禄后书", "ペトロの手紙二"] },
  { code: "1JN", aliases: ["1john", "1jhn", "1jn", "约一", "若一", "约翰一书", "若望一书", "ヨハネの手紙一"] },
  { code: "2JN", aliases: ["2john", "2jhn", "2jn", "约二", "若二", "约翰二书", "若望二书", "ヨハネの手紙二"] },
  { code: "3JN", aliases: ["3john", "3jhn", "3jn", "约三", "若三", "约翰三书", "若望三书", "ヨハネの手紙三"] },
  { code: "JUD", aliases: ["jude", "jud", "犹", "犹达", "犹大", "犹大书", "犹达书", "ユダの手紙"] },
  { code: "REV", aliases: ["revelation", "rev", "re", "启", "默", "启示录", "若望默示录", "ヨハネの黙示録"] }
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

export function resolveTranslationId(token: string): string | undefined {
  const lower = token.toLowerCase().trim();
  if (["sigao", "zh", "chi", "chinese", "思高"].includes(lower)) {
    return "sigao";
  }
  if (["catholic", "catholic_org", "en", "eng", "english"].includes(lower)) {
    return "catholic_org";
  }
  if (["shinkyo", "ja", "jap", "jpn", "japanese", "新共同訳"].includes(lower)) {
    return "shinkyo";
  }
  if (["vulgate", "la", "lat", "latin"].includes(lower)) {
    return "vulgate";
  }
  return undefined;
}

export function extractLanguageModifiers(query: string): {
  reference: string;
  translationId?: string;
  rightTranslationId?: string;
} {
  let normalized = normalizeSearchQuery(query);
  let translationId: string | undefined;
  let rightTranslationId: string | undefined;

  const tagRegex = /[@#/]([a-zA-Z0-9_\u4e00-\u9fa5]+)(?:\s*[,/@# ]\s*([a-zA-Z0-9_\u4e00-\u9fa5]+))?/g;

  normalized = normalized.replace(tagRegex, (match, tag1, tag2) => {
    const trans1 = resolveTranslationId(tag1);
    if (trans1) {
      if (!translationId) {
        translationId = trans1;
      } else if (!rightTranslationId && trans1 !== translationId) {
        rightTranslationId = trans1;
      }

      if (tag2) {
        const trans2 = resolveTranslationId(tag2);
        if (trans2) {
          if (!rightTranslationId && trans2 !== translationId) {
            rightTranslationId = trans2;
          }
          return "";
        }
        return ` ${tag2}`;
      }
      return "";
    }
    return match;
  });

  return {
    reference: normalizeSearchQuery(normalized),
    translationId,
    rightTranslationId
  };
}

export function parseReference(
  input: string,
  defaultBookCode?: string,
  defaultChapter?: number
): ParsedReference | null {
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
    // 1. Colon followed by verse: e.g. ":38" or ":38-40"
    const colonVersePattern = /^[:：]\s*(\d+)(?:\s*[-–~到至 ]\s*(\d+))?$/;
    const colonVerseMatch = reference.match(colonVersePattern);
    if (colonVerseMatch) {
      const verse = parseInt(colonVerseMatch[1], 10);
      const verseEnd = colonVerseMatch[2] ? parseInt(colonVerseMatch[2], 10) : undefined;
      return {
        panel: { bookCode: defaultBookCode, chapter: defaultChapter ?? 1 },
        verse,
        verseEnd,
        translationId,
        rightTranslationId
      };
    }

    // 2. Both chapter and verse: e.g. "4:5" or "4:5-8"
    const cvPattern = /^(\d+)[\s:：]+(\d+)(?:\s*[-–~到至 ]\s*(\d+))?$/;
    const cvMatch = reference.match(cvPattern);
    if (cvMatch) {
      const chapter = parseInt(cvMatch[1], 10);
      const verse = parseInt(cvMatch[2], 10);
      const verseEnd = cvMatch[3] ? parseInt(cvMatch[3], 10) : undefined;
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

    // 3. Number ending with a colon: e.g. "7:" or "7：" -> explicit chapter request
    const chapterOnlyPattern = /^(\d+)[\s:：]+$/;
    const chapterOnlyMatch = reference.match(chapterOnlyPattern);
    if (chapterOnlyMatch) {
      const chapter = parseInt(chapterOnlyMatch[1], 10);
      if (!isNaN(chapter)) {
        return {
          panel: { bookCode: defaultBookCode, chapter },
          verse: undefined,
          verseEnd: undefined,
          translationId,
          rightTranslationId
        };
      }
    }

    // 4. Naked number or range without colon: e.g. "38" or "38-40"
    // When a chapter is already established (e.g. from John 6:35), naked numbers are verses.
    // Chapters are only rendered if the number ends with ":".
    const nakedPattern = /^(\d+)(?:\s*[-–~到至 ]\s*(\d+))?$/;
    const nakedMatch = reference.match(nakedPattern);
    if (nakedMatch) {
      const num1 = parseInt(nakedMatch[1], 10);
      const num2 = nakedMatch[2] ? parseInt(nakedMatch[2], 10) : undefined;
      if (!isNaN(num1)) {
        if (defaultChapter !== undefined) {
          return {
            panel: { bookCode: defaultBookCode, chapter: defaultChapter },
            verse: num1,
            verseEnd: num2,
            translationId,
            rightTranslationId
          };
        }
        return {
          panel: { bookCode: defaultBookCode, chapter: num1 },
          verse: undefined,
          verseEnd: undefined,
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
  const { reference: cleanQuery, translationId: globalTrans, rightTranslationId: globalRightTrans } = extractLanguageModifiers(query);
  const trimmed = cleanQuery.trim();
  if (!trimmed) return [];

  if (!/\d/.test(trimmed)) {
    const standalone = parseReference(trimmed);
    if (standalone) {
      if (!standalone.translationId && globalTrans) standalone.translationId = globalTrans;
      if (!standalone.rightTranslationId && globalRightTrans) standalone.rightTranslationId = globalRightTrans;
      return [standalone];
    }
    return [];
  }

  const parts = trimmed.split(/[,;]+/);
  const references: ParsedReference[] = [];
  let currentBookCode: string | undefined;
  let currentChapter: number | undefined;

  for (const part of parts) {
    const item = part.trim();
    if (!item) continue;

    const ref = parseReference(item, currentBookCode, currentChapter);
    if (ref) {
      if (!ref.translationId && globalTrans) ref.translationId = globalTrans;
      if (!ref.rightTranslationId && globalRightTrans) ref.rightTranslationId = globalRightTrans;
      currentBookCode = ref.panel.bookCode;
      currentChapter = ref.panel.chapter;
      references.push(ref);
    }
  }

  return references;
}
