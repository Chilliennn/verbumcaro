export function scrollToVerse(
  root: HTMLElement,
  verse: number
): void {
  const element = root.querySelector(`[data-verse="${verse}"]`);

  element?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}
