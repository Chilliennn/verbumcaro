import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VerseCitationPopover, type CitationTarget } from "../../components/common/VerseCitationPopover";
import { bibleRepository } from "../../lib/bible/staticRepository";

describe("VerseCitationPopover", () => {
  const mockTarget: CitationTarget = {
    reference: "John 1:1",
    bookCode: "JHN",
    chapter: 1,
    verse: 1
  };

  beforeEach(() => {
    vi.spyOn(bibleRepository, "getChapter").mockImplementation(async (_trans, _book, chapter) => ({
      translationId: "catholic_org",
      book: "JHN",
      chapter,
      verses: [
        {
          verse: 1,
          heading: null,
          text: "In the beginning was the Word: the Word was with God and the Word was God.",
          footnotes: []
        },
        {
          verse: 2,
          heading: null,
          text: "He was with God in the beginning.",
          footnotes: []
        }
      ]
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders Scripture header, preview verse, and actions when target is provided", async () => {
    const handleClose = vi.fn();
    const handleOpenPanel = vi.fn();
    const handleOpenParallel = vi.fn();

    render(
      <VerseCitationPopover
        target={mockTarget}
        onClose={handleClose}
        onOpenPanel={handleOpenPanel}
        onOpenParallel={handleOpenParallel}
      />
    );

    expect(screen.getByText("Scripture")).toBeInTheDocument();
    expect(screen.getByText("John 1:1")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("In the beginning was the Word: the Word was with God and the Word was God.")
      ).toBeInTheDocument();
    });

    // Test Open in Bible Panel action
    const openPanelBtn = screen.getByRole("button", { name: /Open in Bible Panel/i });
    fireEvent.click(openPanelBtn);
    expect(handleOpenPanel).toHaveBeenCalledWith(mockTarget, "catholic_org");

    // Test Open in Parallel View action
    const openParallelBtn = screen.getByRole("button", { name: /Open in Parallel View/i });
    fireEvent.click(openParallelBtn);
    expect(handleOpenParallel).toHaveBeenCalledWith(mockTarget, "catholic_org", "vulgate");
  });

  it("toggles expanded chapter context", async () => {
    render(
      <VerseCitationPopover
        target={mockTarget}
        onClose={vi.fn()}
        onOpenPanel={vi.fn()}
        onOpenParallel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/In the beginning was the Word/i)).toBeInTheDocument();
    });

    const expandBtn = screen.getByText(/Read surrounding verses in chapter context/i);
    fireEvent.click(expandBtn);

    // Surrounding verse 2 appears in context
    expect(screen.getByText(/He was with God in the beginning/i)).toBeInTheDocument();
    expect(screen.getByText(/Hide surrounding verses/i)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <VerseCitationPopover
        target={mockTarget}
        onClose={handleClose}
        onOpenPanel={vi.fn()}
        onOpenParallel={vi.fn()}
      />
    );

    const closeBtn = screen.getByLabelText("Close Scripture preview");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

