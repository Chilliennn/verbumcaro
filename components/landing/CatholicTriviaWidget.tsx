import { useState } from "react";
import { useCatholicTrivia } from "../../features/landing/useTriviaQuiz";
import type { CitationTarget } from "../common/VerseCitationPopover";

const OPTION_LETTERS = ["A", "B", "C", "D"];

interface CatholicTriviaWidgetProps {
  onSelectCitation?: (target: CitationTarget) => void;
}

export function CatholicTriviaWidget({ onSelectCitation: _onSelectCitation }: CatholicTriviaWidgetProps = {}) {
  const {
    question,
    selectedOption,
    isAnswered,
    isCorrect,
    selectOption,
    nextQuestion,
    score,
    totalAnswered,
    streak
  } = useCatholicTrivia();

  const [showSourcePreview, setShowSourcePreview] = useState(false);

  function handleNext() {
    setShowSourcePreview(false);
    nextQuestion();
  }

  return (
    <div className="widget-card quiz-widget-card">
      <div>
        <div className="widget-header">
          <div className="widget-tag-group">
            <span className="widget-tag">Catholicism Trivia</span>
            <span className="widget-badge">{question.category}</span>
          </div>
          <button
            className="widget-refresh-btn"
            type="button"
            onClick={handleNext}
            title="Next question"
            aria-label="Next question"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
            </svg>
            Next
          </button>
        </div>

        <p className="quiz-question">{question.question}</p>

        <div className="mcq-options-list">
          {question.options.map((option, idx) => {
            let optionClass = "mcq-option";
            if (isAnswered) {
              if (idx === question.correctIndex) {
                optionClass += " correct";
              } else if (idx === selectedOption) {
                optionClass += " incorrect";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                className={optionClass}
                onClick={() => selectOption(idx)}
                disabled={isAnswered}
              >
                <span className="option-letter">{OPTION_LETTERS[idx]}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="quiz-feedback show">
            <div className={`feedback-status ${isCorrect ? "correct" : "incorrect"}`}>
              {isCorrect ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Correct
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Incorrect
                </>
              )}
            </div>
            <p className="feedback-explanation">{question.explanation}</p>
            <div className="feedback-citation-container">
              <button
                type="button"
                className="citation-trigger-btn"
                onClick={() => setShowSourcePreview((prev) => !prev)}
                title="Click to view source teaching preview"
                aria-expanded={showSourcePreview}
              >
                <span className="citation-ref-label">Ref:</span>
                <span className="citation-ref-text">{question.citation}</span>
                <span className="citation-preview-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  {showSourcePreview ? "Hide Source" : "View Source"}
                </span>
              </button>

              {showSourcePreview && (
                <div className="source-preview-popover">
                  <div className="source-preview-header">
                    <span className="source-preview-title">{question.citation}</span>
                    <button
                      type="button"
                      className="source-preview-close"
                      onClick={() => setShowSourcePreview(false)}
                      aria-label="Close preview"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="source-preview-body">{question.sourcePreview || question.explanation}</p>
                  {question.sourceUrl && (
                    <a
                      href={question.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-preview-link"
                    >
                      <span>Read Official Source Document</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-footer">
        <div className="quiz-stats">
          <span>Score: {score}/{totalAnswered}</span>
          {streak > 1 && <span className="streak-pill">🔥 {streak} Streak</span>}
        </div>
        {isAnswered && (
          <button className="quiz-next-action-btn" type="button" onClick={handleNext}>
            Next Question &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
