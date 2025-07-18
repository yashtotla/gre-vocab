import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FlashcardProps {
  word: {
    word: string
    slug: string
    group: number
    definitions: Array<{
      part_of_speech: string
      definition: string
      example: string | null
      synonyms: Array<string>
    }>
  }
  flipped: boolean
  onFlip: () => void
}

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-72 max-w-lg mx-auto cursor-pointer perspective select-none`}
      tabIndex={0}
      onClick={onFlip}
      aria-label={flipped ? `Show front of card for ${word.word}` : `Show back of card for ${word.word}`}
      style={{ minHeight: '18rem' }}
    >
      <div
        className={`absolute w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <Card className="absolute w-full h-full flex items-center justify-center [backface-visibility:hidden]">
          <CardHeader>
            <CardTitle className="text-3xl text-center break-words">{word.word}</CardTitle>
          </CardHeader>
        </Card>
        {/* Back */}
        <Card className="absolute w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center break-words">{word.word}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {word.definitions.map((def, idx) => (
                <div key={idx} className="space-y-1">
                  {idx > 0 && <hr className="my-2 border-gray-200" />}
                  <p className="text-sm text-gray-500">{def.part_of_speech}</p>
                  <p>{def.definition}</p>
                  {def.example && (
                    <p className="text-sm italic text-gray-500">"{def.example}"</p>
                  )}
                  {def.synonyms.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Synonyms:</p>
                      <div className="flex flex-wrap gap-2">
                        {def.synonyms.map(synonym => (
                          <span
                            key={synonym}
                            className="inline-block text-xs bg-gray-100 rounded px-2 py-1 text-gray-700"
                          >
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 