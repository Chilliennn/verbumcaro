import fs from "fs/promises";
import path from "path";

interface SaintQuote {
  quote: string;
  author: string;
}

/**
 * Utility script to seed and fetch saint quotes.
 * Run using: npx tsx lib/scrapers/saints/scrape-quotes.ts
 */
async function seedSaintQuotes() {
  const outputPath = path.resolve(process.cwd(), "public/data/saint-quotes.json");

  // Default curated corpus
  const quotes: SaintQuote[] = [
    {
      quote: "Pray as though everything depended on God. Work as though everything depended on you.",
      author: "St. Augustine of Hippo"
    },
    {
      quote: "Late have I loved you, beauty so old and so new: late have I loved you.",
      author: "St. Augustine of Hippo"
    },
    {
      quote: "Preach the Gospel at all times and when necessary use words.",
      author: "St. Francis of Assisi"
    },
    {
      quote: "To love God is something greater than to know Him.",
      author: "St. Thomas Aquinas"
    },
    {
      quote: "Let nothing disturb you, let nothing frighten you. All things are passing; God alone suffices.",
      author: "St. Teresa of Ávila"
    },
    {
      quote: "Be who God meant you to be and you will set the world on fire.",
      author: "St. Catherine of Siena"
    },
    {
      quote: "Miss no single opportunity of making some small sacrifice.",
      author: "St. Thérèse of Lisieux"
    }
  ];

  await fs.writeFile(outputPath, JSON.stringify(quotes, null, 2), "utf-8");
  console.log(`Saved ${quotes.length} quotes to ${outputPath}`);
}

seedSaintQuotes().catch(console.error);
