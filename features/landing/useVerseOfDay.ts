import { useState } from "react";

export interface DailyVerse {
  latin: string;
  english: string;
  chinese: string;
  reference: string;
}

const VERSES: DailyVerse[] = [
  {
    latin: "Ego sum vitis, vos palmites: qui manet in me, et ego in eo, hic fert fructum multum, quia sine me nihil potestis facere.",
    english: "I am the vine, you are the branches. He who abides in Me, and I in him, bears much fruit; for without Me you can do nothing.",
    chinese: "我是葡萄树，你们是枝条；那住在我内，我也住在他内的，他就结许多的果实，因为离了我，你们什么也不能做。",
    reference: "John 15:5"
  },
  {
    latin: "In principio creavit Deus caelum et terram.",
    english: "In the beginning God created heaven, and earth.",
    chinese: "起初，天主创造了天地。",
    reference: "Genesis 1:1"
  },
  {
    latin: "Dominus pascit me, et nihil mihi deerit.",
    english: "The Lord is my shepherd: and nothing shall be wanting to me.",
    chinese: "上主是我的牧者，我实在一无所缺。",
    reference: "Psalm 23:1"
  },
  {
    latin: "Omnia possum in eo qui me confortat.",
    english: "I can do all things in him who strengtheneth me.",
    chinese: "我赖加强我力量的那位，能应付一切。",
    reference: "Philippians 4:13"
  }
];

export function useVerseOfDay() {
  const [index, setIndex] = useState(0);

  function shuffleVerse() {
    setIndex((prev) => (prev + 1) % VERSES.length);
  }

  return {
    verse: VERSES[index],
    shuffleVerse
  };
}
