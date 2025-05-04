import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QuizPage } from './QuizPage'

const QUIZ_TYPES = [
  { value: 'synonym', label: 'Synonym Matching' },
  { value: 'definition', label: 'Pick the Correct Definition' },
  { value: 'reverse', label: 'Pick the Correct Word for a Definition' },
]

function getRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}

export function QuizSetupPage() {
  const { data: wordGroups, isLoading } = useQuery({
    queryKey: ['wordGroups'],
    queryFn: async () => {
      const response = await fetch('/data/vocab.json')
      const words = await response.json()
      const groups = words.reduce((acc: { [key: number]: Array<any> | undefined }, word: any) => {
        if (!acc[word.group]) acc[word.group] = [];
        acc[word.group]!.push(word);
        return acc;
      }, {})
      return Object.entries(groups)
        .map(([group, groupWords]) => ({
          group: parseInt(group),
          words: (groupWords as Array<any>).sort((a, b) => a.word.localeCompare(b.word))
        }))
        .sort((a, b) => a.group - b.group)
    }
  })

  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [numWordsInput, setNumWordsInput] = useState('')
  const [quizType, setQuizType] = useState(QUIZ_TYPES[0].value)
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null)

  // Calculate max words for selected groups
  const maxWords = selectedGroups.length > 0
    ? selectedGroups.length * 30
    : 0

  // Set default numWordsInput when groups change
  useEffect(() => {
    if (selectedGroups.length === 0) {
      setNumWordsInput('')
    } else if (!numWordsInput || parseInt(numWordsInput) > maxWords) {
      setNumWordsInput(String(Math.min(10 * selectedGroups.length, maxWords)))
    }
  }, [selectedGroups])

  // Clamp and validate input on blur or submit
  const clampNumWords = (val: string) => {
    let n = parseInt(val.replace(/^0+/, '')) // Remove leading zeros
    if (isNaN(n) || val === '') return ''
    if (n < 1) n = 1
    if (n > maxWords) n = maxWords
    return String(n)
  }

  const handleNumWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, no leading zeros
    const val = e.target.value.replace(/[^0-9]/g, '')
    setNumWordsInput(val)
  }

  const handleNumWordsBlur = () => {
    setNumWordsInput(clampNumWords(numWordsInput))
  }

  const handleGroupChange = (group: number, checked: boolean) => {
    setSelectedGroups(prev =>
      checked ? [...prev, group] : prev.filter(g => g !== group)
    )
  }

  // Generate quiz questions for all quiz types
  const generateQuizQuestions = (type: string) => {
    if (!wordGroups) return []
    const allWords = wordGroups
      .filter(g => selectedGroups.includes(g.group))
      .flatMap(g => g.words)
    const selectedWords = getRandomElements(allWords, Math.min(parseInt(numWordsInput), allWords.length))

    if (type === 'reverse') {
      // Pick the correct word for a definition
      return selectedWords.map(word => {
        // Pick 3 distractors
        const distractors = getRandomElements(
          allWords.filter(w => w.word !== word.word),
          3
        ).map(w => w.word)
        // Use the first definition as the prompt
        const def = word.definitions[0]
        return {
          prompt: def.definition,
          options: getRandomElements([word.word, ...distractors], 4),
          correct: word.word,
          explanation: def.example || ''
        }
      })
    } else if (type === 'definition') {
      // Pick the correct definition for a word
      return selectedWords.map(word => {
        const def = word.definitions[0]
        // Pick 3 distractor definitions
        const distractors = getRandomElements(
          allWords.filter(w => w.word !== word.word && w.definitions.length > 0),
          3
        ).map(w => w.definitions[0].definition)
        return {
          prompt: word.word,
          options: getRandomElements([def.definition, ...distractors], 4),
          correct: def.definition,
          explanation: def.example || ''
        }
      })
    } else if (type === 'synonym') {
      // Synonym matching: prompt is a word, options are synonyms (with distractors)
      return selectedWords.map(word => {
        // Get all synonyms from all words
        const allSynonyms = allWords.flatMap(w => w.definitions.flatMap((d: any) => d.synonyms || []))
        // Get synonyms for this word (from all its definitions)
        const wordSynonyms = word.definitions.flatMap((d: any) => d.synonyms || [])
        // If no synonyms, skip this question
        if (wordSynonyms.length === 0) {
          return null
        }
        // Pick one correct synonym
        const correctSynonym = getRandomElements(wordSynonyms, 1)[0]
        // Pick 3 distractors from allSynonyms that are not synonyms of this word
        const distractors = getRandomElements(
          allSynonyms.filter(s => !wordSynonyms.includes(s)),
          3
        )
        return {
          prompt: word.word,
          options: getRandomElements([correctSynonym, ...distractors], 4),
          correct: correctSynonym,
          explanation: word.definitions[0]?.definition || ''
        }
      }).filter(Boolean)
    }
    return []
  }

  const handleStartQuiz = () => {
    const clamped = clampNumWords(numWordsInput)
    if (!clamped) return
    setQuizQuestions(generateQuizQuestions(quizType))
  }

  const handleRestart = () => {
    setQuizQuestions(null)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (quizQuestions) {
    return <QuizPage questions={quizQuestions} onRestart={handleRestart} />
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Setup</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customize Your Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Multi-select */}
          <div>
            <div className="font-semibold mb-2">Select Groups</div>
            <div className="flex flex-wrap gap-2">
              {wordGroups?.map(({ group }) => (
                <label key={group} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedGroups.includes(group)}
                    onCheckedChange={checked => handleGroupChange(group, !!checked)}
                  />
                  <span>Group {group}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Number of Words */}
          <div>
            <label className="font-semibold mb-2 block">Number of Questions</label>
            <Input
              type="text"
              min={1}
              max={maxWords}
              value={numWordsInput}
              onChange={handleNumWordsChange}
              onBlur={handleNumWordsBlur}
              placeholder="10"
              className="w-32"
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={selectedGroups.length === 0}
            />
            {selectedGroups.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">Max: {maxWords}</div>
            )}
          </div>
          {/* Quiz Type */}
          <div>
            <label className="font-semibold mb-2 block">Quiz Type</label>
            <RadioGroup value={quizType} onValueChange={setQuizType} className="flex flex-col gap-2">
              {QUIZ_TYPES.map(type => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={type.value} />
                  <span>{type.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <Button className="w-full mt-4" onClick={handleStartQuiz} disabled={selectedGroups.length === 0 || !clampNumWords(numWordsInput)}>
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 