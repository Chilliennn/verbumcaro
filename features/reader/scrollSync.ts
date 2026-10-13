export function scrollToVerse(
  root: HTMLElement | null,
  verse: number
): void {
  if (!root) return;
  const element = root.querySelector(`[data-verse="${verse}"]`);

  element?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}
