import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChineseLookupPopover } from "../../components/reader/ChineseLookupPopover";
import * as chineseLookupModule from "../../features/chinese/chineseLookup";

describe("ChineseLookupPopover", () => {
  it("renders close button as a direct child of chinese-lookup alongside chinese-lookup-content", async () => {
    const onClose = vi.fn();
    vi.spyOn(chineseLookupModule, "loadChineseExamples").mockImplementation(async (word) => word);
    vi.spyOn(chineseLookupModule, "analyzeChinese").mockResolvedValue({
      text: "起初",
      pinyin: "qǐ chū",
      words: [
        {
          surface: "起初",
          pinyin: "qǐ chū",
          partOfSpeech: "adverb",
          definitions: ["at first", "in the beginning"],
          examples: [
            {
              chinese: "起初神创造天地。",
              english: "In the beginning God created the heaven and the earth."
            }
          ]
        }
      ]
    });

    const { container } = render(
      <ChineseLookupPopover
        text="起初"
        anchor={{ top: 120, left: 150 }}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close chinese lookup/i });
    expect(closeBtn).toBeDefined();

    const lookupAside = container.querySelector(".chinese-lookup");
    expect(lookupAside).not.toBeNull();

    expect(closeBtn.parentElement).toBe(lookupAside);

    const content = container.querySelector(".chinese-lookup-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(lookupAside);

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders pinyin, definitions, and toggles examples", async () => {
    const onClose = vi.fn();
    vi.spyOn(chineseLookupModule, "loadChineseExamples").mockImplementation(async (word) => word);
    vi.spyOn(chineseLookupModule, "analyzeChinese").mockResolvedValue({
      text: "起初",
      pinyin: "qǐ chū",
      words: [
        {
          surface: "起初",
          pinyin: "qǐ chū",
          partOfSpeech: "adverb",
          definitions: ["at first", "in the beginning"],
          examples: [
            {
              chinese: "起初神创造天地。",
              english: "In the beginning God created the heaven and the earth."
            }
          ]
        }
      ]
    });

    render(
      <ChineseLookupPopover
        text="起初"
        anchor={{ top: 120, left: 150 }}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("at first")).toBeDefined();
    });

    expect(screen.getByText("[qǐ chū]")).toBeDefined();
    expect(screen.getByText("adverb")).toBeDefined();

    const toggleBtn = screen.getByRole("button", { name: /show examples/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText("起初神创造天地。")).toBeDefined();
    expect(screen.getByText("In the beginning God created the heaven and the earth.")).toBeDefined();
  });
});
