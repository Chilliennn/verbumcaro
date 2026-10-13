import { useState, useEffect } from "react";

export interface DailyVerse {
  english: string;
  reference: string;
}

const INSPIRING_VERSES: DailyVerse[] = [
  { english: "In the beginning God created heaven, and earth.", reference: "Genesis 1:1" },
  { english: "And God said: Let there be light. And there was light.", reference: "Genesis 1:3" },
  { english: "The Lord is my shepherd: and nothing shall be wanting to me.", reference: "Psalm 23:1" },
  { english: "Thy word is a lamp to my feet, and a light to my paths.", reference: "Psalm 119:105" },
  { english: "Trust in the Lord with all thy heart, and lean not unto thy own prudence.", reference: "Proverbs 3:5" },
  { english: "The fear of the Lord is the beginning of wisdom.", reference: "Proverbs 9:10" },
  { english: "For a child is born to us, and a son is given to us, and the government is upon his shoulder.", reference: "Isaiah 9:6" },
  { english: "Ask, and it shall be given you: seek, and you shall find: knock, and it shall be opened to you.", reference: "Matthew 7:7" },
  { english: "Come to me, all you that labour, and are burdened, and I will refresh you.", reference: "Matthew 11:28" },
  { english: "In the beginning was the Word, and the Word was with God, and the Word was God.", reference: "John 1:1" },
  { english: "And the Word was made flesh, and dwelt among us.", reference: "John 1:14" },
  { english: "For God so loved the world, as to give his only begotten Son; that whosoever believeth in him, may not perish, but may have life everlasting.", reference: "John 3:16" },
  { english: "I am the way, and the truth, and the life. No man cometh to the Father, but by me.", reference: "John 14:6" },
  { english: "Peace I leave with you, my peace I give unto you: not as the world giveth, do I give unto you.", reference: "John 14:27" },
  { english: "I am the vine; you the branches: he that abideth in me, and I in him, the same beareth much fruit.", reference: "John 15:5" },
  { english: "Greater love than this no man hath, that a man lay down his life for his friends.", reference: "John 15:13" },
  { english: "And we know that to them that love God, all things work together unto good.", reference: "Romans 8:28" },
  { english: "If God be for us, who is against us?", reference: "Romans 8:31" },
  { english: "And now there remain faith, hope, and charity, these three: but the greatest of these is charity.", reference: "1 Corinthians 13:13" },
  { english: "I can do all things in him who strengtheneth me.", reference: "Philippians 4:13" },
  { english: "Be nothing solicitous; but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God.", reference: "Philippians 4:6" }
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
  if (trimmed.length < 35 || trimmed.length > 280) return false;
  for (const pattern of MEANINGLESS_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  const words = trimmed.split(/\s+/);
  return words.length >= 7;
}

export function useVerseOfDay() {
  const [verses] = useState<DailyVerse[]>(INSPIRING_VERSES);
  const [currentVerse, setCurrentVerse] = useState<DailyVerse>(() => {
    return INSPIRING_VERSES[Math.floor(Math.random() * INSPIRING_VERSES.length)];
  });

  function shuffleVerse() {
    let next: DailyVerse;
    do {
      next = verses[Math.floor(Math.random() * verses.length)];
    } while (next.reference === currentVerse.reference && verses.length > 1);
    setCurrentVerse(next);
  }

  return {
    verse: currentVerse,
    shuffleVerse
  };
}
