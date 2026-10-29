import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JapaneseLookupPopover } from "../../components/reader/JapaneseLookupPopover";
import * as japaneseLookupModule from "../../features/japanese/japaneseLookup";

describe("JapaneseLookupPopover", () => {
  it("renders close button as a direct child of japanese-lookup alongside japanese-lookup-content", async () => {
    const onClose = vi.fn();
    vi.spyOn(japaneseLookupModule, "loadJapaneseExamples").mockImplementation(async (word) => word);
    vi.spyOn(japaneseLookupModule, "analyzeJapanese").mockResolvedValue({
      text: "初めに",
      romaji: "hajimeni",
      words: [
        {
          surface: "初めに",
          reading: "はじめに",
          romaji: "hajimeni",
          partOfSpeech: "名詞",
          definitions: ["in the beginning", "at first"],
          examples: [],
          base: ""
        }
      ]
    });

    const { container } = render(
      <JapaneseLookupPopover
        text="初めに"
        anchor={{ top: 100, left: 100 }}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close japanese lookup/i });
    expect(closeBtn).toBeDefined();

    const lookupAside = container.querySelector(".japanese-lookup");
    expect(lookupAside).not.toBeNull();

    // Close button should be a direct child of the fixed dialog container, not inside the scrollable content
    expect(closeBtn.parentElement).toBe(lookupAside);

    // Scrollable content wrapper should exist
    const content = container.querySelector(".japanese-lookup-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(lookupAside);
    expect(closeBtn).not.toBe(content);

    // Clicking close button calls onClose callback
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getAllByText("hajimeni").length).toBeGreaterThan(0);
    });
  });
});
