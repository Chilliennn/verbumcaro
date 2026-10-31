import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnglishLookupPopover } from "../../components/reader/EnglishLookupPopover";
import * as englishLookupModule from "../../features/english/englishLookup";

describe("EnglishLookupPopover", () => {
  it("renders close button as a direct child of english-lookup alongside english-lookup-content", async () => {
    const onClose = vi.fn();
    vi.spyOn(englishLookupModule, "loadEnglishExamples").mockImplementation(async (word) => word);
    vi.spyOn(englishLookupModule, "analyzeEnglish").mockResolvedValue({
      text: "beginning",
      words: [
        {
          surface: "beginning",
          lemma: "beginning",
          pronunciation: "bɪˈɡɪn.ɪŋ",
          partOfSpeech: "noun",
          forms: ["beginnings"],
          definitions: ["The act of doing that which begins anything; commencement."],
          examples: [
            {
              english: "What was the beginning of the dispute?"
            }
          ]
        }
      ]
    });

    const { container } = render(
      <EnglishLookupPopover
        text="beginning"
        anchor={{ top: 120, left: 150 }}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close english lookup/i });
    expect(closeBtn).toBeDefined();

    const lookupAside = container.querySelector(".english-lookup");
    expect(lookupAside).not.toBeNull();

    expect(closeBtn.parentElement).toBe(lookupAside);

    const content = container.querySelector(".english-lookup-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(lookupAside);

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders definitions, pronunciation, and toggles examples", async () => {
    const onClose = vi.fn();
    vi.spyOn(englishLookupModule, "loadEnglishExamples").mockImplementation(async (word) => word);
    vi.spyOn(englishLookupModule, "analyzeEnglish").mockResolvedValue({
      text: "created",
      words: [
        {
          surface: "created",
          lemma: "create",
          isInflected: true,
          inflection: "simple past and past participle",
          pronunciation: "kɹiˈeɪtɪd",
          partOfSpeech: "verb",
          definitions: ["To bring into existence."],
          examples: [
            {
              english: "God created the heavens and the earth."
            }
          ]
        }
      ]
    });

    render(
      <EnglishLookupPopover
        text="created"
        anchor={{ top: 120, left: 150 }}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("create")).toBeDefined();
    });

    expect(screen.getByText("[kɹiˈeɪtɪd]")).toBeDefined();
    expect(screen.getByText("To bring into existence.")).toBeDefined();

    const toggleBtn = screen.getByRole("button", { name: /show examples/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText("God created the heavens and the earth.")).toBeDefined();
  });
});
