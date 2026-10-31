import { useCatholicTrivia } from "../../features/landing/useTriviaQuiz";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function CatholicTriviaWidget() {
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
            onClick={nextQuestion}
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
            <div className="feedback-citation">
              <strong>Ref:</strong> {question.citation}
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
          <button className="quiz-next-action-btn" type="button" onClick={nextQuestion}>
            Next Question &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

