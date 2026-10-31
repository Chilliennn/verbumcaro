import { useEffect, useState } from "react";

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  citation: string;
  explanation: string;
}

interface QuizPayload {
  count?: number;
  questions?: QuizQuestion[];
}

const FALLBACK_BIBLE_QUESTION: QuizQuestion = {
  id: "fallback-bible",
  category: "Gospels & Logos",
  question: "Which Gospel opens with the foundational declaration: 'In the beginning was the Word, and the Word was with God, and the Word was God'?",
  options: [
    "Gospel according to Matthew",
    "Gospel according to Mark",
    "Gospel according to Luke",
    "Gospel according to John"
  ],
  correctIndex: 3,
  citation: "John 1:1 (Vulgate: In principio erat Verbum)",
  explanation: "St. John's prologue presents Christ as the eternal Logos ('Verbum') through whom all creation was made, inspiring the name Verbum Caro."
};

const FALLBACK_CATHOLIC_QUESTION: QuizQuestion = {
  id: "fallback-catholic",
  category: "Sacraments & Dogma",
  question: "What is the dogmatic term for the change of the entire substance of bread and wine into the Body and Blood of Christ at the Consecration?",
  options: [
    "Consubstantiation",
    "Transubstantiation",
    "Hypostatic Union",
    "Symbolic Representation"
  ],
  correctIndex: 1,
  citation: "Catechism of the Catholic Church (CCC 1376)",
  explanation: "Transubstantiation affirms that the entire substance of bread and wine becomes the Body, Blood, Soul, and Divinity of Christ, while the accidents (sensory appearances) remain."
};

export function useQuiz(dataPath: string, fallback: QuizQuestion) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([fallback]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>(fallback);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}${dataPath}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: QuizPayload | QuizQuestion[] | null) => {
        if (!data) return;
        const list = Array.isArray(data) ? data : (data.questions ?? []);
        if (list.length > 0) {
          setQuestions(list);
          const randomIndex = Math.floor(Math.random() * list.length);
          setCurrentQuestion(list[randomIndex]);
        }
      })
      .catch(() => {});
  }, [dataPath]);

  function selectOption(optionIndex: number) {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(optionIndex);
    setTotalAnswered((prev) => prev + 1);

    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }

  function nextQuestion() {
    setSelectedOption(null);
    if (questions.length <= 1) return;
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * questions.length);
    } while (questions[nextIndex].id === currentQuestion.id);
    setCurrentQuestion(questions[nextIndex]);
  }

  return {
    question: currentQuestion,
    selectedOption,
    isAnswered: selectedOption !== null,
    isCorrect: selectedOption !== null && selectedOption === currentQuestion.correctIndex,
    selectOption,
    nextQuestion,
    score,
    totalAnswered,
    streak
  };
}

export function useBibleQuiz() {
  return useQuiz("data/bible-quiz.json", FALLBACK_BIBLE_QUESTION);
}

export function useCatholicTrivia() {
  return useQuiz("data/catholic-trivia.json", FALLBACK_CATHOLIC_QUESTION);
}

