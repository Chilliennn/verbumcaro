import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = "public/data/translations";

async function main() {
  const translations = await readdir(root);

  let errors = 0;

  for (const translation of translations) {
    const translationPath = join(root, translation);

    for (const book of await readdir(translationPath)) {
      const bookPath = join(translationPath, book);

      for (const file of await readdir(bookPath)) {
        if (!file.endsWith(".json")) {
          continue;
        }

        try {
          const raw = await readFile(join(bookPath, file), "utf8");
          const data = JSON.parse(raw);

          if (!Array.isArray(data.verses)) {
            throw new Error("missing verses array");
          }
        } catch (error) {
          errors++;
          console.error(`${translation}/${book}/${file}`, error);
        }
      }
    }
  }

  if (errors > 0) {
    process.exit(1);
  }

  console.log("Bible data validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
