import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { WordCard } from './WordCard'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWordGroups } from '@/hooks/useWordGroups'

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

export function WordBrowser() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { wordGroups, isLoading, allWords } = useWordGroups()

  // Fuse.js setup
  const fuse = useMemo(() =>
    new Fuse(allWords, {
      keys: [
        'word',
        'definitions.definition',
        'definitions.example',
        'definitions.synonyms',
      ],
      includeMatches: true,
      threshold: 0.4, // good balance for fuzzy
      minMatchCharLength: 2,
      ignoreLocation: true,
    }),
    [allWords]
  )

  // Fuzzy search logic with highlighting
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) return []
    return fuse.search(debouncedSearch.trim())
  }, [debouncedSearch, fuse])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">GRE Vocabulary</h1>
      <div className="max-w-xl mx-auto mb-8">
        <Input
          placeholder="Search words, definitions, or examples..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setSelectedGroup(null)
            setSelectedWord(null)
          }}
        />
      </div>

      {/* Show search results if searching */}
      {search.trim() ? (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {searchResults.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No results found.</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <>
              {searchResults.length > 10 && (
                <div className="text-xs text-gray-400 mb-2">Showing top 10 of {searchResults.length} results</div>
              )}
              {searchResults.slice(0, 10).map(result => {
                const word = result.item
                // Prepare highlight match data for WordCard
                let wordMatch: Array<[number, number]> = []
                const defMatches: Record<number, Array<[number, number]>> = {}
                const exampleMatches: Record<number, Array<[number, number]>> = {}
                const synonymMatches: Record<string, Array<[number, number]> | undefined> = {}
                if (result.matches) {
                  for (const m of result.matches) {
                    if (m.key === 'word') wordMatch = m.indices as Array<[number, number]>
                    if (m.key === 'definitions.definition' && typeof m.refIndex === 'number') {
                      defMatches[m.refIndex] = m.indices as Array<[number, number]>
                    }
                    if (m.key === 'definitions.example' && typeof m.refIndex === 'number') {
                      exampleMatches[m.refIndex] = m.indices as Array<[number, number]>
                    }
                    if (m.key === 'definitions.synonyms' && typeof m.refIndex === 'number' && typeof m.value === 'string') {
                      synonymMatches[`${m.refIndex}-${m.value}`] = m.indices as Array<[number, number]>
                    }
                  }
                }
                return (
                  <WordCard
                    key={word.slug}
                    word={word}
                    highlightMatches={{ wordMatch, defMatches, exampleMatches, synonymMatches }}
                    search={search}
                  />
                )
              })}
            </>
          )}
        </div>
      ) : (
        // Regular group/word browser UI
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
                    variant={selectedGroup === group ? undefined : "outline"}
                    className="w-full"
                    onClick={() => {
                      setSelectedGroup(group)
                      setSelectedWord(null)
                    }}
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
                        variant={selectedWord?.slug === word.slug ? undefined : "outline"}
                        className="w-full"
                        onClick={() => setSelectedWord(word)}
                      >
                        {word.word}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Word Detail View */}
      {selectedWord && (
        <WordCard word={selectedWord} />
      )}
    </div>
  )
}
