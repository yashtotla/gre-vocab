import { createFileRoute } from '@tanstack/react-router'
import MatchingGamePage from '@/components/words/MatchingGamePage'

export const Route = createFileRoute('/matching-game')({
  component: MatchingGamePage,
}) 