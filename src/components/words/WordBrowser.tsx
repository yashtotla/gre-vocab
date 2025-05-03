import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Word {
  word: string
  slug: string
  group: number
  pronunciation_url: string
  definitions: Array<{
    part_of_speech: string
    definition: string
    example: string | null
    synonyms: Array<string>
  }>
}

interface WordGroup {
  group: number
  words: Array<Word>
}

export function WordBrowser() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)

  const { data: wordGroups, isLoading } = useQuery<Array<WordGroup>>({
    queryKey: ['wordGroups'],
    queryFn: async () => {
      const response = await fetch('/data/vocab.json')
      const words: Array<Word> = await response.json()
      
      // Group words by their group number
      const groups = words.reduce((acc: { [key: number]: Array<Word> }, word) => {
        const groupWords = acc[word.group] ?? []
        acc[word.group] = [...groupWords, word]
        return acc
      }, {})

      // Convert to array and sort by group number
      return Object.entries(groups)
        .map(([group, groupWords]) => ({
          group: parseInt(group),
          words: groupWords.sort((a, b) => a.word.localeCompare(b.word))
        }))
        .sort((a, b) => a.group - b.group)
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">GRE Vocabulary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Word Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Word Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {wordGroups?.map(({ group }) => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? "default" : "outline"}
                  onClick={() => setSelectedGroup(group)}
                  className="w-full"
                >
                  Group {group}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Words in Selected Group */}
        {selectedGroup && (
          <Card>
            <CardHeader>
              <CardTitle>Words in Group {selectedGroup}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wordGroups
                  ?.find(g => g.group === selectedGroup)
                  ?.words.map(word => (
                    <Button
                      key={word.slug}
                      variant={selectedWord?.slug === word.slug ? "default" : "outline"}
                      onClick={() => setSelectedWord(word)}
                      className="w-full"
                    >
                      {word.word}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Word Detail View */}
      {selectedWord && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedWord.word}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedWord.definitions.map((def, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {def.part_of_speech}
                  </p>
                  <p>{def.definition}</p>
                  {def.example && (
                    <p className="text-sm italic">"{def.example}"</p>
                  )}
                  {def.synonyms.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Synonyms:</p>
                      <div className="flex flex-wrap gap-2">
                        {def.synonyms.map(synonym => (
                          <Button
                            key={synonym}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const word = wordGroups
                                ?.flatMap(g => g.words)
                                .find(w => w.word.toLowerCase() === synonym.toLowerCase())
                              if (word) {
                                setSelectedWord(word)
                                setSelectedGroup(word.group)
                              }
                            }}
                          >
                            {synonym}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 