import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { WidgetsSection } from "../../components/landing/WidgetsSection";
import { BibleQuizWidget } from "../../components/landing/BibleQuizWidget";
import { CatholicTriviaWidget } from "../../components/landing/CatholicTriviaWidget";

describe("Landing Quiz & Trivia Widgets (2x2 Grid)", () => {
  beforeEach(() => {
    // Mock global fetch to return deterministic fallback or mock data
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 2,
            questions: [
              {
                id: "test-q1",
                category: "Gospels",
                question: "Which Gospel opens with 'In the beginning was the Word'?",
                options: ["Matthew", "Mark", "Luke", "John"],
                correctIndex: 3,
                citation: "John 1:1",
                explanation: "John's prologue refers to the eternal Logos."
              }
            ]
          })
      } as Response)
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders all 4 widgets in the 2x2 grid container", () => {
    const { container } = render(<WidgetsSection />);
    const grid = container.querySelector(".widgets-grid");
    expect(grid).toBeInTheDocument();

    // 4 widgets expected in the grid
    const cards = container.querySelectorAll(".widget-card");
    expect(cards.length).toBe(4);

    expect(screen.getByText("Words of the Saints")).toBeInTheDocument();
    expect(screen.getByText("Verse of the Day")).toBeInTheDocument();
    expect(screen.getByText("Sacred Scripture Quiz")).toBeInTheDocument();
    expect(screen.getByText("Catholicism Trivia")).toBeInTheDocument();
  });

  it("interactively answers a question in BibleQuizWidget and shows feedback", () => {
    render(<BibleQuizWidget />);

    expect(screen.getByText("Sacred Scripture Quiz")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((b) => b.classList.contains("mcq-option"));
    expect(options.length).toBe(4);

    // Click the correct answer ("John" or fallback option)
    fireEvent.click(options[3]);

    // Check feedback status
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(/Score: 1\/1/)).toBeInTheDocument();

    // Check next action button appears in footer
    const nextBtn = screen.getByRole("button", { name: "Next Question →" });
    expect(nextBtn).toBeInTheDocument();
  });

  it("interactively answers an option in CatholicTriviaWidget", () => {
    render(<CatholicTriviaWidget />);

    expect(screen.getByText("Catholicism Trivia")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((b) => b.classList.contains("mcq-option"));
    expect(options.length).toBe(4);

    // Click first option
    fireEvent.click(options[0]);

    // Score or feedback is displayed
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });
});
