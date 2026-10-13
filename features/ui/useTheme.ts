import { useEffect, useState } from "react";

export function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(
    localStorage.getItem("verbumcaro.theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("verbumcaro.theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((value) => !value);

  return [dark, toggleTheme];
}