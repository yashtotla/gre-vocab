import { createFileRoute } from '@tanstack/react-router'
import { QuizSetupPage } from '../components/words/QuizSetupPage'

export const Route = createFileRoute('/quiz')({
  component: QuizSetupPage,
}) 