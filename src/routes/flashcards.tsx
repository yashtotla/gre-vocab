import { createFileRoute } from '@tanstack/react-router'
import { FlashcardsPage } from '../components/words/FlashcardsPage'

export const Route = createFileRoute('/flashcards')({
  component: FlashcardsPage,
}) 