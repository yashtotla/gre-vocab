import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex flex-col bg-white mt-10">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <img src="/logo.svg" alt="Vocab Mountain Logo" className="w-12 h-12 mb-6" />
        <h1 className="text-5xl font-bold mb-4">Master GRE Vocabulary</h1>
        <p className="text-lg text-gray-600 mb-8">Minimal, distraction-free GRE vocab learning.</p>
        <Link to="/words">
          <Button size="lg" className="text-lg px-10 py-6">Start Learning</Button>
        </Link>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link to="/flashcards"><Button variant="outline">Flashcards</Button></Link>
          <Link to="/quiz"><Button variant="outline">Quiz</Button></Link>
          <Link to="/matching-game"><Button variant="outline">Matching Game</Button></Link>
        </div>
      </main>
    </div>
  )
}
