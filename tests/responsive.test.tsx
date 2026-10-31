import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../components/layout/Header";
import { MobileDrawer } from "../components/layout/MobileDrawer";
import { PassageSelector } from "../components/reader/PassageSelector";
import { TranslationSelector } from "../components/reader/TranslationSelector";
import { ParallelReader } from "../components/reader/ParallelReader";
import { HubModal } from "../components/modals/HubModal";
import type { Book, Translation } from "../lib/bible/repository";

const mockBooks: Book[] = [
  { code: "GEN", name: "Genesis", testament: "OT", chapters: 50 },
  { code: "MAT", name: "Matthew", testament: "NT", chapters: 28 }
];

const mockTranslations: Translation[] = [
  { 
    id: "catholic_org", 
    name: "Catholic Public Domain", 
    language: "en",
    languageName: "English",
    direction: "ltr",
    hasHeadings: true,
    hasFootnotes: false
  },
  { 
    id: "sigao", 
    name: "Sigao Chinese", 
    language: "zh",
    languageName: "Chinese",
    direction: "ltr",
    hasHeadings: true,
    hasFootnotes: false
  }
];

describe("Responsive UI Architecture", () => {
  it("renders hamburger menu button in Header and triggers drawer callback", () => {
    const onOpenDrawer = vi.fn();
    render(
      <Header
        dark={false}
        onToggleTheme={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onOpenDrawer={onOpenDrawer}
      />
    );

    const hamburger = screen.getByRole("button", { name: /open navigation menu/i });
    expect(hamburger).toBeDefined();
    fireEvent.click(hamburger);
    expect(onOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it("renders MobileDrawer items and responds to clicks and backdrop closing", () => {
    const onClose = vi.fn();
    const onOpenGuide = vi.fn();
    const onOpenFont = vi.fn();
    const onToggleTheme = vi.fn();
    const onOpenHub = vi.fn();

    render(
      <MobileDrawer
        isOpen={true}
        onClose={onClose}
        dark={false}
        onToggleTheme={onToggleTheme}
        onOpenFontModal={onOpenFont}
        onOpenGuideModal={onOpenGuide}
        onOpenHubModal={onOpenHub}
      />
    );

    expect(screen.getByText("Search Syntax Guide")).toBeDefined();
    expect(screen.getByText("Reader Font Size")).toBeDefined();
    expect(screen.getByText("Switch to Dark Mode")).toBeDefined();
    expect(screen.getByText("Preferences & Community")).toBeDefined();

    fireEvent.click(screen.getByText("Search Syntax Guide"));
    expect(onClose).toHaveBeenCalled();
    expect(onOpenGuide).toHaveBeenCalled();

    const overlay = screen.getByTestId("drawer-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("supports PassageSelector opening, mobile close button, and Escape dismissal", () => {
    const onChange = vi.fn();
    render(
      <PassageSelector
        book={mockBooks[0]}
        chapter={1}
        books={mockBooks}
        onChange={onChange}
      />
    );

    const selector = screen.getByRole("button", { name: /select passage/i });
    fireEvent.click(selector);

    expect(screen.getByText("Old Testament")).toBeDefined();
    expect(screen.getByText("New Testament")).toBeDefined();

    const mobileClose = screen.getByRole("button", { name: /close passage selector/i });
    expect(mobileClose).toBeDefined();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Old Testament")).toBeNull();
  });

  it("supports TranslationSelector selection and closing", () => {
    const onChange = vi.fn();
    render(
      <TranslationSelector
        value="catholic_org"
        translations={mockTranslations}
        onChange={onChange}
      />
    );

    const selector = screen.getByRole("button", { name: /select translation/i });
    fireEvent.click(selector);

    const sigaoOption = screen.getByRole("option", { name: "Sigao Chinese" });
    fireEvent.click(sigaoOption);
    expect(onChange).toHaveBeenCalledWith("sigao");
  });

  it("renders both panels when parallel mode is active", () => {
    const { container } = render(
      <ParallelReader
        left={{ translationId: "catholic_org", bookCode: "GEN", chapter: 1 }}
        right={{ translationId: "sigao", bookCode: "GEN", chapter: 1 }}
        books={mockBooks}
        translations={mockTranslations}
        showHeadings={true}
        sync={false}
        parallel={true}
        onLeftChange={vi.fn()}
        onRightChange={vi.fn()}
        onSyncVerse={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const panels = container.querySelectorAll(".bible-panel");
    expect(panels.length).toBe(2);
  });

  it("renders HubModal with all legal, takedown, and sponsorship tabs", () => {
    const onClose = vi.fn();
    render(<HubModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText("Preferences & Community")).toBeDefined();
    expect(screen.getByRole("tab", { name: /about/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /copyright & sources/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /takedown policy/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /sponsorship & mission/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /chatbot api/i })).toBeDefined();

    // Verify default tab is About
    expect(screen.getByText(/Why verbumnobis\?/i)).toBeDefined();

    // Switch to Copyright & Sources
    fireEvent.click(screen.getByRole("tab", { name: /copyright & sources/i }));
    expect(screen.getByText(/Biblia Sacra Vulgata/i)).toBeDefined();
    expect(screen.getByText(/New Jerusalem Bible/i)).toBeDefined();

    // Switch to Takedown Policy
    fireEvent.click(screen.getByRole("tab", { name: /takedown policy/i }));
    expect(screen.getByText(/Designated Copyright Agent Notice/i)).toBeDefined();
    expect(screen.getByText(/chillien0815@gmail.com/i)).toBeDefined();

    // Switch to Sponsorship & Mission
    fireEvent.click(screen.getByRole("tab", { name: /sponsorship & mission/i }));
    expect(screen.getByText(/Domain & Infrastructure Sponsorship/i)).toBeDefined();
    expect(screen.getByText(/Zero-Monetization Commitment/i)).toBeDefined();

    // Close button
    const closeBtn = screen.getByRole("button", { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
