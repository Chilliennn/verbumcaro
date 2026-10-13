import fs from "fs/promises";
import path from "path";

interface SaintQuote {
  index: number;
  quote: string;
  author: string;
}

interface SaintQuotesData {
  count: number;
  quotes: SaintQuote[];
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, "—")
    .replace(/&#8211;/g, "–")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKennedyAdventures(html: string): Array<{ quote: string; author: string }> {
  const list: Array<{ quote: string; author: string }> = [];
  const sections = html.split(/<h3[^>]*>/i);
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const headerEnd = section.indexOf("</h3>");
    if (headerEnd === -1) continue;
    const headerRaw = section.substring(0, headerEnd).replace(/<[^>]+>/g, "");
    const author = cleanText(headerRaw.split(/[–—-]/)[0]);
    const afterHeader = section.substring(headerEnd + 5);
    const emMatches = afterHeader.match(/<em[^>]*>([\s\S]*?)<\/em>/gi);
    if (!emMatches || !author) continue;
    for (const em of emMatches) {
      const quote = cleanText(em.replace(/<[^>]+>/g, ""));
      if (quote.length > 15 && !quote.toLowerCase().includes("affiliate")) {
        list.push({ quote, author });
      }
    }
  }
  return list;
}

function parseFranciscanMedia(html: string): Array<{ quote: string; author: string }> {
  const list: Array<{ quote: string; author: string }> = [];
  const pRegex = /<p[^>]*class="[^"]*has-text-align-center[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(html)) !== null) {
    const content = match[1];
    const strongMatch = content.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
    if (!strongMatch) continue;
    const author = cleanText(strongMatch[1].replace(/<[^>]+>/g, ""));
    const textWithoutAuthor = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "").replace(/<strong[^>]*>[\s\S]*?<\/strong>/gi, "");
    const quote = cleanText(textWithoutAuthor.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/^["'\s]+|["'\s]+$/g, ""));
    if (quote.length > 15 && author.length > 2) {
      list.push({ quote, author });
    }
  }
  return list;
}

const FALLBACK_QUOTES = [
  { quote: "Pray as though everything depended on God. Work as though everything depended on you.", author: "St. Augustine of Hippo" },
  { quote: "Late have I loved you, beauty so old and so new: late have I loved you.", author: "St. Augustine of Hippo" },
  { quote: "Our hearts are restless until they rest in You.", author: "St. Augustine of Hippo" },
  { quote: "Preach the Gospel at all times and when necessary use words.", author: "St. Francis of Assisi" },
  { quote: "To love God is something greater than to know Him.", author: "St. Thomas Aquinas" },
  { quote: "The things that we love tell us what we are.", author: "St. Thomas Aquinas" },
  { quote: "Let nothing disturb you, let nothing frighten you. All things are passing; God alone suffices.", author: "St. Teresa of Ávila" },
  { quote: "Miss no single opportunity of making some small sacrifice.", author: "St. Thérèse of Lisieux" },
  { quote: "Do not be afraid. Do not be satisfied with mediocrity. Put out into the deep and let down your nets.", author: "St. John Paul II" },
  { quote: "Be who God meant you to be and you will set the world on fire.", author: "St. Catherine of Siena" },
  { quote: "Not all of us can do great things. But we can do small things with great love.", author: "St. Teresa of Calcutta" },
  { quote: "Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible.", author: "St. Francis of Assisi" },
  { quote: "Christ has no body now on earth but yours, no hands but yours, no feet but yours.", author: "St. Teresa of Ávila" },
  { quote: "Love is shown more in deeds than in words.", author: "St. Ignatius of Loyola" },
  { quote: "Act as if every day were the last of your life.", author: "St. Anthony of Padua" },
  { quote: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "St. Teresa of Calcutta" },
  { quote: "Sanctify yourself and you will sanctify society.", author: "St. Francis of Assisi" },
  { quote: "Patience is the companion of wisdom.", author: "St. Augustine of Hippo" },
  { quote: "The truth is like a lion; you don't have to defend it. Let it loose; it will defend itself.", author: "St. Augustine of Hippo" },
  { quote: "We should not accept in silence the benefactions of God, but return thanks for them.", author: "St. Basil the Great" },
  { quote: "Pray, hope, and don't worry.", author: "St. Padre Pio" }
];

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.text();
}

async function scrapeAll() {
  const aggregated: Array<{ quote: string; author: string }> = [];

  try {
    const kennedyHtml = await fetchHtml("https://thekennedyadventures.com/catholic-saints-quotes/");
    aggregated.push(...parseKennedyAdventures(kennedyHtml));
  } catch {}

  try {
    const franciscanHtml = await fetchHtml("https://www.franciscanmedia.org/franciscan-spirit-blog/quotes-from-catholic-saints/");
    aggregated.push(...parseFranciscanMedia(franciscanHtml));
  } catch {}

  for (const item of FALLBACK_QUOTES) {
    if (!aggregated.some((q) => q.quote.toLowerCase() === item.quote.toLowerCase())) {
      aggregated.push(item);
    }
  }

  const seen = new Set<string>();
  const finalQuotes: SaintQuote[] = [];

  for (const item of aggregated) {
    const key = item.quote.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    finalQuotes.push({
      index: finalQuotes.length + 1,
      quote: item.quote,
      author: item.author
    });
  }

  const output: SaintQuotesData = {
    count: finalQuotes.length,
    quotes: finalQuotes
  };

  const outputPath = path.resolve(process.cwd(), "public/data/saint-quotes.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");
}

scrapeAll().catch(console.error);
