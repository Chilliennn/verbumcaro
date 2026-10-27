import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const translationsRoot = "public/data/translations";
const outputRoot = "public/data/search";

interface SearchVerse {
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ChapterData {
  verses: Array<{ verse: number; text: string }>;
}

function normalizeText(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

function getTokens(text: string): string[] {
  return [...new Set(normalizeText(text).match(/[\p{L}\p{N}]+/gu) ?? [])];
}

async function buildTranslationIndex(translationId: string): Promise<void> {
  const verses: SearchVerse[] = [];
  const postings = new Map<string, number[]>();
  const translationRoot = join(translationsRoot, translationId);
  const books = await readdir(translationRoot);

  for (const bookCode of books.filter((name) => !name.startsWith("."))) {
    const bookRoot = join(translationRoot, bookCode);
    const chapters = await readdir(bookRoot);

    for (const chapterFile of chapters.filter((name) => name.endsWith(".json"))) {
      const chapter = Number.parseInt(chapterFile, 10);
      const data = JSON.parse(
        await readFile(join(bookRoot, chapterFile), "utf8")
      ) as ChapterData;

      for (const verse of data.verses) {
        const index = verses.push({
          bookCode,
          chapter,
          verse: verse.verse,
          text: verse.text
        }) - 1;

        for (const token of getTokens(verse.text)) {
          const matches = postings.get(token);
          if (matches) {
            matches.push(index);
          } else {
            postings.set(token, [index]);
          }
        }
      }
    }
  }

  const index = {
    version: 1,
    translationId,
    verses,
    postings: Object.fromEntries(postings)
  };

  await writeFile(
    join(outputRoot, `${translationId}.json`),
    JSON.stringify(index),
    "utf8"
  );
  console.log(
    `Built ${translationId} search index: ${verses.length} verses, ${postings.size} tokens`
  );
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const translationIds = (await readdir(translationsRoot)).filter(
    (name) => !name.startsWith(".")
  );

  for (const translationId of translationIds) {
    await buildTranslationIndex(translationId);
  }

  await writeFile(
    join(outputRoot, "manifest.json"),
    JSON.stringify({
      version: 1,
      translations: translationIds
    }, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});