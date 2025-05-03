import { createFileRoute } from '@tanstack/react-router'
import { WordBrowser } from '../components/words/WordBrowser'

export const Route = createFileRoute('/words')({
  component: WordBrowser,
}) 