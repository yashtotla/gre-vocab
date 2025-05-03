import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, Brain, Lightbulb, Volume2 } from 'lucide-react'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function FeatureCard({ icon: Icon, title, description }: {
  icon: typeof BookOpen
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <Icon className="w-8 h-8 mb-4 text-blue-600" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Master GRE Vocabulary</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Enhance your vocabulary with our comprehensive learning tools. 
            Study efficiently with organized word groups, interactive flashcards, and practice quizzes.
          </p>
          <Link to="/words">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Learning
            </Button>
          </Link>
          <div className="mt-4">
            <Link to="/flashcards">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Flashcard Mode
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Features to Accelerate Your Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="Organized Groups"
              description="Words are organized into logical groups for systematic learning and review."
            />
            <FeatureCard
              icon={Brain}
              title="Smart Review"
              description="Spaced repetition system helps you focus on words you need to practice most."
            />
            <FeatureCard
              icon={Volume2}
              title="Audio Pronunciation"
              description="Listen to correct pronunciations to improve your verbal skills."
            />
            <FeatureCard
              icon={Lightbulb}
              title="Interactive Quiz"
              description="Test your knowledge with multiple choice quizzes and typing exercises."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Expand Your Vocabulary?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of students who have improved their GRE verbal scores using our platform.
          </p>
          <Link to="/words">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Browse Word List
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
