import { useState, useEffect, useCallback } from "react";
import { canon } from "../../lib/data/canon";
import { bibleRepository } from "../../lib/bible/staticRepository";

export interface DailyVerse {
  english: string;
  reference: string;
}

const FALLBACK_VERSES: DailyVerse[] = [
  { english: "In the beginning God created heaven, and earth.", reference: "Genesis 1:1" },
  { english: "And God said: Let there be light. And there was light.", reference: "Genesis 1:3" },
  { english: "The Lord is my shepherd: and nothing shall be wanting to me.", reference: "Psalm 23:1" },
  { english: "In the beginning was the Word, and the Word was with God, and the Word was God.", reference: "John 1:1" },
  { english: "And the Word was made flesh, and dwelt among us.", reference: "John 1:14" },
  { english: "For God so loved the world, as to give his only begotten Son.", reference: "John 3:16" },
  { english: "I am the vine; you the branches: he that abideth in me, and I in him, the same beareth much fruit.", reference: "John 15:5" },
  { english: "I can do all things in him who strengtheneth me.", reference: "Philippians 4:13" }
];

const MEANINGLESS_PATTERNS = [
  /\b(begat|begot)\b/i,
  /\bson of\b.*\bson of\b/i,
  /\b(cubit|cubits|socket|sockets|shekel|shekels)\b/i,
  /\b(burnt offering|he-goats|rams' skins)\b/i,
  /\blived.*years and (died|begot)\b/i,
  /\b(these are the sons of|the children of)\b/i
];

export function isMeaningfulVerse(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 35 || trimmed.length > 260) return false;
  for (const pattern of MEANINGLESS_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  const words = trimmed.split(/\s+/);
  return words.length >= 7;
}

export function useVerseOfDay() {
  const [verse, setVerse] = useState<DailyVerse>(() => {
    return FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
  });

  const shuffleVerse = useCallback(async () => {
    const candidateBooks = canon.filter((b) => b.chapters > 0);
    for (let attempts = 0; attempts < 4; attempts++) {
      const book = candidateBooks[Math.floor(Math.random() * candidateBooks.length)];
      const chapter = Math.floor(Math.random() * book.chapters) + 1;
      try {
        const chapterData = await bibleRepository.getChapter("catholic_org", book.code, chapter);
        if (chapterData && chapterData.verses && chapterData.verses.length > 0) {
          const eligible = chapterData.verses.filter((v) => isMeaningfulVerse(v.text));
          if (eligible.length > 0) {
            const picked = eligible[Math.floor(Math.random() * eligible.length)];
            setVerse({
              english: picked.text,
              reference: `${book.name} ${chapter}:${picked.verse}`
            });
            return;
          }
        }
      } catch {}
    }
    setVerse((prev) => {
      const remaining = FALLBACK_VERSES.filter((v) => v.reference !== prev.reference);
      return remaining[Math.floor(Math.random() * remaining.length)] ?? FALLBACK_VERSES[0];
    });
  }, []);

  useEffect(() => {
    shuffleVerse();
  }, [shuffleVerse]);

  return {
    verse,
    shuffleVerse
  };
}
