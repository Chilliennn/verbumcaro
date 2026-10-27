import { useEffect, useState } from "react";

const FONT_SIZE_KEY = "verbumnobis.fontSize";
const DEFAULT_FONT_SIZE = 18;

export function useFontSize(): [number, (size: number) => void] {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reader-font-size",
      `${fontSize}px`
    );
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  return [fontSize, setFontSize];
}