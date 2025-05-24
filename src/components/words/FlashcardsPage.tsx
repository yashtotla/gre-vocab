import { useEffect, useMemo, useState } from 'react'
import { Flashcard } from './Flashcard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useWordGroups } from '@/hooks/useWordGroups'

function shuffleArray<T>(array: Array<T>): Array<T> {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function FlashcardsPage() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffle, setShuffle] = useState(false)

  const { wordGroups, isLoading, selectedWords } = useWordGroups(selectedGroup ? [selectedGroup] : undefined)

  // Get words for the selected group, shuffled if needed
  const groupWords = useMemo(() => {
    return shuffle ? shuffleArray(selectedWords) : selectedWords
  }, [selectedWords, shuffle])

  // Navigation handlers
  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(idx => (idx + 1) % groupWords.length), 200);
  }
  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(idx => (idx - 1 + groupWords.length) % groupWords.length), 200);
  }
  const handleFlip = () => setFlipped(f => !f)

  // Reset index and flip when group or shuffle changes
  useEffect(() => {
    setCurrentIdx(0)
    setFlipped(false)
  }, [selectedGroup, shuffle])

  // Keyboard navigation: left/right for prev/next, space/enter for flip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight') {
        goNext();
      } else if (e.code === 'ArrowLeft') {
        goPrev();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        handleFlip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, handleFlip]);

  const handleRestart = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx(0), 200);
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Flashcards</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select a Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {wordGroups?.map(({ group }) => (
              <Button
                key={group}
                variant={selectedGroup === group ? undefined : 'outline'}
                onClick={() => setSelectedGroup(group)}
              >
                Group {group}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Switch id="shuffle" checked={shuffle} onCheckedChange={setShuffle} />
            <label htmlFor="shuffle" className="text-sm text-gray-700 cursor-pointer select-none">
              Shuffle
            </label>
          </div>
        </CardContent>
      </Card>
      {selectedGroup && groupWords.length > 0 ? (
        <div className="flex flex-col items-center gap-6">
          {/* Progress Bar */}
          <div className="w-full max-w-lg h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / groupWords.length) * 100}%` }}
            />
          </div>
          <Flashcard
            word={groupWords[currentIdx]}
            flipped={flipped}
            onFlip={handleFlip}
          />
          <div className="flex gap-4 mt-4">
            <Button onClick={goPrev} variant="outline">Previous</Button>
            <Button onClick={handleFlip}>{flipped ? 'Show Front' : 'Show Back'}</Button>
            <Button onClick={goNext} variant="outline">Next</Button>
            <Button onClick={handleRestart} variant="secondary">Restart</Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Card {currentIdx + 1} of {groupWords.length}
          </div>
        </div>
      ) : selectedGroup ? (
        <div className="text-center text-gray-400">No words in this group.</div>
      ) : (
        <div className="text-center text-gray-400">Select a group to start practicing flashcards.</div>
      )}
    </div>
  )
} 