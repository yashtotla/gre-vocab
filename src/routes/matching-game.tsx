import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matching-game')({
  component: MatchingGamePage,
})

function MatchingGamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-3xl font-bold">Matching Game Coming Soon!</div>
    </div>
  )
} 