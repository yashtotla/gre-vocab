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
  const [wrongPair, setWrongPair] = useState<number[] | null>(null)
  const [inputDisabled, setInputDisabled] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [incorrectAttempts, setIncorrectAttempts] = useState<{ pair: [string, string], count: number }[]>([])

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
    setCurrentStreak(0)
    setIncorrectAttempts([])
    setGameStarted(true)
  }

  const handleTileClick = (idx: number) => {
    if (inputDisabled || matched.has(idx) || selected.includes(idx)) return
    if (selected.length === 0) {
      setSelected([idx])
    } else if (selected.length === 1) {
      const firstIdx = selected[0]
      const firstTile = tiles[firstIdx]
      const secondTile = tiles[idx]
      setAttempts(a => a + 1)
      setSelected([firstIdx, idx])
      setInputDisabled(true)
      if (firstTile.pair === secondTile.word) {
        setTimeout(() => {
          setMatched(prev => new Set([...prev, firstIdx, idx]))
          setCurrentStreak(s => {
            const newStreak = s + 1
            setBestStreak(b => (newStreak > b ? newStreak : b))
            return newStreak
          })
          setSelected([])
          setInputDisabled(false)
        }, 500)
      } else {
        setWrongPair([firstIdx, idx])
        setCurrentStreak(0)
        setIncorrectAttempts(prev => {
          const pair = [firstTile.word, secondTile.word] as [string, string]
          // Check if this pair already exists (in either order)
          const idx = prev.findIndex(
            p => (p.pair[0] === pair[0] && p.pair[1] === pair[1]) || (p.pair[0] === pair[1] && p.pair[1] === pair[0])
          )
          if (idx !== -1) {
            // Increment count
            const updated = [...prev]
            updated[idx] = { ...updated[idx], count: updated[idx].count + 1 }
            return updated
          } else {
            return [...prev, { pair, count: 1 }]
          }
        })
        setTimeout(() => {
          setWrongPair(null)
          setSelected([])
          setInputDisabled(false)
        }, 700)
      }
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!gameStarted) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Matching Game Setup</h1>
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Multi-select */}
            <div>
              <div className="font-semibold mb-2">Select Groups</div>
              <div className="flex flex-wrap gap-2">
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
            {/* Grid Size Selection */}
            <div>
              <label className="font-semibold mb-2 block">Grid Size</label>
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

  if (allMatched) {
    // Prepare matched pairs for review
    const matchedPairs: [string, string][] = []
    const matchedSet = new Set<number>()
    for (let i = 0; i < tiles.length; i++) {
      if (matched.has(i) && !matchedSet.has(i)) {
        const word = tiles[i].word
        const pairWord = tiles[i].pair
        // Find the index of the pair
        const pairIdx = tiles.findIndex((t, idx) => t.word === pairWord && t.pair === word && matched.has(idx) && idx !== i)
        if (pairIdx !== -1 && !matchedSet.has(pairIdx)) {
          matchedPairs.push([word, pairWord])
          matchedSet.add(i)
          matchedSet.add(pairIdx)
        }
      }
    }
    // Sort incorrect attempts by count descending
    const sortedIncorrect = [...incorrectAttempts].sort((a, b) => b.count - a.count)
    return (
      <div className="flex items-center justify-center text-center mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Game Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Matched Pairs: {tiles.length / 2}</div>
            <div className="mb-2">Attempts: {attempts}</div>
            <div className="mb-2 text-lg font-semibold">Best Streak: {bestStreak}</div>
            <div className="mb-8">
              <div className="font-semibold text-center text-lg mb-4">Matched Synonym Pairs</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedPairs.map(([a, b], i) => (
                  <div key={i} className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-900 text-center font-medium shadow-sm">
                    {a} <span className="text-green-700">↔️</span> {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="my-8 border-t border-gray-200"></div>
            <div className="mb-4">
              <div className="font-semibold text-center text-lg mb-4">Incorrect Attempts</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedIncorrect.length === 0 && <div className="text-gray-500 text-center w-full col-span-1 sm:col-span-2">No mistakes! 🎉</div>}
                {sortedIncorrect.map((item, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-900 text-center font-medium shadow-sm">
                    {item.pair[0]} <span className="text-red-700">&amp;</span> {item.pair[1]} <span className="text-xs">({item.count}x)</span>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => setGameStarted(false)} className="mt-4">Play Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center mt-10">
      <Card>
        <CardContent>
          <div className="flex flex-col items-center mb-4">
            <div className="text-lg font-semibold mb-1">Current Streak: {currentStreak}</div>
            <div className="text-lg font-semibold mb-1">Attempts: {attempts}</div>
            <div className="text-lg font-semibold mb-2">Matched Pairs: {matched.size / 2} / {tiles.length / 2}</div>
          </div>
          <div
            className="grid gap-4 bg-white p-4 rounded-xl shadow border max-w-full overflow-x-auto place-items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 160px))`, gridTemplateRows: `repeat(${rows}, minmax(0, 80px))` }}
          >
            {tiles.map((tile, idx) => {
              const isMatched = matched.has(idx)
              const isSelected = selected.includes(idx)
              const isWrong = wrongPair && wrongPair.includes(idx)
              return (
                <Card
                  key={idx}
                  className={`h-[80px] w-[160px] cursor-pointer text-lg font-bold transition-all duration-200
                    ${isMatched ? 'bg-green-50 opacity-60' : isWrong ? 'bg-red-200/60' : isSelected ? 'bg-blue-100' : ''}`}
                  onClick={() => handleTileClick(idx)}
                  tabIndex={isMatched ? -1 : 0}
                  style={{ outline: isSelected && !isWrong ? '2px solid #2563eb' : undefined }}
                >
                  <CardContent className="flex items-center justify-center h-full w-full p-0">
                    {isMatched ? <Check className="text-green-500 w-8 h-8" /> : tile.word}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 