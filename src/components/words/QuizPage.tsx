import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuizQuestion {
  prompt: string // The definition
  options: string[] // The word options
  correct: string // The correct word
  explanation?: string // Optionally, show the full definition/example
}

interface QuizPageProps {
  questions: QuizQuestion[]
  onRestart: () => void
}

export function QuizPage({ questions, onRestart }: QuizPageProps) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)

  const question = questions[current]

  // Keyboard navigation for review mode
  const handleReviewKeyDown = useCallback((e: KeyboardEvent) => {
    if (reviewIndex === null) return
    if (e.key === 'ArrowRight') {
      setReviewIndex(idx => (idx !== null && idx < questions.length - 1 ? idx + 1 : idx))
    } else if (e.key === 'ArrowLeft') {
      setReviewIndex(idx => (idx !== null && idx > 0 ? idx - 1 : idx))
    } else if (e.key === 'Escape') {
      setReviewIndex(null)
    }
  }, [reviewIndex, questions.length])

  useEffect(() => {
    if (reviewIndex !== null) {
      window.addEventListener('keydown', handleReviewKeyDown)
      return () => window.removeEventListener('keydown', handleReviewKeyDown)
    }
  }, [reviewIndex, handleReviewKeyDown])

  const handleSelect = (option: string) => {
    const newAnswers = [...answers]
    newAnswers[current] = option
    setAnswers(newAnswers)
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
    } else {
      setShowResult(true)
    }
  }

  const handleReview = (idx: number) => {
    setReviewIndex(idx)
  }

  const handleBackToResults = () => {
    setReviewIndex(null)
  }

  if (showResult && reviewIndex === null) {
    const score = answers.reduce(
      (acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0),
      0
    )
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Score: {score} / {questions.length}</div>
            <div className="mb-4 text-left">
              <div className="font-semibold mb-2">Questions:</div>
              <div className="grid gap-2">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    className={
                      'w-full text-left p-3 rounded border flex items-center gap-3 transition ' +
                      (answers[i] === q.correct
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-red-200 bg-red-50 hover:bg-red-100')
                    }
                    onClick={() => handleReview(i)}
                  >
                    <span className={
                      'inline-block w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ' +
                      (answers[i] === q.correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white')
                    }>
                      {answers[i] === q.correct ? '✓' : '✗'}
                    </span>
                    <span className="truncate">Q{i + 1}: {q.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <Button onClick={onRestart} className="w-full">New Quiz</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (reviewIndex !== null) {
    // Review mode for a single question
    const q = questions[reviewIndex]
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Review: Question {reviewIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-lg">{q.prompt}</div>
            <div className="flex flex-col gap-3 mb-4">
              {q.options.map(option => (
                <Button
                  key={option}
                  variant={option === q.correct ? 'default' : 'outline'}
                  className={
                    option === q.correct
                      ? 'border-green-500 bg-green-100 text-green-900'
                      : option === answers[reviewIndex]
                        ? 'border-red-500 bg-red-100 text-red-900'
                        : ''
                  }
                  disabled
                >
                  {option}
                </Button>
              ))}
            </div>
            <div className="text-sm mb-4">
              {answers[reviewIndex] === q.correct ? (
                <span className="text-green-600 font-semibold">You answered correctly!</span>
              ) : (
                <span className="text-red-600 font-semibold">Your answer: {answers[reviewIndex] ?? <em>None</em>}<br />Correct answer: {q.correct}</span>
              )}
              {q.explanation && (
                <div className="mt-2 text-gray-500">{q.explanation}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleBackToResults} className="w-full">Back to Quiz Review</Button>
              <Button onClick={onRestart} className="w-full" variant="outline">New Quiz</Button>
            </div>
            <div className="mt-4 text-xs text-gray-400">Use ←/→ to navigate, Esc to return</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz in progress
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Question {current + 1} of {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-lg">{question.prompt}</div>
          <div className="flex flex-col gap-3">
            {question.options.map(option => (
              <Button
                key={option}
                variant={'outline'}
                onClick={() => handleSelect(option)}
                disabled={answers[current] !== null}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 