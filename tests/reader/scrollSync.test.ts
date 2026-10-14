import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scrollToVerse } from "../../features/reader/scrollSync";

describe("scrollSync", () => {
  let root: HTMLElement;
  let verseElement: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    verseElement = document.createElement("span");
    verseElement.dataset.verse = "16";
    root.appendChild(verseElement);
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
    vi.restoreAllMocks();
  });

  describe("scrollToVerse", () => {
    it("finds verse element and scrolls to it", () => {
      const scrollIntoView = vi.fn();
      verseElement.scrollIntoView = scrollIntoView;

      scrollToVerse(root, 16);

      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center"
      });
    });

    it("does nothing when verse not found", () => {
      const scrollIntoView = vi.fn();
      verseElement.scrollIntoView = scrollIntoView;

      scrollToVerse(root, 999);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it("does nothing when root is null", () => {
      // Should not throw
      expect(() => scrollToVerse(null as unknown as HTMLElement, 16)).not.toThrow();
    });
  });
});