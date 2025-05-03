import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

function getGridPairCount(gridSize: string) {
  const [rows, cols] = gridSize.split('x').map(Number)
  return (rows * cols) / 2
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Generate synonym pairs where at least one word is from the selected groups
function generateSynonymPairs(words: any[], pairCount: number, allWords: any[]): [string, string][] {
  const selectedWordSet = new Set(words.map((w: any) => w.word))
  const allWordSet = new Set(allWords.map((w: any) => w.word))
  const allPairs: [string, string][] = []
  const used = new Set<string>()
  for (const w of allWords) {
    const syns = w.definitions?.flatMap((d: any) => d.synonyms || []) || []
    for (const syn of syns) {
      if (
        allWordSet.has(syn) &&
        w.word !== syn &&
        !used.has(w.word) &&
        !used.has(syn) &&
        (selectedWordSet.has(w.word) || selectedWordSet.has(syn))
      ) {
        allPairs.push([w.word, syn])
        used.add(w.word)
        used.add(syn)
        break // Only one pair per word
      }
    }
  }
  return shuffle(allPairs).slice(0, pairCount)
}

export default function MatchingGamePage() {
  const [gridSize, setGridSize] = useState('4x4')
  const [gameStarted, setGameStarted] = useState(false)
  const [tiles, setTiles] = useState<{ word: string; pair: string }[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)

  const { data: words, isLoading } = useQuery({
    queryKey: ['vocab'],
    queryFn: async () => {
      const res = await fetch('/data/vocab.json')
      return res.json()
    },
  })

  // Group selection state
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])

  // Get available groups from vocab data
  const groupOptions: number[] = words
    ? Array.from(new Set(words.map((w: any) => w.group))).map(Number).sort((a, b) => a - b)
    : []

  // Only use words from selected groups
  const filteredWords = words && selectedGroups.length > 0
    ? words.filter((w: any) => selectedGroups.includes(w.group))
    : []

  const handleGroupChange = (group: number, checked: boolean) => {
    setSelectedGroups(prev =>
      checked ? [...prev, group] : prev.filter(g => g !== group)
    )
  }

  const handleStart = () => {
    if (!filteredWords.length) return
    const pairCount = getGridPairCount(gridSize)
    const pairs = generateSynonymPairs(filteredWords, pairCount, words)
    const tileObjs = shuffle(
      pairs.flatMap(([a, b]) => [
        { word: a, pair: b },
        { word: b, pair: a },
      ])
    )
    setTiles(tileObjs)
    setMatched(new Set())
    setSelected([])
    setAttempts(0)
    setGameStarted(true)
  }

  const handleTileClick = (idx: number) => {
    if (matched.has(idx) || selected.includes(idx)) return
    if (selected.length === 0) {
      setSelected([idx])
    } else if (selected.length === 1) {
      const firstIdx = selected[0]
      const firstTile = tiles[firstIdx]
      const secondTile = tiles[idx]
      setAttempts(a => a + 1)
      if (firstTile.pair === secondTile.word) {
        setMatched(prev => new Set([...prev, firstIdx, idx]))
        setTimeout(() => setSelected([]), 500)
      } else {
        setTimeout(() => setSelected([]), 700)
      }
      setSelected([firstIdx, idx])
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Matching Game Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="font-semibold mb-2">Select Grid Size</div>
              <RadioGroup value={gridSize} onValueChange={setGridSize} className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="4x3" />
                  <span>4 x 3</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="4x4" />
                  <span>4 x 4</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="4x5" />
                  <span>4 x 5</span>
                </label>
              </RadioGroup>
            </div>
            <div>
              <div className="font-semibold mb-2">Select Groups</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {groupOptions.map((group: number) => (
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
            <Button className="w-full mt-4" onClick={handleStart} disabled={selectedGroups.length === 0}>
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Game board
  const [rows, cols] = gridSize.split('x').map(Number)
  const allMatched = matched.size === tiles.length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-4 flex flex-col items-center">
        <div className="text-lg font-semibold mb-2">Attempts: {attempts}</div>
        <div className="text-lg font-semibold mb-2">Matched Pairs: {matched.size / 2} / {tiles.length / 2}</div>
      </div>
      <div
        className="grid gap-2 bg-white p-2 rounded-xl shadow border max-w-full overflow-x-auto place-items-center"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 200px))`, gridTemplateRows: `repeat(${rows}, minmax(0, 100px))` }}
      >
        {tiles.map((tile, idx) => {
          const isMatched = matched.has(idx)
          const isSelected = selected.includes(idx)
          return (
            <Card
              key={idx}
              className={`h-[100px] w-[200px] cursor-pointer text-lg font-bold transition-all duration-200
                ${isMatched ? 'bg-green-50 opacity-60' : isSelected ? 'bg-blue-100' : ''}`}
              onClick={() => handleTileClick(idx)}
              tabIndex={isMatched ? -1 : 0}
              style={{ outline: isSelected ? '2px solid #2563eb' : undefined }}
            >
              <CardContent className="flex items-center justify-center h-full w-full p-0">
                {isMatched ? <Check className="text-green-500 w-8 h-8" /> : tile.word}
              </CardContent>
            </Card>
          )
        })}
      </div>
      {allMatched && (
        <div className="mt-8 text-center">
          <div className="text-2xl font-bold mb-2">You matched all pairs!</div>
          <div className="mb-4">Attempts: {attempts}</div>
          <Button onClick={() => setGameStarted(false)}>Play Again</Button>
        </div>
      )}
    </div>
  )
} 