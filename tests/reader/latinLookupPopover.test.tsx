import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LatinLookupPopover } from "../../components/reader/LatinLookupPopover";
import * as latinLookupModule from "../../features/latin/latinLookup";

describe("LatinLookupPopover", () => {
  it("renders close button as a direct child of latin-lookup alongside latin-lookup-content", async () => {
    const onClose = vi.fn();
    vi.spyOn(latinLookupModule, "loadLatinExamples").mockImplementation(async (word) => word);
    vi.spyOn(latinLookupModule, "analyzeLatin").mockResolvedValue({
      text: "principio",
      words: [
        {
          surface: "principio",
          lemma: "principium",
          pronunciation: "priːnˈkɪ.pi.oː",
          partOfSpeech: "noun",
          forms: ["ablative singular", "dative singular"],
          definitions: ["in the beginning, at first", "a beginning, origin"],
          examples: [
            {
              latin: "In principio creavit Deus caelum et terram.",
              reference: "Vulgate, Genesis 1:1",
              english: "In the beginning God created the heaven and the earth."
            }
          ]
        }
      ]
    });

    const { container } = render(
      <LatinLookupPopover
        text="principio"
        anchor={{ top: 120, left: 150 }}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close latin lookup/i });
    expect(closeBtn).toBeDefined();

    const lookupAside = container.querySelector(".latin-lookup");
    expect(lookupAside).not.toBeNull();

    // Close button should be a direct child of the fixed dialog container, not inside the scrollable content
    expect(closeBtn.parentElement).toBe(lookupAside);

    // Scrollable content wrapper should exist
    const content = container.querySelector(".latin-lookup-content");
    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(lookupAside);
    expect(closeBtn).not.toBe(content);

    // Clicking close button calls onClose callback
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getAllByText("principio").length).toBeGreaterThan(0);
      expect(screen.getByText(/priːnˈkɪ.pi.oː/)).toBeDefined();
      expect(screen.getByText(/in the beginning, at first/i)).toBeDefined();
      expect(screen.getByText(/FreeDictionaryAPI \(Wiktionary\) \/ Latin WordNet/i)).toBeDefined();
    });

    // Toggle examples button
    const toggleBtn = screen.getByRole("button", { name: /show examples/i });
    expect(toggleBtn).toBeDefined();
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByText(/In principio creavit Deus caelum et terram/i)).toBeDefined();
      expect(screen.getByText(/Vulgate, Genesis 1:1/i)).toBeDefined();
      expect(screen.getByText(/In the beginning God created the heaven and the earth/i)).toBeDefined();
    });
  });

  it("renders status message when no words/definitions found", async () => {
    vi.spyOn(latinLookupModule, "analyzeLatin").mockResolvedValue({
      text: "xyz123",
      words: []
    });

    render(
      <LatinLookupPopover
        text="xyz123"
        anchor={{ top: 100, left: 100 }}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Lookup unavailable\. No definitions found\./i)).toBeDefined();
    });
  });
});
