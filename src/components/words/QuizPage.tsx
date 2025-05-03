import { useState } from 'react'
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
    setShowResult(false)
    setCurrent(idx)
  }

  const handleBackToResults = () => {
    setReviewIndex(null)
    setShowResult(true)
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
              <div className="font-semibold mb-2">Review your answers:</div>
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className={
                      'p-3 rounded border ' +
                      (answers[i] === q.correct
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50')
                    }
                  >
                    <div className="font-medium">Q{i + 1}: {q.prompt}</div>
                    <div>Your answer: <span className={answers[i] === q.correct ? 'text-green-700' : 'text-red-700'}>{answers[i] ?? <em>None</em>}</span></div>
                    {answers[i] !== q.correct && (
                      <div>Correct answer: <span className="text-green-700">{q.correct}</span></div>
                    )}
                    {q.explanation && (
                      <div className="text-gray-500 mt-1">{q.explanation}</div>
                    )}
                    {answers[i] !== q.correct && (
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => handleReview(i)}>
                        Review this question
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={onRestart} className="mt-4">New Quiz</Button>
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
            <div className="text-sm">
              {answers[reviewIndex] === q.correct ? (
                <span className="text-green-600 font-semibold">You answered correctly!</span>
              ) : (
                <span className="text-red-600 font-semibold">Your answer: {answers[reviewIndex] ?? <em>None</em>}<br />Correct answer: {q.correct}</span>
              )}
              {q.explanation && (
                <div className="mt-2 text-gray-500">{q.explanation}</div>
              )}
            </div>
            <Button className="mt-4" onClick={handleBackToResults}>Back to Results</Button>
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