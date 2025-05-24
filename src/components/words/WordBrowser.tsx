import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { WordCard } from './WordCard'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWordGroups } from '@/hooks/useWordGroups'

export function WordBrowser() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
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
      threshold: 0.4,
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
        <div className="space-y-6">
          {/* Word Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {wordGroups?.map(({ group }) => (
                  <Button
                    key={group}
                    variant={selectedGroup === group ? undefined : "outline"}
                    onClick={() => setSelectedGroup(group)}
                  >
                    Group {group}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Words in Selected Group */}
          {selectedGroup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wordGroups
                ?.find(g => g.group === selectedGroup)
                ?.words.map(word => (
                  <WordCard key={word.slug} word={word} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
