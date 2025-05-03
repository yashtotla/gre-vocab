import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const QUIZ_TYPES = [
  { value: 'synonym', label: 'Synonym Matching' },
  { value: 'definition', label: 'Pick the Correct Definition' },
  { value: 'reverse', label: 'Pick the Correct Word for a Definition' },
]

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

  const handleStartQuiz = () => {
    const clamped = clampNumWords(numWordsInput)
    if (!clamped) return
    // TODO: Start the quiz with the selected settings
    alert(`Start quiz: groups=${selectedGroups.join(',')}, numWords=${clamped}, type=${quizType}`)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
            <label className="font-semibold mb-2 block">Number of Words</label>
            <Input
              type="text"
              min={1}
              max={maxWords}
              value={numWordsInput}
              onChange={handleNumWordsChange}
              onBlur={handleNumWordsBlur}
              placeholder="Number of words"
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